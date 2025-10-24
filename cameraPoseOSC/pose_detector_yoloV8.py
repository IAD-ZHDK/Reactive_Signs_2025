import cv2
import numpy as np
from pythonosc import udp_client
import time
import argparse
import json
import os
import socket
import threading
import asyncio
import websockets
from collections import deque
from typing import List, Tuple, Optional

try:
    import torch
    TORCH_AVAILABLE = True
except Exception:
    TORCH_AVAILABLE = False

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("Warning: Ultralytics YOLO not available. Install with: pip install ultralytics")

try:
    import websocket
    WEBSOCKET_AVAILABLE = True
except ImportError:
    WEBSOCKET_AVAILABLE = False
    print("Note: websocket-client not available. Using UDP OSC fallback.")

try:
    from pythonosc.osc_message_builder import OscMessageBuilder
    OSC_MSG_BUILDER_AVAILABLE = True
except Exception:
    OSC_MSG_BUILDER_AVAILABLE = False
    OscMessageBuilder = None

class YOLODetectorOSC:
    def __init__(self, 
                 osc_host: str = "0.0.0.0",
                 osc_port: int = 8025,
                 camera_id: int = 0,
                 model_name: str = "yolov8n.pt",
                 weights_path: Optional[str] = None,
                 confidence_threshold: float = 0.4,
                 use_websockets: bool = True):
        
        if not YOLO_AVAILABLE:
            raise ImportError("Ultralytics YOLO is required. Install with: pip install ultralytics")
        
        # Store OSC settings
        self.osc_host = osc_host
        self.osc_port = osc_port
        self.use_websockets = use_websockets
        self.ws_clients = set()
        self.frame_count = 0
        self.process_every_n_frames = 1  # Process every frame by default
        self.inference_size = 256  # Default inference size (smaller for speed)

        # Timing accumulators for perf debugging (seconds)
        self.timing = {'decode': 0.0, 'preprocess': 0.0, 'inference': 0.0, 'draw': 0.0}
        self.timing_count = 0
        self.timing_last_print = time.time()

        # Initialize camera or video file if present
        # Prefer a local test file 'video.MOV' (case-insensitive) if available.
        video_file = None
        candidates = ['video.MOV', 'video.mov']
        # Check working directory first
        for v in candidates:
            if os.path.exists(v):
                video_file = v
                break
        # Then check the script directory
        if video_file is None:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            for v in candidates:
                p = os.path.join(script_dir, v)
                if os.path.exists(p):
                    video_file = p
                    break

        self.video_file = video_file
        self.using_video_file = False
        if video_file:
            print(f"Using video file for input: {video_file}")
            self.cap = cv2.VideoCapture(video_file)
            self.using_video_file = True
        else:
            self.cap = cv2.VideoCapture(camera_id)
        if not self.cap.isOpened():
            raise RuntimeError(f"Could not open video/camera (camera_id={camera_id}, video_file={video_file})")
        
        # Get camera resolution
        self.camera_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.camera_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        print(f"Camera resolution: {self.camera_width}x{self.camera_height}")

        # Initialize enhancement settings
        self.frame_buffer = deque(maxlen=3)
        self.enable_accumulation = False
        self.auto_gain = True
        self.gain = 1.0
        self.brightness = 0
        self.contrast = 1.0
        self.show_enhanced = False
        # Whether to run the model on the enhanced frame (slower but may help in low light)
        self.apply_enhancement_to_inference = False
        # Background subtraction (MOG2)
        self.use_bg_subtraction = False
        self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=16, detectShadows=True)
        self.bg_subtract_learning_rate = -1  # default automatic

        # Configure camera for low light
        self.configure_camera_for_low_light()

        # OSC setup
        if self.use_websockets:
            # event loop for the websocket server thread will be stored here
            self.ws_loop = None
            self.ws_thread = threading.Thread(target=self._run_ws_server)
            self.ws_thread.daemon = True
            self.ws_thread.start()
            print(f"WebSocket server starting on ws://{osc_host}:{osc_port}")
        else:
            self.osc_client = udp_client.SimpleUDPClient(osc_host, osc_port)
            print(f"UDP OSC client targeting {osc_host}:{osc_port}")

        # YOLO setup (allow loading custom weights)
        self.weights_path = weights_path
        try:
            if self.weights_path and os.path.exists(self.weights_path):
                print(f"Loading custom weights: {self.weights_path}")
                self.model = YOLO(self.weights_path)
                loaded_name = self.weights_path
            else:
                self.model = YOLO(model_name)
                loaded_name = model_name
            # Use CUDA if available (guarded)
            if TORCH_AVAILABLE:
                try:
                    self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
                except Exception:
                    self.device = 'cpu'
                try:
                    self.model.to(self.device)
                except Exception:
                    pass
            # If running on CUDA, try set model to half precision for faster inference
            if TORCH_AVAILABLE and self.device == 'cuda':
                try:
                    # ultralytics YOLO model stores PyTorch model in .model
                    if hasattr(self.model, 'model') and hasattr(self.model.model, 'half'):
                        self.model.model.half()
                except Exception:
                    pass
            else:
                self.device = 'cpu'
            print(f"YOLO model loaded: {loaded_name} on {self.device}")
        except Exception as e:
            print(f"Failed to load YOLO model: {e}")
            print("Trying to download default model...")
            self.model = YOLO("yolov8n.pt")

        # Expose class name mapping and detect which index corresponds to 'person'
        try:
            self.class_names = getattr(self.model, 'names', {}) or {}
        except Exception:
            self.class_names = {}

        # person class index (None means fallback to class 0)
        self.person_class_idx = None
        try:
            if isinstance(self.class_names, dict):
                for idx, name in self.class_names.items():
                    if str(name).lower() in ('person', 'people'):
                        self.person_class_idx = int(idx)
                        break
            else:
                for idx, name in enumerate(self.class_names):
                    if str(name).lower() in ('person', 'people'):
                        self.person_class_idx = int(idx)
                        break
        except Exception:
            self.person_class_idx = None

        self.confidence_threshold = confidence_threshold
        
        # Crop settings
        self.crop_x1 = 0
        self.crop_y1 = 0
        self.crop_x2 = self.camera_width
        self.crop_y2 = self.camera_height
        
        # UI state
        self.dragging = False
        self.drag_start = (0, 0)
        self.show_crop_interface = False
        self.show_detections = True
        self.paused = False
        
        # Performance tracking
        self.fps_counter = 0
        self.fps_start_time = time.time()
        self.current_fps = 0
        
        # Settings
        self.settings_file = "detector_settings.json"
        self.load_settings()

        # Smoothed average point for stable output (normalized x,y,z)
        self.smoothed_point = None
        self.smoothing_alpha = 0.2  # base smoothing factor (0-1)

    def update_smoothed_point(self, detected_point: Optional[Tuple[float, float, float]], tracking: bool) -> Tuple[float, float, float]:
        """Update and return smoothed normalized (x,y,z).

        - If detected_point is None, target becomes center of crop (0.5, 0.5) for x,y and 0 for z.
        - Uses exponential moving average with alpha self.smoothing_alpha.
        """
        # Target when no detection: center
        if detected_point is None:
            target = (0.5, 0.5, 0.0)
        else:
            target = detected_point

        if self.smoothed_point is None:
            # initialize directly
            self.smoothed_point = target
            return self.smoothed_point

        alpha = self.smoothing_alpha
        # If tracking is False (no detection), use a slightly higher alpha to move toward center faster
        if not tracking:
            alpha = min(0.4, alpha * 1.5)

        sx, sy, sz = self.smoothed_point
        tx, ty, tz = target
        nx = sx * (1 - alpha) + tx * alpha
        ny = sy * (1 - alpha) + ty * alpha
        nz = sz * (1 - alpha) + tz * alpha
        self.smoothed_point = (nx, ny, nz)
        return self.smoothed_point

    def calculate_average_point(self, results) -> Optional[Tuple[float, float, float]]:
        """Calculate average point from detected person bounding boxes"""
        if not results or len(results) == 0:
            return None
        
        result = results[0]
        person_boxes = []

        # Get dimensions for scaling (crop image size)
        # Use the original image size returned by the model for this result
        crop_height, crop_width = results[0].orig_img.shape[:2]

        # Calculate inference dimensions (how the model may have resized the crop)
        scale = min(self.inference_size / crop_width, self.inference_size / crop_height)
        inference_w = max(1, int(crop_width * scale))
        inference_h = max(1, int(crop_height * scale))

        # Calculate scale factors to map inference coords back to crop coords
        scale_x = crop_width / inference_w
        scale_y = crop_height / inference_h

        # Filter for person class (use detected mapping if available)
        for box in result.boxes:
            cls_idx = int(box.cls)
            # If we detected a person index from the model's names, use it; otherwise default to 0
            if self.person_class_idx is not None:
                if cls_idx != self.person_class_idx:
                    continue
            else:
                if cls_idx != 0:
                    continue

            conf = float(box.conf)
            if conf > self.confidence_threshold:
                # Coordinates in inference space
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()

                # Box center in inference space
                center_x = (x1 + x2) / 2.0
                center_y = (y1 + y2) / 2.0

                # Box area in inference space
                box_w = max(1.0, (x2 - x1))
                box_h = max(1.0, (y2 - y1))
                area_inf = box_w * box_h

                # Map center and area back to crop space
                center_x *= scale_x
                center_y *= scale_y
                area_crop = area_inf * (scale_x * scale_y)

                # Weight by confidence * area (bigger and more confident boxes count more)
                weight = conf * area_crop
                person_boxes.append((center_x, center_y, conf, weight))

        if not person_boxes:
            return None

        # Total weight for centers
        total_weight = sum(p[3] for p in person_boxes)
        if total_weight == 0:
            return None

        # Weighted average of centers
        avg_x = sum(p[0] * p[3] for p in person_boxes) / total_weight
        avg_y = sum(p[1] * p[3] for p in person_boxes) / total_weight

        # Clamp
        avg_x = min(max(0.0, avg_x), float(crop_width))
        avg_y = min(max(0.0, avg_y), float(crop_height))

        # Normalize
        norm_x = avg_x / float(crop_width) if crop_width > 0 else 0.5
        norm_y = avg_y / float(crop_height) if crop_height > 0 else 0.5

        # avg_z: keep as mean confidence across person boxes
        avg_conf = sum(p[2] for p in person_boxes) / len(person_boxes)

        return (norm_x, norm_y, avg_conf)

    def draw_detections(self, image, results):
        """Draw bounding boxes and average point"""
        if not results or len(results) == 0:
            return
                
        result = results[0]
        
        # Get dimensions of cropped and inference frames
        cropped_frame = self.get_cropped_image(image)
        crop_height, crop_width = cropped_frame.shape[:2]
        
        # Calculate scale factors based on the actual inference frame dimensions
        scale = min(self.inference_size / crop_width, self.inference_size / crop_height)
        inference_w = int(crop_width * scale)
        inference_h = int(crop_height * scale)
        scale_x = crop_width / inference_w
        scale_y = crop_height / inference_h
        
        # Draw boxes for persons
        for box in result.boxes:
            cls_idx = int(box.cls)
            # Use detected person index if available, otherwise default to 0
            if self.person_class_idx is not None:
                if cls_idx != self.person_class_idx:
                    continue
            else:
                if cls_idx != 0:
                    continue

            conf = float(box.conf)
            if conf > self.confidence_threshold:
                # Get coordinates from detection
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()

                # Scale coordinates
                x1 = x1 * scale_x
                x2 = x2 * scale_x
                y1 = y1 * scale_y
                y2 = y2 * scale_y

                # Adjust coordinates to main frame
                x1, x2 = x1 + self.crop_x1, x2 + self.crop_x1
                y1, y2 = y1 + self.crop_y1, y2 + self.crop_y1

                # Draw rectangle
                cv2.rectangle(image, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)

                # Draw center point
                center_x = int((x1 + x2) / 2)
                center_y = int((y1 + y2) / 2)
                cv2.circle(image, (center_x, center_y), 4, (0, 0, 255), -1)

                # Draw confidence and coordinates for debugging
                cv2.putText(image, f"conf: {conf:.2f}", (int(x1), int(y1) - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                cv2.putText(image, f"y: {int(y2-y1)}", (int(x1), int(y2) + 20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                    
            
    def configure_camera_for_low_light(self):
        """Configure camera settings for better low-light performance"""
        # Increase exposure time (smaller number means longer exposure)
        self.cap.set(cv2.CAP_PROP_EXPOSURE, -2)  # Try values between -1 and -4
        
        # Increase gain
        self.cap.set(cv2.CAP_PROP_GAIN, 1.0)  # Try values between 1.0 and 2.0
        
        # Some cameras support these additional settings
        try:
            self.cap.set(cv2.CAP_PROP_AUTO_EXPOSURE, 0.75)  # Auto exposure
            self.cap.set(cv2.CAP_PROP_BRIGHTNESS, 0.5)      # Brightness
        except:
            pass

    def enhance_frame(self, frame, for_inference: bool = False):
        """Apply various enhancements to improve low-light performance"""
        # Convert to float32 for processing (keep in 0..1 range)
        frame_float = frame.astype(np.float32) / 255.0

        # Apply temporal averaging if enabled
        if self.enable_accumulation:
            self.frame_buffer.append(frame_float)
            # Average the buffered frames
            accumulated = np.mean(self.frame_buffer, axis=0)
        else:
            accumulated = frame_float

        # Apply manual brightness/contrast in float domain
        # contrast scales the values, brightness shifts the values (both in 0..1 domain)
        enhanced_float = accumulated * self.contrast + (self.brightness / 255.0)

        # Auto gain adjustment if enabled (operate on float image luminance)
        if self.auto_gain:
            # compute mean on luminance (convert to grayscale)
            mean_brightness = np.mean(cv2.cvtColor((np.clip(enhanced_float, 0, 1) * 255).astype(np.uint8), cv2.COLOR_BGR2GRAY) / 255.0)
            if mean_brightness < 0.4:  # Adjust threshold as needed
                self.gain = min(self.gain * 1.1, 3.0)  # Increase gain
            elif mean_brightness > 0.6:
                self.gain = max(self.gain * 0.9, 0.5)  # Decrease gain

        # Apply gain in float domain so effect is visible before conversion
        enhanced_float = enhanced_float * self.gain

        # Convert to uint8 now
        enhanced_uint8 = np.clip(enhanced_float * 255.0, 0, 255).astype(np.uint8)

        # If this is for inference we want to keep processing cheap and deterministic
        if for_inference:
            return enhanced_uint8

        # Optional: Apply adaptive histogram equalization on uint8 after gain for display only
        try:
            lab = cv2.cvtColor(enhanced_uint8, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            l = clahe.apply(l)
            enhanced_uint8 = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)
        except Exception:
            # If CLAHE fails for any reason, fall back to the gain-applied result
            pass

        return enhanced_uint8
    def load_settings(self):
        """Load settings from JSON file if it exists"""
        if os.path.exists(self.settings_file):
            try:
                with open(self.settings_file, 'r') as f:
                    settings = json.load(f)
                    self.crop_x1 = settings.get('crop_x1', self.crop_x1)
                    self.crop_y1 = settings.get('crop_y1', self.crop_y1)
                    self.crop_x2 = settings.get('crop_x2', self.crop_x2)
                    self.crop_y2 = settings.get('crop_y2', self.crop_y2)
                    print("Settings loaded from file")
            except Exception as e:
                print(f"Could not load settings: {e}")
    
    def save_settings(self):
        """Save current settings to JSON file"""
        settings = {
            'crop_x1': self.crop_x1,
            'crop_y1': self.crop_y1,
            'crop_x2': self.crop_x2,
            'crop_y2': self.crop_y2
        }
        try:
            with open(self.settings_file, 'w') as f:
                json.dump(settings, f, indent=2)
            print("Settings saved")
        except Exception as e:
            print(f"Could not save settings: {e}")

    def reset_crop(self):
        """Reset crop area to full camera frame"""
        self.crop_x1 = 0
        self.crop_y1 = 0
        self.crop_x2 = self.camera_width
        self.crop_y2 = self.camera_height
        print("Crop reset to full frame")
    
    def mouse_callback(self, event, x, y, flags, param):
        """Handle mouse events for crop area selection"""
        if not self.show_crop_interface:
            return
            
        if event == cv2.EVENT_LBUTTONDOWN:
            self.dragging = True
            self.drag_start = (x, y)
            self.crop_x1 = x
            self.crop_y1 = y
            
        elif event == cv2.EVENT_MOUSEMOVE and self.dragging:
            self.crop_x2 = x
            self.crop_y2 = y
            
        elif event == cv2.EVENT_LBUTTONUP:
            self.dragging = False
            self.crop_x2 = x
            self.crop_y2 = y
            
            # Ensure crop coordinates are valid
            if self.crop_x1 > self.crop_x2:
                self.crop_x1, self.crop_x2 = self.crop_x2, self.crop_x1
            if self.crop_y1 > self.crop_y2:
                self.crop_y1, self.crop_y2 = self.crop_y2, self.crop_y1
                
            # Clamp to image bounds
            self.crop_x1 = max(0, min(self.crop_x1, self.camera_width))
            self.crop_y1 = max(0, min(self.crop_y1, self.camera_height))
            self.crop_x2 = max(0, min(self.crop_x2, self.camera_width))
            self.crop_y2 = max(0, min(self.crop_y2, self.camera_height))
            
            print(f"Crop area: ({self.crop_x1}, {self.crop_y1}) to ({self.crop_x2}, {self.crop_y2})")
    
    def _run_ws_server(self):
        """Run WebSocket server in separate thread"""
        async def handle_client(websocket):
            self.ws_clients.add(websocket)
            try:
                async for _ in websocket:  # Keep connection alive
                    pass
            finally:
                self.ws_clients.remove(websocket)

        async def serve():
            # capture the running loop so other threads can schedule coroutines on it
            self.ws_loop = asyncio.get_running_loop()
            async with websockets.serve(handle_client, self.osc_host, self.osc_port, subprotocols=["osc"]):
                await asyncio.Future()  # Run forever

        # Run the websocket server in this thread's event loop
        try:
            asyncio.run(serve())
        except Exception as e:
            # If server fails to start, ensure ws_loop is cleared
            self.ws_loop = None
            print(f"WebSocket server error: {e}")

    async def _broadcast_osc(self, message):
        """Broadcast OSC message to all connected clients"""
        disconnected = set()
        for ws in self.ws_clients:
            try:
                await ws.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(ws)
        
        # Remove disconnected clients
        self.ws_clients.difference_update(disconnected)

    def send_osc_data(self, avg_point: Optional[Tuple[float, float, float]], tracking: bool):
        """Send OSC data in format compatible with realSenseOSC system"""
        crop_width = self.crop_x2 - self.crop_x1
        crop_height = self.crop_y2 - self.crop_y1
        
        # Create OSC message
        builder = OscMessageBuilder(address="/depth")
        if avg_point:
            x, y, z = avg_point
            builder.add_arg(int(crop_width), 'i')     # width
            builder.add_arg(int(crop_height), 'i')    # height
            builder.add_arg(bytes([0]), 'b')          # empty depth data as blob
            builder.add_arg(float(1.0 - x), 'f')      # x position (flipped)
            builder.add_arg(float(y), 'f')            # y position
            builder.add_arg(float(z), 'f')            # z position
            builder.add_arg(int(tracking), 'i')       # tracking status
        else:
            builder.add_arg(int(crop_width), 'i')
            builder.add_arg(int(crop_height), 'i')
            builder.add_arg(bytes([0]), 'b')
            builder.add_arg(0.5, 'f')
            builder.add_arg(0.5, 'f')
            builder.add_arg(0.0, 'f')
            builder.add_arg(0, 'i')

        osc_message = builder.build()
        
        if self.use_websockets:
            # Broadcast OSC message to all WebSocket clients.
            # The websocket server runs in a separate thread with its own asyncio loop.
            # Schedule the broadcast on that loop to avoid "Future attached to a different loop" errors.
            try:
                if getattr(self, 'ws_loop', None):
                    asyncio.run_coroutine_threadsafe(self._broadcast_osc(osc_message.dgram), self.ws_loop)
                else:
                    # If loop not ready, fall back to running briefly in a new loop (best-effort)
                    asyncio.run(self._broadcast_osc(osc_message.dgram))
            except Exception as e:
                print(f"WebSocket broadcast scheduling failed: {e}")
        else:
            # Fallback to UDP OSC - send raw datagram via client's socket
            try:
                # python-osc's SimpleUDPClient exposes the socket as _sock
                self.osc_client._sock.sendto(osc_message.dgram, (self.osc_host, self.osc_port))
            except Exception:
                # Last-resort: use send_message without blob support
                try:
                    if avg_point:
                        x, y, z = avg_point
                        self.osc_client.send_message("/depth", [int(crop_width), int(crop_height), 0, float(1.0 - x), float(y), float(z), int(tracking)])
                    else:
                        self.osc_client.send_message("/depth", [int(crop_width), int(crop_height), 0, 0.5, 0.5, 0.0, 0])
                except Exception as e:
                    print(f"Failed to send UDP OSC: {e}")

    def cleanup(self):
        """Clean up resources"""
        print("Cleaning up...")
        self.save_settings()
        self.cap.release()
        cv2.destroyAllWindows()
        # WebSocket cleanup handled by thread daemon status
    
    def get_cropped_image(self, image):
        """Get the cropped portion of the image"""
        return image[self.crop_y1:self.crop_y2, self.crop_x1:self.crop_x2]
    
    def draw_ui(self, image):
        """Draw UI elements on the image"""
        height, width = image.shape[:2]

        # Draw crop rectangle if in crop mode
        if self.show_crop_interface:
            cv2.rectangle(image, (self.crop_x1, self.crop_y1), (self.crop_x2, self.crop_y2), (0, 255, 0), 2)
            cv2.putText(image, "CROP MODE - Click and drag to set crop area",
                        (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        else:
            cv2.rectangle(image, (self.crop_x1, self.crop_y1), (self.crop_x2, self.crop_y2), (255, 255, 0), 2)

        # Draw status information
        status_y = height - 200
        # Try to display a sensible model name if available
        try:
            model_display = getattr(self, 'model_name', None) or getattr(self.model, 'path', None) or self.model.__class__.__name__
        except Exception:
            model_display = 'yolov8n'
        cv2.putText(image, f"Model: {model_display}", (10, status_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
        cv2.putText(image, f"FPS: {self.current_fps}", (10, status_y + 20),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
        cv2.putText(image, f"OSC: /depth -> {self.osc_host}:{self.osc_port}", (10, status_y + 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
        cv2.putText(image, f"Crop: ({self.crop_x1},{self.crop_y1}) to ({self.crop_x2},{self.crop_y2})",
                    (10, status_y + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

        # Editable parameter values (live)
        params_y = status_y + 85
        cv2.putText(image, f"confidence: {self.confidence_threshold:.2f}    inference_size: {self.inference_size}    process_every_n_frames: {self.process_every_n_frames}",
                    (10, params_y), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 0), 1)
        cv2.putText(image, f"gain: {self.gain:.2f}    auto_gain: {int(self.auto_gain)}    accumulation: {int(self.enable_accumulation)}    show_enhanced: {int(self.show_enhanced)}    show_detections: {int(self.show_detections)}",
                    (10, params_y + 18), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 0), 1)
        # Show smoothing alpha and whether enhancement is applied to inference
        cv2.putText(image, f"smoothing_alpha: {self.smoothing_alpha:.3f}    apply_enhancement_to_inference: {int(self.apply_enhancement_to_inference)}", (10, params_y + 36), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 0), 1)
        # Show paused state
        cv2.putText(image, f"paused: {int(self.paused)}", (10, params_y + 54), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200,200,0), 1)
        cv2.putText(image, f"bg_subtract: {int(self.use_bg_subtraction)}  bg_lr: {self.bg_subtract_learning_rate}", (10, params_y + 72), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200,200,0), 1)

        # Draw controls
        controls = [
            "Controls:",
            "C - Toggle crop interface",
            "D - Toggle detections overlay",
            "R - Reset crop area",
            "S - Save settings",
            "E - Toggle display enhancement (CLAHE/gain)",
            "M - Toggle apply enhancement to inference (slower)",
            "A - Toggle frame accumulation (temporal)",
            "G - Toggle auto gain",
            "+ / - - Increase / Decrease manual gain",
            "U / I - Increase / Decrease process_every_n_frames (skip more/less)",
            ", / . - Decrease / Increase confidence threshold",
            "P / O - Increase / Decrease smoothing alpha (less/more smoothing)",
            "SPACE - Pause / Resume",
            "Q / ESC - Quit"
        ]

        for i, control in enumerate(controls):
            cv2.putText(image, control, (width - 700, 30 + i * 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 1)
   
    
    def update_fps(self):
        """Update FPS counter"""
        self.fps_counter += 1
        current_time = time.time()
        if current_time - self.fps_start_time >= 1.0:
            self.current_fps = self.fps_counter
            self.fps_counter = 0
            self.fps_start_time = current_time

    def run(self):
        """Main processing loop"""
        print("Starting YOLO detection...")
        print("Controls: C=crop toggle, D=detections toggle, R=reset crop, S=save, E=enhancement toggle, SPACE=pause, Q=quit")
        
        window_name = 'YOLO Person Detection OSC'
        try:
            cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        except:
            cv2.namedWindow(window_name)
        
        cv2.setMouseCallback(window_name, self.mouse_callback)
        
        try:
            while True:
                ret, frame = self.cap.read()
                if not ret:
                    # If we're using a video file, loop back to start
                    if getattr(self, 'using_video_file', False):
                        print("End of video reached, looping back to start")
                        self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        ret, frame = self.cap.read()
                        if not ret:
                            print("Failed to read from video after seeking to start")
                            break
                    else:
                        print("Failed to read from camera")
                        break
                
                frame = cv2.flip(frame, 1)
                display_frame = frame.copy()  # Copy for display
                
                if not self.paused:
                    # Only process every nth frame
                    self.frame_count += 1
                    if self.frame_count % self.process_every_n_frames == 0:
                        # Get cropped frame first
                        cropped_frame = self.get_cropped_image(frame)

                        # Optionally apply background subtraction to the cropped frame
                        if self.use_bg_subtraction:
                            try:
                                # Apply bg subtractor to obtain mask
                                lr = self.bg_subtract_learning_rate
                                mask = self.bg_subtractor.apply(cropped_frame, learningRate=lr)
                                # Convert mask to 3-channel and apply
                                mask3 = cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR)
                                cropped_frame = cv2.bitwise_and(cropped_frame, mask3)
                            except Exception as e:
                                # If bg subtraction fails, keep raw crop
                                print(f"Background subtraction failed: {e}")
                        
                        if cropped_frame.size > 0:
                            # If enhancement is to be applied to inference, run it on the full-size crop
                            # This avoids mixing frame-buffer entries of different shapes and ensures
                            # accumulation/gain are computed consistently.
                            if self.apply_enhancement_to_inference:
                                try:
                                    enhanced_cropped = self.enhance_frame(cropped_frame, for_inference=True)
                                except Exception:
                                    enhanced_cropped = cropped_frame
                                # Now resize the enhanced crop for inference
                                h, w = enhanced_cropped.shape[:2]
                                scale = min(self.inference_size / w, self.inference_size / h)
                                if scale < 1:
                                    inference_w = int(w * scale)
                                    inference_h = int(h * scale)
                                    inference_frame = cv2.resize(enhanced_cropped, (inference_w, inference_h))
                                else:
                                    inference_frame = enhanced_cropped
                            else:
                                # Resize for inference from the raw crop
                                h, w = cropped_frame.shape[:2]
                                scale = min(self.inference_size / w, self.inference_size / h)
                                if scale < 1:
                                    inference_w = int(w * scale)
                                    inference_h = int(h * scale)
                                    inference_frame = cv2.resize(cropped_frame, (inference_w, inference_h))
                                else:
                                    inference_frame = cropped_frame

                            # Run detection on smaller frame
                            inf_t0 = time.time()
                            # Force model to use a small inference size to avoid internal upscaling
                            try:
                                results = self.model(inference_frame, imgsz=self.inference_size, verbose=False)
                            except TypeError:
                                # older ultralytics versions might not accept imgsz at call; fall back
                                results = self.model(inference_frame, verbose=False)
                            inf_t1 = time.time()
                            inference_time = inf_t1 - inf_t0
                            self.timing['inference'] += inference_time
                            avg_point = self.calculate_average_point(results)
                            tracking = avg_point is not None

                            # Update smoothed point (weighted moving average)
                            smoothed = self.update_smoothed_point(avg_point, tracking)

                            # Send OSC data using smoothed point
                            self.send_osc_data(smoothed, tracking)
                            
                            # Apply image enhancements only to display frame if needed (do NOT use for inference)
                            if self.show_enhanced:
                                display_frame = self.enhance_frame(display_frame)
                            
                            # Draw detections on display frame
                            if self.show_detections:
                                self.draw_detections(display_frame, results)
                                
                                # In the run method, replace the avg_point drawing section:
                                if smoothed:
                                    # Get dimensions of crop area
                                    crop_width = self.crop_x2 - self.crop_x1
                                    crop_height = self.crop_y2 - self.crop_y1

                                    # Map normalized coordinates to crop area using smoothed point
                                    avg_x = int(self.crop_x1 + (smoothed[0] * crop_width))
                                    avg_y = int(self.crop_y1 + (smoothed[1] * crop_height))

                                    # Draw average point
                                    cv2.circle(display_frame, (avg_x, avg_y), 10, (255, 0, 0), -1)
                                    cv2.putText(display_frame, "AVG", (avg_x + 15, avg_y),
                                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
                
                # Measure draw/UI/display time
                draw_t0 = time.time()
                self.draw_ui(display_frame)
                self.update_fps()
                cv2.imshow(window_name, display_frame)
                draw_t1 = time.time()
                draw_time = draw_t1 - draw_t0
                self.timing['draw'] += draw_time

                # Accumulate decode/preprocess counts and print timing once per second
                self.timing_count += 1
                now = time.time()
                if now - self.timing_last_print >= 1.0:
                    # compute averages
                    count = max(1, self.timing_count)
                    avg_decode = self.timing['decode'] / count
                    avg_pre = self.timing['preprocess'] / count
                    avg_inf = self.timing['inference'] / count
                    avg_draw = self.timing['draw'] / count
                    print(f"Timing (s/frame) - decode: {avg_decode:.4f}, preprocess: {avg_pre:.4f}, inference: {avg_inf:.4f}, draw: {avg_draw:.4f}, fps: {self.current_fps}")
                    # reset accumulators
                    self.timing = {'decode': 0.0, 'preprocess': 0.0, 'inference': 0.0, 'draw': 0.0}
                    self.timing_count = 0
                    self.timing_last_print = now
                
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q') or key == 27:  # Q or ESC
                    break
                elif key == ord('c'):
                    self.show_crop_interface = not self.show_crop_interface
                elif key == ord('d'):
                    self.show_detections = not self.show_detections
                elif key == ord('r'):
                    self.reset_crop()
                elif key == ord('s'):
                    self.save_settings()
                elif key == ord('e'):
                    self.show_enhanced = not self.show_enhanced
                elif key == ord('b'):
                    # Toggle background subtraction
                    self.use_bg_subtraction = not self.use_bg_subtraction
                    print(f"Background subtraction: {self.use_bg_subtraction}")
                elif key == ord('z'):
                    # Reset background model
                    self.bg_subtractor = cv2.createBackgroundSubtractorMOG2(history=500, varThreshold=16, detectShadows=True)
                    print("Background model reset")
                elif key == ord('k'):
                    # decrease learning rate (make model learn slower -> smaller magnitude)
                    if self.bg_subtract_learning_rate == -1:
                        self.bg_subtract_learning_rate = 0.001
                    else:
                        self.bg_subtract_learning_rate = max(0.0, self.bg_subtract_learning_rate - 0.001)
                    print(f"bg_subtract_learning_rate: {self.bg_subtract_learning_rate}")
                elif key == ord('l'):
                    # increase learning rate
                    if self.bg_subtract_learning_rate == -1:
                        self.bg_subtract_learning_rate = 0.01
                    else:
                        self.bg_subtract_learning_rate = min(1.0, self.bg_subtract_learning_rate + 0.001)
                    print(f"bg_subtract_learning_rate: {self.bg_subtract_learning_rate}")
                elif key == ord(' '):
                    self.paused = not self.paused
                elif key == ord('a'):
                    self.enable_accumulation = not self.enable_accumulation
                elif key == ord('g'):
                    self.auto_gain = not self.auto_gain
                elif key == ord('+'):
                    self.gain = min(self.gain + 0.1, 2.0)
                elif key == ord('-'):
                    self.gain = max(self.gain - 0.1, 0.5)
                elif key == ord('p'):
                    # Increase smoothing alpha (less smoothing)
                    self.smoothing_alpha = min(0.95, self.smoothing_alpha + 0.05)
                    print(f"Smoothing alpha: {self.smoothing_alpha:.3f}")
                elif key == ord('o'):
                    # Decrease smoothing alpha (more smoothing)
                    self.smoothing_alpha = max(0.01, self.smoothing_alpha - 0.05)
                    print(f"Smoothing alpha: {self.smoothing_alpha:.3f}")
                elif key == ord('m'):
                    # Toggle applying enhancement to inference frame
                    self.apply_enhancement_to_inference = not self.apply_enhancement_to_inference
                    print(f"apply_enhancement_to_inference: {self.apply_enhancement_to_inference}")
                elif key == ord('u'): # Decrease processing frequency (process every more frames)
                    self.process_every_n_frames = min(self.process_every_n_frames + 1, 10)
                    print(f"Processing every {self.process_every_n_frames} frames")
                elif key == ord('i'): # Increase processing frequency (process more often)
                    self.process_every_n_frames = max(self.process_every_n_frames - 1, 1)
                    print(f"Processing every {self.process_every_n_frames} frames")
                elif key == ord(','):
                    # Decrease confidence threshold
                    self.confidence_threshold = max(0.0, self.confidence_threshold - 0.05)
                    print(f"Confidence threshold: {self.confidence_threshold:.2f}")
                elif key == ord('.'):
                    # Increase confidence threshold
                    self.confidence_threshold = min(1.0, self.confidence_threshold + 0.05)
                    print(f"Confidence threshold: {self.confidence_threshold:.2f}")
                    
        except KeyboardInterrupt:
            print("\nInterrupted by user")
        finally:
            self.cleanup()

def main():
    parser = argparse.ArgumentParser(description='YOLO Person Detection with OSC Output')
    parser.add_argument('--osc-host', default='127.0.0.1', help='OSC host address')
    parser.add_argument('--osc-port', type=int, default=8025, help='OSC port')
    parser.add_argument('--camera', type=int, default=0, help='Camera device ID')
    parser.add_argument('--model', default='yolov8n.pt', help='YOLO model name')
    parser.add_argument('--confidence', type=float, default=0.5, help='Confidence threshold')
    parser.add_argument('--weights', default=None, help='Path to custom weights (.pt) to load')
    parser.add_argument('--use-exdark', action='store_true', help='Search local exdark folder for trained weights and use them')
    parser.add_argument('--exdark-path', default='./exdark', help='Path to local exdark repo/folder')
    
    args = parser.parse_args()
    # Determine which weights to use (explicit weights override --use-exdark)
    weights_to_use = args.weights
    if args.use_exdark and not weights_to_use:
        # search the exdark path for likely weights (best.pt, last.pt)
        exdark_dir = os.path.expanduser(args.exdark_path)
        found = []
        if os.path.exists(exdark_dir):
            for root, dirs, files in os.walk(exdark_dir):
                for f in files:
                    if f.endswith('.pt') and ('best' in f.lower() or 'last' in f.lower()):
                        found.append(os.path.join(root, f))
        # If none found, also scan for any .pt
        if not found and os.path.exists(exdark_dir):
            for root, dirs, files in os.walk(exdark_dir):
                for f in files:
                    if f.endswith('.pt'):
                        found.append(os.path.join(root, f))

        if found:
            # prefer best.pt over last.pt
            found.sort(key=lambda p: (0 if 'best' in os.path.basename(p).lower() else 1, p))
            weights_to_use = found[0]
            print(f"Using EXDark weights found at: {weights_to_use}")
        else:
            print(f"No .pt weights found under {exdark_dir}; falling back to default model")

    try:
        detector = YOLODetectorOSC(
            osc_host=args.osc_host,
            osc_port=args.osc_port,
            camera_id=args.camera,
            model_name=args.model,
            weights_path=weights_to_use,
            confidence_threshold=args.confidence
        )
        detector.run()
    except Exception as e:
        print(f"Failed to start detector: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())

