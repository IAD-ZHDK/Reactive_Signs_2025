#!/usr/bin/env python3
"""
YOLO-based Pose Detection with OSC Output
Alternative to MediaPipe for Python 3.13+ compatibility

This version uses Ultralytics YOLO for pose detection instead of MediaPipe
Works with newer Python versions that don't support MediaPipe yet

Requirements:
- OpenCV for camera and GUI
- Ultralytics YOLO for pose detection
- python-osc for OSC communication
- numpy for calculations

Install with: pip install -r requirements_alt.txt
"""

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

class YOLOPoseDetectorOSC:
    def __init__(self, 
                 osc_host: str = "0.0.0.0",  # Changed from 127.0.0.1 to listen on all interfaces
                 osc_port: int = 8025,
                 camera_id: int = 0,
                 model_name: str = "yolov8n-pose.pt",
                 confidence_threshold: float = 0.5,
                 use_websockets: bool = True):  # Default to True
        
        if not YOLO_AVAILABLE:
            raise ImportError("Ultralytics YOLO is required. Install with: pip install ultralytics")
        
        # Store OSC settings
        self.osc_host = osc_host
        self.osc_port = osc_port
        self.use_websockets = use_websockets
        self.ws_clients = set()

        # Initialize camera first
        self.cap = cv2.VideoCapture(camera_id)
        if not self.cap.isOpened():
            raise RuntimeError(f"Could not open camera {camera_id}")
            
        # Get camera resolution
        self.camera_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.camera_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        print(f"Camera resolution: {self.camera_width}x{self.camera_height}")

        # Initialize low-light enhancement settings
        self.frame_buffer = deque(maxlen=3)
        self.enable_accumulation = False
        self.auto_gain = True
        self.gain = 1.0
        self.brightness = 0
        self.contrast = 1.0
        
        # Configure camera for low light after initialization
        self.configure_camera_for_low_light()

        # Remove the old WebSocket client setup
        if self.use_websockets:
            # Start WebSocket server in a separate thread
            self.ws_thread = threading.Thread(target=self._run_ws_server)
            self.ws_thread.daemon = True
            self.ws_thread.start()
            print(f"WebSocket server starting on ws://{osc_host}:{osc_port}")
        else:
            # UDP OSC fallback
            self.osc_client = udp_client.SimpleUDPClient(osc_host, osc_port)
            print(f"UDP OSC client targeting {osc_host}:{osc_port}")

        
        # YOLO pose setup
        try:
            self.model = YOLO(model_name)
            print(f"YOLO model loaded: {model_name}")
        except Exception as e:
            print(f"Failed to load YOLO model: {e}")
            print("Trying to download default model...")
            self.model = YOLO("yolov8n-pose.pt")  # This will download if not present
        
        self.confidence_threshold = confidence_threshold
        
        # Camera setup
        self.cap = cv2.VideoCapture(camera_id)
        if not self.cap.isOpened():
            raise RuntimeError(f"Could not open camera {camera_id}")
            
        # Get camera resolution
        self.camera_width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.camera_height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        print(f"Camera resolution: {self.camera_width}x{self.camera_height}")
        
        # Crop settings (initially no crop)
        self.crop_x1 = 0
        self.crop_y1 = 0
        self.crop_x2 = self.camera_width
        self.crop_y2 = self.camera_height
        
        # UI state
        self.dragging = False
        self.drag_start = (0, 0)
        self.show_crop_interface = True
        self.show_landmarks = True
        self.paused = False
        
        # Performance tracking
        self.fps_counter = 0
        self.fps_start_time = time.time()
        self.current_fps = 0
        
        # Settings
        self.settings_file = "pose_detector_settings.json"
        self.load_settings()
        
        # YOLO pose keypoints (17 keypoints in COCO format)
        self.keypoint_names = [
            "nose", "left_eye", "right_eye", "left_ear", "right_ear",
            "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
            "left_wrist", "right_wrist", "left_hip", "right_hip",
            "left_knee", "right_knee", "left_ankle", "right_ankle"
        ]
        
        # Key points for average calculation (torso and head)
        self.key_indices = [0, 5, 6, 11, 12]  # nose, shoulders, hips
        
    
        
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
    
    def calculate_average_pose_point(self, results) -> Optional[Tuple[float, float, float]]:
        """Calculate average point from detected poses using YOLO keypoints"""
        if not results or len(results) == 0:
            return None
        
        # Get the first (most confident) detection
        result = results[0]
        
        if result.keypoints is None or len(result.keypoints.data) == 0:
            return None
            
        keypoints = result.keypoints.data[0]  # First person's keypoints
        crop_width = self.crop_x2 - self.crop_x1
        crop_height = self.crop_y2 - self.crop_y1
        
        valid_points = []
        
        # Check key indices for visible keypoints
        for idx in self.key_indices:
            if idx < len(keypoints):
                x, y, conf = keypoints[idx]
                if conf > self.confidence_threshold:
                    # Normalize to crop area
                    norm_x = float(x) / crop_width if crop_width > 0 else 0.5
                    norm_y = float(y) / crop_height if crop_height > 0 else 0.5
                    valid_points.append((norm_x, norm_y, float(conf)))
        
        if not valid_points:
            return None
            
        # Calculate weighted average based on confidence
        total_weight = sum(p[2] for p in valid_points)
        if total_weight == 0:
            return None
            
        avg_x = sum(p[0] * p[2] for p in valid_points) / total_weight
        avg_y = sum(p[1] * p[2] for p in valid_points) / total_weight
        avg_z = total_weight / len(valid_points)  # Use average confidence as depth estimate
        
        return (avg_x, avg_y, avg_z)
    
   
    
    def update_fps(self):
        """Update FPS counter"""
        self.fps_counter += 1
        current_time = time.time()
        if current_time - self.fps_start_time >= 1.0:
            self.current_fps = self.fps_counter
            self.fps_counter = 0
            self.fps_start_time = current_time
    
    def draw_ui(self, image):
        """Draw UI elements on the image"""
        height, width = image.shape[:2]
        
        # Draw crop rectangle if in crop mode
        if self.show_crop_interface:
            cv2.rectangle(image, (self.crop_x1, self.crop_y1), (self.crop_x2, self.crop_y2), (0, 255, 0), 2)
            cv2.putText(image, "CROP MODE - Click and drag to set crop area", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Draw status information
        status_y = height - 120
        cv2.putText(image, f"Model: YOLO Pose", (10, status_y), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(image, f"FPS: {self.current_fps}", (10, status_y + 20), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        cv2.putText(image, f"OSC: /depth -> {self.osc_host}:{self.osc_port}", (10, status_y + 40), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(image, f"Crop: ({self.crop_x1},{self.crop_y1}) to ({self.crop_x2},{self.crop_y2})", 
                   (10, status_y + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
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
            "SPACE - Pause/Resume",
            "Q/ESC - Quit"
            
        ]
        
        for i, control in enumerate(controls):
            cv2.putText(image, control, (width - 250, 30 + i * 20), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    
    def draw_pose(self, image, results):
        """Draw pose keypoints and connections on the image"""
        if not results or len(results) == 0:
            return
            
        result = results[0]
        if result.keypoints is None or len(result.keypoints.data) == 0:
            return
            
        keypoints = result.keypoints.data[0]
        
        # Draw keypoints
        for i, (x, y, conf) in enumerate(keypoints):
            if conf > self.confidence_threshold:
                # Adjust coordinates to crop area
                draw_x = int(x + self.crop_x1)
                draw_y = int(y + self.crop_y1)
                cv2.circle(image, (draw_x, draw_y), 3, (0, 255, 0), -1)
        
        # Draw connections (simplified skeleton)
        connections = [
            (0, 1), (0, 2), (1, 3), (2, 4),  # head
            (5, 6), (5, 7), (7, 9), (6, 8), (8, 10),  # arms
            (5, 11), (6, 12), (11, 12),  # torso
            (11, 13), (13, 15), (12, 14), (14, 16)  # legs
        ]
        
        for start_idx, end_idx in connections:
            if start_idx < len(keypoints) and end_idx < len(keypoints):
                start_point = keypoints[start_idx]
                end_point = keypoints[end_idx]
                
                if start_point[2] > self.confidence_threshold and end_point[2] > self.confidence_threshold:
                    start_pos = (int(start_point[0] + self.crop_x1), int(start_point[1] + self.crop_y1))
                    end_pos = (int(end_point[0] + self.crop_x1), int(end_point[1] + self.crop_y1))
                    cv2.line(image, start_pos, end_pos, (255, 0, 0), 2)

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

    def run(self):
        """Main processing loop"""
        print("Starting YOLO pose detection...")
        print("Controls: C=crop toggle, L=landmarks toggle, R=reset crop, S=save, SPACE=pause, Q=quit")
        
        # Create window with fallback for older OpenCV versions
        window_name = 'YOLO Pose Detection OSC'
        try:
            cv2.namedWindow(window_name, cv2.WINDOW_RESIZABLE)
        except AttributeError:
            # Fallback for older OpenCV versions
            cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        cv2.setMouseCallback(window_name, self.mouse_callback)
        
        try:
            while True:
                ret, frame = self.cap.read()
                if not ret:
                    print("Failed to read from camera")
                    break
                
                # Flip frame horizontally for mirror effect
                frame = cv2.flip(frame, 1)
                
                if not self.paused:
                    # Get cropped image for processing
                    # Apply low-light enhancements
                    enhanced_frame = self.enhance_frame(frame)
                    
                    # Get cropped image for processing
                    cropped_frame = self.get_cropped_image(enhanced_frame)
                    
                    if cropped_frame.size > 0:
                        # Run YOLO pose detection
                        results = self.model(cropped_frame, verbose=False)
                        
                        # Calculate average pose point
                        avg_point = self.calculate_average_pose_point(results)
                        tracking = avg_point is not None
                        
                        # Send OSC data
                        self.send_osc_data(avg_point, tracking)
                        
                        # Draw pose landmarks if enabled
                        if self.show_landmarks:
                            self.draw_pose(frame, results)
                            
                            # Draw average point
                            if avg_point:
                                crop_width = self.crop_x2 - self.crop_x1
                                crop_height = self.crop_y2 - self.crop_y1
                                avg_x = int(avg_point[0] * crop_width + self.crop_x1)
                                avg_y = int(avg_point[1] * crop_height + self.crop_y1)
                                cv2.circle(frame, (avg_x, avg_y), 10, (0, 0, 255), -1)
                                cv2.putText(frame, "AVG", (avg_x + 15, avg_y), 
                                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)
                
                # Draw UI
                self.draw_ui(frame)
                self.update_fps()
                
                # Display frame
                cv2.imshow(window_name, frame)
                
                # Handle keyboard input
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q') or key == 27:  # Q or ESC
                    break
                elif key == ord('c'):
                    self.show_crop_interface = not self.show_crop_interface
                    print(f"Crop interface: {'ON' if self.show_crop_interface else 'OFF'}")
                elif key == ord('l'):
                    self.show_landmarks = not self.show_landmarks
                    print(f"Landmarks: {'ON' if self.show_landmarks else 'OFF'}")
                elif key == ord('r'):
                    self.crop_x1 = 0
                    self.crop_y1 = 0
                    self.crop_x2 = self.camera_width
                    self.crop_y2 = self.camera_height
                    print("Crop area reset")
                elif key == ord('s'):
                    self.save_settings()
                elif key == ord(' '):
                    self.paused = not self.paused
                    print(f"{'Paused' if self.paused else 'Resumed'}")
                elif key == ord('a'):
                    self.enable_accumulation = not self.enable_accumulation
                    print(f"Frame accumulation: {'ON' if self.enable_accumulation else 'OFF'}")
                elif key == ord('g'):
                    self.auto_gain = not self.auto_gain
                    print(f"Auto gain: {'ON' if self.auto_gain else 'OFF'}")
                elif key == ord('+'):
                    self.gain = min(self.gain + 0.1, 2.0)
                    print(f"Manual gain: {self.gain:.1f}")
                elif key == ord('-'):
                    self.gain = max(self.gain - 0.1, 0.5)
                    print(f"Manual gain: {self.gain:.1f}")
                    
        except KeyboardInterrupt:
            print("\nInterrupted by user")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            self.cleanup()
    
    def cleanup(self):
        """Clean up resources"""
        print("Cleaning up...")
        self.save_settings()
        self.cap.release()
        cv2.destroyAllWindows()
        if self.ws:
            self.ws.close()
            print("WebSocket connection closed")

def main():
    parser = argparse.ArgumentParser(description='YOLO Pose Detection with OSC Output')
    parser.add_argument('--osc-host', default='127.0.0.1', help='OSC host address')
    parser.add_argument('--osc-port', type=int, default=8025, help='OSC port')
    parser.add_argument('--camera', type=int, default=0, help='Camera device ID')
    parser.add_argument('--model', default='yolov8n-pose.pt', help='YOLO model name')
    parser.add_argument('--confidence', type=float, default=0.5, help='Confidence threshold')
    
    args = parser.parse_args()
    
    try:
        detector = YOLOPoseDetectorOSC(
            osc_host=args.osc_host,
            osc_port=args.osc_port,
            camera_id=args.camera,
            model_name=args.model,
            confidence_threshold=args.confidence
        )
        detector.run()
    except Exception as e:
        print(f"Failed to start pose detector: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())