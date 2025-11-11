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

# Model configurations optimized for different scenarios
AVAILABLE_MODELS = {
    'yolov8n': {
        'name': 'YOLOv8 Nano',
        'file': 'yolov8n.pt',
        'description': 'Fastest, lightweight. Good baseline.',
        'optimized_for': 'speed'
    },
    'yolov8s': {
        'name': 'YOLOv8 Small',
        'file': 'yolov8s.pt',
        'description': 'Balanced speed/accuracy. Better detection than nano.',
        'optimized_for': 'balanced'
    },
    'yolov8m': {
        'name': 'YOLOv8 Medium',
        'file': 'yolov8m.pt',
        'description': 'Higher accuracy. Slower than small.',
        'optimized_for': 'accuracy'
    },
    'yolov8l': {
        'name': 'YOLOv8 Large',
        'file': 'yolov8l.pt',
        'description': 'Best accuracy. Requires good GPU.',
        'optimized_for': 'accuracy'
    },
    'yolov9c': {
        'name': 'YOLOv9 Compact',
        'file': 'yolov9c.pt',
        'description': 'YOLOv9 architecture, improved accuracy.',
        'optimized_for': 'balanced'
    },
    'yolov10n': {
        'name': 'YOLOv10 Nano',
        'file': 'yolov10n.pt',
        'description': 'Latest YOLOv10, fastest version.',
        'optimized_for': 'speed'
    },
    'yolov10s': {
        'name': 'YOLOv10 Small',
        'file': 'yolov10s.pt',
        'description': 'YOLOv10 small, better than nano.',
        'optimized_for': 'balanced'
    },
    'exdark': {
        'name': 'EXDark (Low-Light Optimized)',
        'file': None,  # Custom weights loaded from exdark folder
        'description': 'Trained on EXDark dataset. Best for low-light/night.',
        'optimized_for': 'low-light'
    },
    'rtdetr-l': {
        'name': 'RT-DETR Large',
        'file': 'rtdetr-l.pt',
        'description': 'Real-Time DETR. Fast detection with good accuracy.',
        'optimized_for': 'balanced'
    },
    'rtdetr-x': {
        'name': 'RT-DETR X-Large',
        'file': 'rtdetr-x.pt',
        'description': 'Real-Time DETR X-Large. Better accuracy, slower speed.',
        'optimized_for': 'accuracy'
    }
}

class YOLODetectorOSC:
    def __init__(self, 
                 osc_host: str = "0.0.0.0",
                 osc_port: int = 8025,
                 camera_id: int = 0,
                 model_name: str = "yolov8n.pt",
                 weights_path: Optional[str] = None,
                 confidence_threshold: float = 0.4,
                 use_websockets: bool = True,
                 gpu_id: Optional[int] = None):
        
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
        self.gpu_id = gpu_id  # Store requested GPU ID

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
        self.camera_id = camera_id  # Store camera_id for restart
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
                    if torch.cuda.is_available():
                        gpu_count = torch.cuda.device_count()
                        print(f"\n{'='*60}")
                        print(f"GPU Detection: {gpu_count} CUDA device(s) available")
                        for i in range(gpu_count):
                            gpu_name = torch.cuda.get_device_name(i)
                            gpu_memory = torch.cuda.get_device_properties(i).total_memory / 1024**3
                            print(f"  GPU {i}: {gpu_name} ({gpu_memory:.1f} GB)")
                        print(f"{'='*60}\n")
                        
                        # If specific GPU requested, use it; otherwise use default
                        if self.gpu_id is not None:
                            if self.gpu_id < gpu_count:
                                self.device = f'cuda:{self.gpu_id}'
                                print(f"✓ Using GPU {self.gpu_id}: {torch.cuda.get_device_name(self.gpu_id)}")
                            else:
                                print(f"⚠ Warning: GPU {self.gpu_id} not available. Found {gpu_count} GPU(s). Using default GPU 0.")
                                self.device = 'cuda:0'
                        else:
                            self.device = 'cuda:0'
                            print(f"✓ Using default GPU 0: {torch.cuda.get_device_name(0)}")
                    else:
                        self.device = 'cpu'
                        print(f"\n{'='*60}")
                        print("⚠ No CUDA GPUs detected - using CPU")
                        print(f"{'='*60}\n")
                except Exception as e:
                    self.device = 'cpu'
                    print(f"⚠ GPU detection failed: {e}")
                    print("Falling back to CPU")
                try:
                    self.model.to(self.device)
                except Exception:
                    pass
            # Note: FP16 half precision can cause dtype mismatches with some YOLO models
            # Ultralytics YOLO handles precision internally, so we don't manually call .half()
            
            # Enable half precision (FP16) for CUDA to boost performance
            self.use_fp16 = False  # Track if FP16 is successfully enabled
            if TORCH_AVAILABLE and self.device.startswith('cuda'):
                try:
                    print("Attempting to enable FP16 (half precision) for faster inference...")
                    self.model.model.half()
                    self.use_fp16 = True
                    print("✓ FP16 enabled successfully")
                except Exception as e:
                    print(f"⚠ Could not enable FP16: {e}")
                    print("  Continuing with FP32 (full precision)")
            
            else:
                self.device = 'cpu'
            print(f"\n✓ YOLO model loaded: {loaded_name} on {self.device}\n")
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
        self.crop_click_count = 0  # For two-click crop mode (0, 1, or 2)
        self.current_model_name = model_name  # Track the displayed model name
        self.selected_model_key = 'yolov8n'  # Track which model is selected (for persistence)
        
        # Performance tracking
        self.fps_counter = 0
        self.fps_start_time = time.time()
        self.current_fps = 0
        
        # Flip settings (initialize before load_settings)
        self.flip_horizontal = False  # Mirror the input horizontally
        self.flip_vertical = False    # Mirror the input vertically
        
        # Detection hold: keep showing last known point if detection is lost for a few frames
        self.last_valid_point = None  # Last detected point
        self.frames_without_detection = 0  # Counter for frames without detection
        self.detection_hold_frames = 2  # Number of frames to hold last point (configurable, default=2)
        
        # Settings
        # Use absolute path to settings file in the same directory as this script
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.settings_file = os.path.join(script_dir, "detector_settings.json")
        self.load_settings()

        # Font configuration (DUPLEX is better for small/low-res displays than SIMPLEX)
        self.font = cv2.FONT_HERSHEY_DUPLEX
        self.font_size_title = 0.7      # Large titles (e.g., "CROP MODE")
        self.font_size_main = 0.6       # Main info (e.g., "Model:", "FPS:")
        self.font_size_detail = 0.5     # Details (parameters, crop coords)
        self.font_size_small = 0.4      # Small labels (detections)
        self.font_thickness_bold = 2    # Bold text
        self.font_thickness_normal = 1  # Normal text
        self.font_outline_color = (0, 0, 0)  # Black outline for high contrast
        self.font_outline_thickness = 3  # Outline thickness in pixels

        # Smoothed average point for stable output (normalized x,y,z)
        self.smoothed_point = None
        self.smoothing_alpha = 0.2  # base smoothing factor (0-1)
        
        # Camera freeze detection and auto-restart
        self.last_frame_hash = None  # Hash of last frame to detect frozen camera
        self.last_frame_change_time = time.time()  # Last time frame changed
        self.camera_freeze_threshold = 20.0  # Seconds before considering camera frozen
        self.camera_restart_in_progress = False  # Flag to prevent multiple restart attempts

    def update_smoothed_point(self, detected_point: Optional[Tuple[float, float, float]], tracking: bool) -> Tuple[float, float, float]:
        """Update and return smoothed normalized (x,y,z).

        - If detected_point is not None, save it as last_valid_point and reset hold counter
        - If detection is lost, hold the last valid point for N frames (configurable)
        - After hold frames expire, target becomes center of crop (0.5, 0.5) for x,y and 0 for z
        - Uses exponential moving average with alpha self.smoothing_alpha.
        """
        # If we have a detection, save it and reset hold counter
        if detected_point is not None:
            self.last_valid_point = detected_point
            self.frames_without_detection = 0
            target = detected_point
        else:
            # No detection - increment counter
            self.frames_without_detection += 1
            
            # Check if we should still hold the last valid point
            if self.last_valid_point is not None and self.frames_without_detection <= self.detection_hold_frames:
                # Hold the last valid point (don't move to center yet)
                target = self.last_valid_point
            else:
                # Hold time expired or no previous detection - target center
                target = (0.5, 0.5, 0.0)

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
                self.draw_text_with_outline(image, f"conf: {conf:.2f}", (int(x1), int(y1) - 10),
                            self.font, self.font_size_detail, (0, 255, 0), self.font_thickness_normal)
                self.draw_text_with_outline(image, f"y: {int(y2-y1)}", (int(x1), int(y2) + 20),
                            self.font, self.font_size_detail, (0, 255, 0), self.font_thickness_normal)
                    
            
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

    def draw_text_with_outline(self, image, text, position, font, font_size, font_color, thickness):
        """Draw text with high-contrast black outline for better visibility"""
        # Draw outline in black (multiple passes for better coverage)
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx != 0 or dy != 0:
                    outline_pos = (position[0] + dx, position[1] + dy)
                    cv2.putText(image, text, outline_pos, font, font_size, self.font_outline_color, self.font_outline_thickness)
        # Draw main text on top
        cv2.putText(image, text, position, font, font_size, font_color, thickness)

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
        print(f"Looking for settings file: {self.settings_file}")
        if os.path.exists(self.settings_file):
            try:
                with open(self.settings_file, 'r') as f:
                    settings = json.load(f)
                    self.crop_x1 = settings.get('crop_x1', self.crop_x1)
                    self.crop_y1 = settings.get('crop_y1', self.crop_y1)
                    self.crop_x2 = settings.get('crop_x2', self.crop_x2)
                    self.crop_y2 = settings.get('crop_y2', self.crop_y2)
                    self.detection_hold_frames = settings.get('detection_hold_frames', self.detection_hold_frames)
                    self.flip_horizontal = settings.get('flip_horizontal', self.flip_horizontal)
                    self.flip_vertical = settings.get('flip_vertical', self.flip_vertical)
                    
                    # Load model selection if saved
                    saved_model = settings.get('current_model', None)
                    print(f"DEBUG: saved_model from JSON: {saved_model}")
                    print(f"DEBUG: current_model_name: {self.current_model_name}")
                    if saved_model and saved_model in AVAILABLE_MODELS:
                        self.selected_model_key = saved_model
                        model_file = AVAILABLE_MODELS[saved_model]['file']
                        print(f"DEBUG: model_file for saved_model: {model_file}")
                        print(f"Restoring saved model: {saved_model}")
                        
                        # Special handling for exdark (needs to search for weights)
                        if saved_model == 'exdark':
                            exdark_dir = os.path.expanduser('./exdark')
                            found = []
                            if os.path.exists(exdark_dir):
                                # Look for best.pt or last.pt first
                                for root, dirs, files in os.walk(exdark_dir):
                                    for f in files:
                                        if f.endswith('.pt') and ('best' in f.lower() or 'last' in f.lower()):
                                            found.append(os.path.join(root, f))
                            if not found and os.path.exists(exdark_dir):
                                # If not found, look for any .pt file
                                for root, dirs, files in os.walk(exdark_dir):
                                    for f in files:
                                        if f.endswith('.pt'):
                                            found.append(os.path.join(root, f))
                            if found:
                                # Sort: prefer 'best' over 'last'
                                found.sort(key=lambda p: (0 if 'best' in os.path.basename(p).lower() else 1, p))
                                print(f"  Loading EXDark model: {found[0]}")
                                self.load_model(found[0])
                            else:
                                print("  ✗ EXDark weights not found in ./exdark folder, keeping default model")
                        elif model_file:
                            # Standard model loading
                            print(f"  Loading saved model: {model_file}")
                            self.load_model(model_file)
                    
                    print("Settings loaded from file")
                    print(f"  Flip horizontal: {self.flip_horizontal}")
                    print(f"  Flip vertical: {self.flip_vertical}")
            except Exception as e:
                print(f"Could not load settings: {e}")
        else:
            print(f"Settings file not found at: {self.settings_file}")
    
    def save_settings(self):
        """Save current settings to JSON file"""
        settings = {
            'crop_x1': self.crop_x1,
            'crop_y1': self.crop_y1,
            'crop_x2': self.crop_x2,
            'crop_y2': self.crop_y2,
            'detection_hold_frames': self.detection_hold_frames,
            'current_model': getattr(self, 'selected_model_key', 'yolov8n'),
            'flip_horizontal': self.flip_horizontal,
            'flip_vertical': self.flip_vertical
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
        """Handle mouse events for crop area selection - two-click mode"""
        if not self.show_crop_interface:
            return
        
        if event == cv2.EVENT_LBUTTONDOWN:
            # The window is resized to 1280x720 but the image keeps its original size
            # OpenCV scales the mouse coordinates automatically to match the image size
            # So we can use x, y directly without scaling
            
            # Clamp coordinates to camera frame bounds
            frame_x = max(0, min(x, self.camera_width - 1))
            frame_y = max(0, min(y, self.camera_height - 1))
            
            if self.crop_click_count == 0:
                # First click: set upper-left corner
                self.crop_x1 = frame_x
                self.crop_y1 = frame_y
                self.crop_click_count = 1
                print(f"Crop point 1 (upper-left): ({self.crop_x1}, {self.crop_y1})")
                
            elif self.crop_click_count == 1:
                # Second click: set lower-right corner
                self.crop_x2 = frame_x
                self.crop_y2 = frame_y
                self.crop_click_count = 0  # Reset for next crop if needed
                
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
                
                print(f"Crop point 2 (lower-right): ({self.crop_x2}, {self.crop_y2})")
                print(f"Crop area set: ({self.crop_x1}, {self.crop_y1}) to ({self.crop_x2}, {self.crop_y2})")
    
    def _run_ws_server(self):
        """Run WebSocket server in separate thread

        Accept clients even when they don't offer a subprotocol (prevents NegotiationError).
        Logs offered and selected subprotocols for debugging.
        """
        # Accept either signature (websocket) or (websocket, path) depending on websockets version
        async def handle_client(websocket, path=None):
            # Log offered subprotocol header and selected subprotocol
            offered = None
            try:
                # Some websockets versions expose headers on the connection object
                offered = websocket.request_headers.get('Sec-WebSocket-Protocol')
            except Exception:
                offered = None

            selected = getattr(websocket, 'subprotocol', None)
            if offered or selected or path is not None:
                print(f"WebSocket connection: path={path!r}, offered={offered!r}, selected={selected!r}")

            self.ws_clients.add(websocket)
            try:
                async for _ in websocket:  # Keep connection alive
                    pass
            finally:
                # Use discard to avoid KeyError if already removed
                self.ws_clients.discard(websocket)

        async def serve():
            # capture the running loop so other threads can schedule coroutines on it
            self.ws_loop = asyncio.get_running_loop()
            # Do not require a specific subprotocol so clients that don't send one are accepted
            async with websockets.serve(handle_client, self.osc_host, self.osc_port, subprotocols=None):
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

    def get_frame_hash(self, frame):
        """Compute a lightweight hash of the frame using mean pixel values"""
        # Using mean of each color channel as a simple hash
        # This is much faster than full hash and sufficient for freeze detection
        return tuple(cv2.mean(frame)[:3])
    
    def restart_camera(self):
        """Restart the camera feed when it appears frozen"""
        if self.camera_restart_in_progress:
            return
        
        self.camera_restart_in_progress = True
        print("⚠️  Camera appears frozen, attempting restart...")
        
        # Release the current camera
        self.cap.release()
        time.sleep(1)
        
        # Reinitialize camera
        self.cap = cv2.VideoCapture(self.camera_id)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.camera_width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.camera_height)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        # Reset freeze detection tracking
        self.last_frame_change_time = time.time()
        self.last_frame_hash = None
        self.camera_restart_in_progress = False
        
        print("✓ Camera restart complete")

    def switch_camera(self, new_camera_id):
        """Switch to a different camera input"""
        if self.using_video_file:
            print("Cannot switch camera - currently using video file")
            return False
        
        print(f"Switching from camera {self.camera_id} to camera {new_camera_id}...")
        
        # Release current camera
        self.cap.release()
        time.sleep(0.5)
        
        # Try to open new camera
        self.cap = cv2.VideoCapture(new_camera_id)
        
        if not self.cap.isOpened():
            print(f"✗ Failed to open camera {new_camera_id}, reverting to camera {self.camera_id}")
            # Revert to previous camera
            self.cap = cv2.VideoCapture(self.camera_id)
            if not self.cap.isOpened():
                raise RuntimeError(f"Failed to revert to camera {self.camera_id}")
            return False
        
        # Update camera_id and settings
        self.camera_id = new_camera_id
        self.camera_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.camera_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Apply camera settings
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.camera_width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.camera_height)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        
        # Reset freeze detection tracking
        self.last_frame_change_time = time.time()
        self.last_frame_hash = None
        
        print(f"✓ Switched to camera {new_camera_id} ({self.camera_width}x{self.camera_height})")
        return True

    def cleanup(self):
        """Clean up resources"""
        print("Cleaning up...")
        self.save_settings()
        self.cap.release()
        cv2.destroyAllWindows()
        # WebSocket cleanup handled by thread daemon status
    
    def load_model(self, model_name: str, weights_path: Optional[str] = None):
        """Load a new model dynamically"""
        try:
            print(f"\n{'='*60}")
            print(f"Loading model: {model_name}")
            if weights_path and os.path.exists(weights_path):
                print(f"Using custom weights: {weights_path}")
                self.model = YOLO(weights_path)
                loaded_name = weights_path
            else:
                self.model = YOLO(model_name)
                loaded_name = model_name
            
            # Move to correct device
            if TORCH_AVAILABLE and hasattr(self, 'device'):
                try:
                    self.model.to(self.device)
                    # Enable FP16 for CUDA if it was successfully enabled initially
                    if self.device.startswith('cuda') and getattr(self, 'use_fp16', False):
                        try:
                            print("Enabling FP16 (half precision)...")
                            self.model.model.half()
                            print("✓ FP16 enabled")
                        except Exception as e:
                            print(f"⚠ FP16 not available: {e}")
                            self.use_fp16 = False
                            print("  Disabling FP16 for this session")
                except Exception:
                    pass
            
            # Update class names
            try:
                self.class_names = getattr(self.model, 'names', {}) or {}
            except Exception:
                self.class_names = {}
            
            # Re-detect person class index
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
            
            # Store the model name for display
            self.current_model_name = loaded_name
            
            print(f"✓ Model loaded successfully: {loaded_name}")
            print(f"{'='*60}\n")
            return True
        except Exception as e:
            print(f"✗ Failed to load model: {e}")
            print(f"{'='*60}\n")
            return False
    
    def get_cropped_image(self, image):
        """Get the cropped portion of the image"""
        return image[self.crop_y1:self.crop_y2, self.crop_x1:self.crop_x2]
    
    def draw_ui(self, image):
        """Draw minimal UI elements on the main video image (crop interface only)"""
        height, width = image.shape[:2]

        # Draw crop rectangle if in crop mode
        if self.show_crop_interface:
            cv2.rectangle(image, (self.crop_x1, self.crop_y1), (self.crop_x2, self.crop_y2), (0, 255, 0), 2)
            # Draw corner circles to indicate crop points
            cv2.circle(image, (self.crop_x1, self.crop_y1), 8, (0, 255, 0), -1)
            cv2.circle(image, (self.crop_x2, self.crop_y2), 8, (0, 255, 0), -1)
            
            if self.crop_click_count == 0:
                self.draw_text_with_outline(image, "CROP MODE - Click upper-left corner",
                            (10, 30), self.font, self.font_size_title, (0, 255, 0), self.font_thickness_bold)
            else:
                self.draw_text_with_outline(image, "CROP MODE - Click lower-right corner",
                            (10, 30), self.font, self.font_size_title, (255, 165, 0), self.font_thickness_bold)
        else:
            cv2.rectangle(image, (self.crop_x1, self.crop_y1), (self.crop_x2, self.crop_y2), (255, 255, 0), 2)

    def create_controls_image(self):
        """Create a controls reference image to display in separate window"""
        width, height = 1200, 1600  # Increased height to show all shortcuts
        controls_image = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Display the currently loaded model name
        model_display = getattr(self, 'current_model_name', 'yolov8n')
        
        # Build the controls text
        controls = [
            "=== CONTROLS & PARAMETERS ===",
            "",
            "DISPLAY:",
            f"  Model: {model_display} | FPS: {self.current_fps}",
            f"  Camera ID: {self.camera_id} | Resolution: {self.camera_width}x{self.camera_height}",
            f"  Device: {getattr(self, 'device', 'unknown')} | Crop size: {self.crop_x2-self.crop_x1}x{self.crop_y2-self.crop_y1}",
            f"  OSC: /depth -> {self.osc_host}:{self.osc_port}",
            f"  Crop: ({self.crop_x1},{self.crop_y1}) to ({self.crop_x2},{self.crop_y2})",
            "",
            "CURRENT PARAMETERS:",
            f"  confidence: {self.confidence_threshold:.2f}  |  inference_size: {self.inference_size}",
            f"  process_every_n_frames: {self.process_every_n_frames}  |  paused: {int(self.paused)}",
            f"  gain: {self.gain:.2f}  |  auto_gain: {int(self.auto_gain)}",
            f"  smoothing_alpha: {self.smoothing_alpha:.3f}  |  detection_hold_frames: {self.detection_hold_frames}",
            f"  frame_accumulation: {int(self.enable_accumulation)}  |  bg_subtract: {int(self.use_bg_subtraction)}",
            f"  show_enhanced: {int(self.show_enhanced)}  |  apply_enhancement_to_inference: {int(self.apply_enhancement_to_inference)}",
            f"  flip_horizontal: {int(self.flip_horizontal)}  |  flip_vertical: {int(self.flip_vertical)}",
            "",
            "=== KEYBOARD SHORTCUTS ===",
            "",
            "INTERFACE:",
            "  C - Toggle crop interface (then click 2 points: upper-left, lower-right)",
            "  D - Toggle detections overlay",
            "  R - Reset crop area",
            "  S - Save settings",
            "  Y - Show performance diagnostics (GPU/memory info)",
            "  SPACE - Pause / Resume",
            "  Q / ESC - Quit",
            "",
            "IMAGE PROCESSING:",
            "  E - Toggle display enhancement (CLAHE/gain)",
            "  M - Toggle apply enhancement to inference (slower)",
            "  A - Toggle frame accumulation (temporal smoothing)",
            "  G - Toggle auto gain",
            "  + / - - Increase / Decrease manual gain",
            "  B - Toggle background subtraction",
            "  V / W - Adjust background subtraction learning rate",
            "  H - Toggle horizontal flip",
            "  F - Toggle vertical flip",
            "",
            "CAMERA:",
            "  X - Manual camera restart (if frozen)",
            "  Z / N - Switch to previous / next camera input",
            "",
            "DETECTION:",
            "  U / I - Decrease / Increase process_every_n_frames (optimize speed)",
            "  , / . - Decrease / Increase confidence threshold",
            "",
            "SMOOTHING & FLICKER:",
            "  P / O - Increase / Decrease smoothing alpha (less/more smoothing)",
            "  [ / ] - Decrease / Increase detection hold frames (anti-flicker buffer)",
            "  Note: Anti-flicker works best when using reduced processing frequency (U key)",
            "",
            "MODEL SELECTION (Press 1-9):",
            "  1 - YOLOv8 Nano (fastest)",
            "  2 - YOLOv8 Small (balanced)",
            "  3 - YOLOv8 Medium (accurate)",
            "  4 - YOLOv8 Large (most accurate)",
            "  5 - YOLOv9 Compact",
            "  6 - YOLOv10 Nano",
            "  7 - YOLOv10 Small",
            "  8 - EXDark (low-light optimized)",
            "  9 - RT-DETR (real-time detection)",
        ]
        
        y_offset = 30
        for line in controls:
            if line.startswith("==="):
                # Section headers in bright cyan
                self.draw_text_with_outline(controls_image, line, (20, y_offset),
                            self.font, self.font_size_main, (255, 255, 0), self.font_thickness_bold)
            elif line.startswith("  "):
                # Indented content in yellow
                self.draw_text_with_outline(controls_image, line, (20, y_offset),
                            self.font, self.font_size_detail, (200, 255, 0), self.font_thickness_normal)
            elif line == "":
                # Empty line for spacing
                pass
            else:
                # Category headers in white
                self.draw_text_with_outline(controls_image, line, (20, y_offset),
                            self.font, self.font_size_main, (255, 255, 255), self.font_thickness_bold)
            
            y_offset += 24
        
        return controls_image
   
    
    def scale_font_size(self, base_size: float) -> float:
        """Scale font size based on display resolution"""
        # Use display width as reference (assume 1920px is the "normal" size)
        display_width = self.camera_width * 0.6  # or whatever scale factor you use
        scale = display_width / 1920.0
        return max(0.3, base_size * scale)  # Min 0.3 to keep readable

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
        print("Controls: C=crop toggle, D=detections toggle, R=reset crop, S=save, E=enhancement toggle, H/F=flip, X=restart camera, SPACE=pause, Q=quit")
        
        window_name = 'YOLO Person Detection OSC'
        controls_window_name = 'Controls & Shortcuts'
        
        try:
            cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        except:
            cv2.namedWindow(window_name)
            
        # Force a consistent display size across platforms
        display_width = 1280
        display_height = 720
        cv2.resizeWindow(window_name, display_width, display_height)

        # Create controls window
        try:
            cv2.namedWindow(controls_window_name, cv2.WINDOW_NORMAL)
        except:
            cv2.namedWindow(controls_window_name)
        cv2.resizeWindow(controls_window_name, 1200, 1600)

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
                
                # Apply flip based on settings
                # flipCode: 0 = vertical, 1 = horizontal, -1 = both
                if self.flip_horizontal and self.flip_vertical:
                    frame = cv2.flip(frame, -1)  # Flip both axes
                elif self.flip_horizontal:
                    frame = cv2.flip(frame, 1)   # Flip horizontally
                elif self.flip_vertical:
                    frame = cv2.flip(frame, 0)   # Flip vertically
                
                # Check for frozen camera (only for live camera, not video files)
                if not getattr(self, 'using_video_file', False):
                    frame_hash = self.get_frame_hash(frame)
                    if frame_hash != self.last_frame_hash:
                        # Frame has changed, update tracking
                        self.last_frame_hash = frame_hash
                        self.last_frame_change_time = time.time()
                    elif time.time() - self.last_frame_change_time > self.camera_freeze_threshold:
                        # Frame hasn't changed for too long, restart camera
                        self.restart_camera()
                        continue  # Skip this frame and wait for next one
                
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
                            # Use half=True for FP16 on CUDA, and disable augmentation for speed
                            try:
                                # Only use FP16 if it was successfully enabled
                                use_half = getattr(self, 'use_fp16', False)
                                results = self.model(
                                    inference_frame, 
                                    imgsz=self.inference_size, 
                                    verbose=False,
                                    half=use_half,  # Use FP16 only if successfully enabled
                                    augment=False,  # Disable test-time augmentation for speed
                                    agnostic_nms=True  # Faster NMS
                                )
                            except RuntimeError as e:
                                # Handle dtype mismatch errors (FP16/FP32 incompatibility)
                                if 'dtype' in str(e) or 'Half' in str(e):
                                    print(f"\n⚠ FP16 dtype error detected: {e}")
                                    print("Disabling FP16 and retrying with FP32...")
                                    self.use_fp16 = False
                                    # Retry without FP16
                                    try:
                                        results = self.model(
                                            inference_frame,
                                            imgsz=self.inference_size,
                                            verbose=False,
                                            half=False,
                                            augment=False,
                                            agnostic_nms=True
                                        )
                                    except TypeError:
                                        results = self.model(inference_frame, imgsz=self.inference_size, verbose=False)
                                else:
                                    raise
                            except TypeError:
                                # older ultralytics versions might not accept all params; fall back
                                try:
                                    results = self.model(inference_frame, imgsz=self.inference_size, verbose=False)
                                except TypeError:
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
                                    self.draw_text_with_outline(display_frame, "AVG", (avg_x + 15, avg_y),
                                                self.font, self.font_size_title, (255, 0, 0), self.font_thickness_bold)
                
                # Measure draw/UI/display time
                draw_t0 = time.time()
                self.draw_ui(display_frame)
                self.update_fps()
                cv2.imshow(window_name, display_frame)
                
                # Create and display controls window
                controls_image = self.create_controls_image()
                cv2.imshow(controls_window_name, controls_image)
                
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
                elif key == ord('y'):
                    # Print diagnostic info
                    print("\n" + "="*60)
                    print("PERFORMANCE DIAGNOSTICS")
                    print("="*60)
                    print(f"Device: {getattr(self, 'device', 'unknown')}")
                    print(f"FP16 Enabled: {getattr(self, 'use_fp16', False)}")
                    print(f"FPS: {self.current_fps}")
                    print(f"Crop size: {self.crop_x2-self.crop_x1}x{self.crop_y2-self.crop_y1}")
                    print(f"Inference size: {self.inference_size}")
                    print(f"Process every N frames: {self.process_every_n_frames}")
                    if TORCH_AVAILABLE and hasattr(self, 'device') and self.device.startswith('cuda'):
                        try:
                            gpu_id = int(self.device.split(':')[1]) if ':' in self.device else 0
                            allocated = torch.cuda.memory_allocated(gpu_id) / 1024**3
                            cached = torch.cuda.memory_reserved(gpu_id) / 1024**3
                            total = torch.cuda.get_device_properties(gpu_id).total_memory / 1024**3
                            print(f"GPU Memory: {allocated:.2f}GB allocated, {cached:.2f}GB cached, {total:.1f}GB total")
                            # Check if model is in FP16
                            try:
                                model_dtype = next(self.model.model.parameters()).dtype
                                print(f"Model precision: {model_dtype}")
                            except:
                                pass
                        except Exception as e:
                            print(f"Could not get GPU stats: {e}")
                    print("="*60 + "\n")
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
                    self.smoothing_alpha = min(0.95, self.smoothing_alpha + 0.02)
                    print(f"Smoothing alpha: {self.smoothing_alpha:.3f}")
                elif key == ord('o'):
                    # Decrease smoothing alpha (more smoothing)
                    self.smoothing_alpha = max(0.01, self.smoothing_alpha - 0.02)
                    print(f"Smoothing alpha: {self.smoothing_alpha:.3f}")
                elif key == ord('['):
                    # Decrease detection hold frames (less flickering buffer)
                    self.detection_hold_frames = max(0, self.detection_hold_frames - 1)
                    print(f"Detection hold frames: {self.detection_hold_frames}")
                elif key == ord(']'):
                    # Increase detection hold frames (more flickering buffer)
                    self.detection_hold_frames = min(10, self.detection_hold_frames + 1)
                    print(f"Detection hold frames: {self.detection_hold_frames}")
                elif key == ord('m'):
                    # Toggle applying enhancement to inference frame
                    self.apply_enhancement_to_inference = not self.apply_enhancement_to_inference
                    print(f"apply_enhancement_to_inference: {self.apply_enhancement_to_inference}")
                elif key == ord('h'):
                    # Toggle horizontal flip
                    self.flip_horizontal = not self.flip_horizontal
                    print(f"Flip horizontal: {self.flip_horizontal}")
                elif key == ord('f'):
                    # Toggle vertical flip
                    self.flip_vertical = not self.flip_vertical
                    print(f"Flip vertical: {self.flip_vertical}")
                elif key == ord('x'):
                    # Manual camera restart
                    if not getattr(self, 'using_video_file', False):
                        print("Manual camera restart triggered...")
                        self.restart_camera()
                    else:
                        print("Cannot restart - using video file")
                elif key == ord('z'):
                    # Switch to previous camera
                    if not getattr(self, 'using_video_file', False):
                        new_id = max(0, self.camera_id - 1)
                        if new_id != self.camera_id:
                            self.switch_camera(new_id)
                        else:
                            print(f"Already at camera {self.camera_id} (minimum)")
                    else:
                        print("Cannot switch camera - using video file")
                elif key == ord('n'):
                    # Switch to next camera
                    if not getattr(self, 'using_video_file', False):
                        new_id = self.camera_id + 1
                        self.switch_camera(new_id)  # Will fail gracefully if camera doesn't exist
                    else:
                        print("Cannot switch camera - using video file")
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
                elif key == ord('1'):
                    # Load YOLOv8 Nano (fastest)
                    if self.load_model(AVAILABLE_MODELS['yolov8n']['file']):
                        self.selected_model_key = 'yolov8n'
                        self.frame_count = 0
                elif key == ord('2'):
                    # Load YOLOv8 Small
                    if self.load_model(AVAILABLE_MODELS['yolov8s']['file']):
                        self.selected_model_key = 'yolov8s'
                        self.frame_count = 0
                elif key == ord('3'):
                    # Load YOLOv8 Medium
                    if self.load_model(AVAILABLE_MODELS['yolov8m']['file']):
                        self.selected_model_key = 'yolov8m'
                        self.frame_count = 0
                elif key == ord('4'):
                    # Load YOLOv8 Large
                    if self.load_model(AVAILABLE_MODELS['yolov8l']['file']):
                        self.selected_model_key = 'yolov8l'
                        self.frame_count = 0
                elif key == ord('5'):
                    # Load YOLOv9 Compact
                    if self.load_model(AVAILABLE_MODELS['yolov9c']['file']):
                        self.selected_model_key = 'yolov9c'
                        self.frame_count = 0
                elif key == ord('6'):
                    # Load YOLOv10 Nano
                    if self.load_model(AVAILABLE_MODELS['yolov10n']['file']):
                        self.selected_model_key = 'yolov10n'
                        self.frame_count = 0
                elif key == ord('7'):
                    # Load YOLOv10 Small
                    if self.load_model(AVAILABLE_MODELS['yolov10s']['file']):
                        self.selected_model_key = 'yolov10s'
                        self.frame_count = 0
                elif key == ord('8'):
                    # Load EXDark (low-light optimized)
                    # EXDark needs custom weights from the exdark folder
                    exdark_dir = os.path.expanduser('./exdark')
                    found = []
                    if os.path.exists(exdark_dir):
                        # First, look for best.pt or last.pt
                        for root, dirs, files in os.walk(exdark_dir):
                            for f in files:
                                if f.endswith('.pt') and ('best' in f.lower() or 'last' in f.lower()):
                                    found.append(os.path.join(root, f))
                    if not found and os.path.exists(exdark_dir):
                        # If not found, look for any .pt file
                        for root, dirs, files in os.walk(exdark_dir):
                            for f in files:
                                if f.endswith('.pt'):
                                    found.append(os.path.join(root, f))
                    if found:
                        # Sort: prefer 'best' over 'last', then alphabetically
                        found.sort(key=lambda p: (0 if 'best' in os.path.basename(p).lower() else 1, p))
                        if self.load_model(found[0]):
                            self.selected_model_key = 'exdark'
                            self.frame_count = 0
                    else:
                        print("✗ No EXDark weights found in ./exdark folder")
                        print("  Please place your trained EXDark weights (e.g., best.pt) in ./exdark/")
                elif key == ord('9'):
                    # Load RT-DETR
                    if self.load_model(AVAILABLE_MODELS['rtdetr-x']['file']):
                        self.selected_model_key = 'rtdetr-x'
                        self.frame_count = 0
                    
        except KeyboardInterrupt:
            print("\nInterrupted by user")
        finally:
            self.cleanup()

def ensure_model_available(model_file):
    """
    Ensure a model file is available. If not found locally, attempt to download it.
    
    Args:
        model_file: Name of the model file (e.g., 'yolov8n.pt', 'yolov8s.pt')
    
    Returns:
        True if model is available, False otherwise
    """
    if model_file is None:
        return False
    
    # Check if file exists locally
    if os.path.exists(model_file):
        return True
    
    print(f"\n{'='*70}")
    print(f"Model not found: {model_file}")
    print(f"Attempting to download from Ultralytics...")
    print(f"{'='*70}")
    
    try:
        from ultralytics import YOLO
        
        # Try to download by creating a YOLO instance with the model name
        # This will automatically download if not found
        print(f"Downloading {model_file}...")
        model = YOLO(model_file)
        
        print(f"✓ Model downloaded successfully!")
        print(f"{'='*70}\n")
        return True
        
    except Exception as e:
        print(f"✗ Failed to download model {model_file}: {e}")
        print(f"Please download manually or use an available model")
        print(f"{'='*70}\n")
        return False

def ensure_exdark_available(exdark_path='./exdark'):
    """
    Ensure EXDark weights are available. If not found, offer to download them.
    
    Args:
        exdark_path: Path to the exdark directory
    
    Returns:
        Path to the best.pt or last.pt file if found, None otherwise
    """
    exdark_dir = os.path.expanduser(exdark_path)
    
    # First check if weights already exist
    found = []
    if os.path.exists(exdark_dir):
        for root, dirs, files in os.walk(exdark_dir):
            for f in files:
                if f.endswith('.pt') and ('best' in f.lower() or 'last' in f.lower()):
                    found.append(os.path.join(root, f))
    
    if not found and os.path.exists(exdark_dir):
        for root, dirs, files in os.walk(exdark_dir):
            for f in files:
                if f.endswith('.pt'):
                    found.append(os.path.join(root, f))
    
    if found:
        # Prefer best.pt over last.pt
        found.sort(key=lambda p: (0 if 'best' in os.path.basename(p).lower() else 1, p))
        return found[0]
    
    # EXDark weights not found - try to provide guidance
    print(f"\n{'='*70}")
    print(f"EXDark low-light weights not found at: {exdark_dir}")
    print(f"{'='*70}")
    print(f"\nTo use EXDark for low-light detection, you have two options:\n")
    print(f"Option 1: Clone the EXDark repository")
    print(f"  git clone https://github.com/Chongyi-MARL/EXDark.git exdark")
    print(f"  This will provide the best.pt weights in ./exdark/best.pt\n")
    print(f"Option 2: Place your trained EXDark .pt file in {exdark_dir}/")
    print(f"  The script will automatically find it.\n")
    print(f"For now, using standard YOLOv8 models instead.")
    print(f"{'='*70}\n")
    
    return None

def main():
    parser = argparse.ArgumentParser(description='YOLO Person Detection with OSC Output')
    parser.add_argument('--osc-host', default='127.0.0.1', help='OSC host address')
    parser.add_argument('--osc-port', type=int, default=8025, help='OSC port')
    parser.add_argument('--camera', type=int, default=0, help='Camera device ID')
    parser.add_argument('--model', default='yolov8n.pt', help='YOLO model name or key (e.g., yolov8s, yolov10n, exdark)')
    parser.add_argument('--confidence', type=float, default=0.5, help='Confidence threshold')
    parser.add_argument('--weights', default=None, help='Path to custom weights (.pt) to load')
    parser.add_argument('--use-exdark', action='store_true', help='Search local exdark folder for trained weights and use them')
    parser.add_argument('--exdark-path', default='./exdark', help='Path to local exdark repo/folder')
    parser.add_argument('--gpu', type=int, default=None, help='GPU device ID to use (e.g., 0, 1, 2). If not specified, uses default CUDA device.')
    parser.add_argument('--list-models', action='store_true', help='List available models and exit')
    
    args = parser.parse_args()
    
    # If user wants to see available models
    if args.list_models:
        print("\n" + "="*70)
        print("Available Models for Low-Light Person Detection")
        print("="*70)
        for key, config in AVAILABLE_MODELS.items():
            print(f"\n{config['name']} ({key})")
            print(f"  File: {config['file'] if config['file'] else 'Custom weights from exdark folder'}")
            print(f"  Optimized for: {config['optimized_for']}")
            print(f"  {config['description']}")
        print("\n" + "="*70)
        print("Usage: python pose_detector_yoloV8.py --model <key>")
        print("Example: python pose_detector_yoloV8.py --model yolov8s")
        print("Example: python pose_detector_yoloV8.py --use-exdark (for low-light)")
        print("="*70 + "\n")
        return 0
    
    # Determine which weights to use (explicit weights override --use-exdark)
    weights_to_use = args.weights
    model_name = args.model
    
    # Check if model argument is a key in AVAILABLE_MODELS
    if model_name in AVAILABLE_MODELS and not weights_to_use:
        model_config = AVAILABLE_MODELS[model_name]
        if model_config['file']:
            model_name = model_config['file']
            # Ensure this model is available (download if needed)
            if not ensure_model_available(model_name):
                print(f"Warning: Could not ensure model {model_name} is available")
        print(f"\n✓ Using model preset: {model_config['name']}")
        print(f"  Optimized for: {model_config['optimized_for']}")
    
    if args.use_exdark and not weights_to_use:
        # Use helper function to find or guide user to EXDark weights
        exdark_weights = ensure_exdark_available(args.exdark_path)
        if exdark_weights:
            weights_to_use = exdark_weights
            print(f"✓ Using EXDark weights (low-light optimized) found at: {weights_to_use}")
        else:
            print(f"No EXDark weights found. Using standard YOLOv8 model instead.")
    
    # Ensure the default model is available if no other model specified
    if not weights_to_use and not (args.use_exdark and not ensure_model_available(model_name)):
        if not ensure_model_available(model_name):
            print(f"Warning: Could not ensure model {model_name} is available")

    try:
        detector = YOLODetectorOSC(
            osc_host=args.osc_host,
            osc_port=args.osc_port,
            camera_id=args.camera,
            model_name=model_name,
            weights_path=weights_to_use,
            confidence_threshold=args.confidence,
            gpu_id=args.gpu
        )
        detector.run()
    except Exception as e:
        print(f"Failed to start detector: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())

