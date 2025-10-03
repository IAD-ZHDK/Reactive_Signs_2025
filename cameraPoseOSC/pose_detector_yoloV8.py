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
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    print("Warning: Ultralytics YOLO not available. Install with: pip install ultralytics")

try:
    import websocket
    from pythonosc.osc_message_builder import OscMessageBuilder
    WEBSOCKET_AVAILABLE = True
except ImportError:
    WEBSOCKET_AVAILABLE = False
    print("Note: websocket-client not available. Using UDP OSC fallback.")

class YOLODetectorOSC:
    def __init__(self, 
                 osc_host: str = "0.0.0.0",
                 osc_port: int = 8025,
                 camera_id: int = 0,
                 model_name: str = "yolov8n.pt",
                 confidence_threshold: float = 0.7,
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
        self.inference_size = 320  # Default inference size

        # Initialize camera
        self.cap = cv2.VideoCapture(camera_id)
        if not self.cap.isOpened():
            raise RuntimeError(f"Could not open camera {camera_id}")
        
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

        # Configure camera for low light
        self.configure_camera_for_low_light()

        # OSC setup
        if self.use_websockets:
            self.ws_thread = threading.Thread(target=self._run_ws_server)
            self.ws_thread.daemon = True
            self.ws_thread.start()
            print(f"WebSocket server starting on ws://{osc_host}:{osc_port}")
        else:
            self.osc_client = udp_client.SimpleUDPClient(osc_host, osc_port)
            print(f"UDP OSC client targeting {osc_host}:{osc_port}")

        # YOLO setup
        try:
            self.model = YOLO(model_name)
               # Use CUDA if available
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
            self.model.to(self.device)
            print(f"YOLO model loaded: {model_name} on {self.device}")
        except Exception as e:
            print(f"Failed to load YOLO model: {e}")
            print("Trying to download default model...")
            self.model = YOLO("yolov8n.pt")

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

    def calculate_average_point(self, results) -> Optional[Tuple[float, float, float]]:
        """Calculate average point from detected person bounding boxes"""
        if not results or len(results) == 0:
            return None
        
        result = results[0]
        person_boxes = []
        
        # Get dimensions for scaling
        crop_height, crop_width = results[0].orig_img.shape[:2]
        
        # Calculate inference dimensions
        scale = min(self.inference_size / crop_width, self.inference_size / crop_height)
        inference_w = int(crop_width * scale)
        inference_h = int(crop_height * scale)
        
        # Calculate scale factors
        scale_x = crop_width / inference_w
        scale_y = crop_height / inference_h
        
        # Filter for person class (class 0 in COCO dataset)
        for box in result.boxes:
            if int(box.cls) == 0:  # Class 0 is person in COCO
                conf = float(box.conf)
                if conf > self.confidence_threshold:
                    # Get coordinates in inference space
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    # Calculate center point (still in inference space)
                    center_x = (x1 + x2) / 2
                    center_y = (y1 + y2) / 2
                    # Scale back to crop space
                    center_x *= scale_x
                    center_y *= scale_y
                    person_boxes.append((center_x, center_y, conf))
        
        if not person_boxes:
            return None
            
        # Calculate weighted average based on confidence
        total_weight = sum(box[2] for box in person_boxes)
        if total_weight == 0:
            return None
            
        avg_x = sum(box[0] * box[2] for box in person_boxes) / total_weight
        avg_y = sum(box[1] * box[2] for box in person_boxes) / total_weight
        
        # Keep coordinates within crop bounds
        avg_x = min(max(0, avg_x), crop_width)
        avg_y = min(max(0, avg_y), crop_height)
        
        # Normalize coordinates
        norm_x = avg_x / crop_width
        norm_y = avg_y / crop_height
        avg_z = total_weight / len(person_boxes)
        
        return (norm_x, norm_y, avg_z)

    def draw_detections(self, image, results):
        """Draw bounding boxes and average point"""
        if not results or len(results) == 0:
            return
                
        result = results[0]
        
        # Get dimensions of cropped and inference frames
        cropped_frame = self.get_cropped_image(image)
        crop_height, crop_width = cropped_frame.shape[:2]
        
        # Calculate scale factors based on the actual inference frame dimensions$
        scale = min(self.inference_size / crop_width, self.inference_size / crop_height)
        inference_w = int(crop_width * scale)
        inference_h = int(crop_height * scale)
        scale_x = crop_width / inference_w
        scale_y = crop_height / inference_h
        
        # Debug print
        print(f"Crop size: {crop_width}x{crop_height}")
        print(f"Inference size: {inference_w}x{inference_h}")
        print(f"Scale factors: {scale_x:.2f}, {scale_y:.2f}")
        
        # Draw boxes for persons
        for box in result.boxes:
            if int(box.cls) == 0:  # Person class
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

    def enhance_frame(self, frame):
        """Apply various enhancements to improve low-light performance"""
        # Convert to float32 for processing
        frame_float = frame.astype(np.float32) / 255.0
        
        # Apply temporal averaging if enabled
        if self.enable_accumulation:
            self.frame_buffer.append(frame_float)
            # Average the buffered frames
            accumulated = np.mean(self.frame_buffer, axis=0)
        else:
            accumulated = frame_float
        
        # Apply brightness and contrast adjustments
        enhanced = cv2.convertScaleAbs(accumulated, alpha=self.contrast, beta=self.brightness)
        
        # Auto gain adjustment if enabled
        if self.auto_gain:
            mean_brightness = np.mean(enhanced)
            if mean_brightness < 0.4:  # Adjust threshold as needed
                self.gain = min(self.gain * 1.1, 2.0)  # Increase gain
            elif mean_brightness > 0.6:
                self.gain = max(self.gain * 0.9, 1.0)  # Decrease gain
            enhanced = cv2.multiply(enhanced, self.gain)
        
        # Normalize and convert back to uint8
        enhanced = np.clip(enhanced * 255, 0, 255).astype(np.uint8)
        
        # Optional: Apply adaptive histogram equalization
        lab = cv2.cvtColor(enhanced, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        l = clahe.apply(l)
        enhanced = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)
        
        return enhanced
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
            async with websockets.serve(handle_client, self.osc_host, self.osc_port, subprotocols=["osc"]):
                await asyncio.Future()  # Run forever

        asyncio.run(serve())

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
            # Broadcast OSC message to all WebSocket clients
            asyncio.run(self._broadcast_osc(osc_message.dgram))
        else:
            # Fallback to UDP OSC
            self.osc_client.send_message("/depth", message_args)

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
        else :
            cv2.rectangle(image, (self.crop_x1, self.crop_y1), (self.crop_x2, self.crop_y2), (255, 255, 0), 2)
        # Draw status information
        status_y = height - 120
        cv2.putText(image, f"Model: yolov8n", (10, status_y), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
        cv2.putText(image, f"FPS: {self.current_fps}", (10, status_y + 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)
        cv2.putText(image, f"OSC: /depth -> {self.osc_host}:{self.osc_port}", (10, status_y + 40), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
        cv2.putText(image, f"Crop: ({self.crop_x1},{self.crop_y1}) to ({self.crop_x2},{self.crop_y2})", 
                   (10, status_y + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
        
        # Draw controls
        controls = [
            "Controls:",
            "C - Toggle crop interface",
            "L - Toggle landmarks",
            "R - Reset crop area", 
            "S - Save settings",
            "A - Toggle frame accumulation",
            "G - Toggle auto gain",
            "+/- - Adjust manual gain",
            "[ - Decrease processing frequency",
            "] - Increase processing frequency",
            "SPACE - Pause/Resume",
            "Q/ESC - Quit"
            
        ]
        
        for i, control in enumerate(controls):
            cv2.putText(image, control, (width - 250, 30 + i * 20), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 0), 1)
   
    
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
                        
                        if cropped_frame.size > 0:
                            # Resize for inference
                            h, w = cropped_frame.shape[:2]
                            scale = min(self.inference_size / w, self.inference_size / h)
                            if scale < 1:
                                inference_w = int(w * scale)
                                inference_h = int(h * scale)
                                inference_frame = cv2.resize(cropped_frame, (inference_w, inference_h))
                            else:
                                inference_frame = cropped_frame
                            
                            # Run detection on smaller frame
                            results = self.model(inference_frame, verbose=False)
                            avg_point = self.calculate_average_point(results)
                            tracking = avg_point is not None
                            
                            # Send OSC data
                            self.send_osc_data(avg_point, tracking)
                            
                            # Apply image enhancements only to display frame if needed
                            if self.show_enhanced:
                                display_frame = self.enhance_frame(display_frame)
                            
                            # Draw detections on display frame
                            if self.show_detections:
                                self.draw_detections(display_frame, results)
                                
                                # In the run method, replace the avg_point drawing section:
                                if avg_point:
                                    # Get dimensions of crop area
                                    crop_width = self.crop_x2 - self.crop_x1
                                    crop_height = self.crop_y2 - self.crop_y1
                                    
                                    # Map normalized coordinates to crop area
                                    avg_x = int(self.crop_x1 + (avg_point[0] * crop_width))
                                    avg_y = int(self.crop_y1 + (avg_point[1] * crop_height))
                                    
                                    # Draw average point
                                    cv2.circle(display_frame, (avg_x, avg_y), 10, (255, 0, 0), -1)
                                    cv2.putText(display_frame, "AVG", (avg_x + 15, avg_y),
                                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
                
                self.draw_ui(display_frame)
                self.update_fps()
                cv2.imshow(window_name, display_frame)
                
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
                elif key == ord('['): # Decrease processing frequency
                    self.process_every_n_frames = min(self.process_every_n_frames + 1, 10)
                    print(f"Processing every {self.process_every_n_frames} frames")
                elif key == ord(']'): # Increase processing frequency
                    self.process_every_n_frames = max(self.process_every_n_frames - 1, 1)
                    print(f"Processing every {self.process_every_n_frames} frames")    
                    
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
    
    args = parser.parse_args()
    
    try:
        detector = YOLODetectorOSC(
            osc_host=args.osc_host,
            osc_port=args.osc_port,
            camera_id=args.camera,
            model_name=args.model,
            confidence_threshold=args.confidence
        )
        detector.run()
    except Exception as e:
        print(f"Failed to start detector: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())

