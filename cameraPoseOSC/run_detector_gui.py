#!/usr/bin/env python3
"""
Launcher script that shows both camera window and GUI control panel
The detector runs normally, and GUI updates happen via tkinter's after() method
"""

import sys
import argparse
from pose_detector_yoloV8 import YOLODetectorOSC

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='YOLO Pose Detector with GUI')
    parser.add_argument('--camera', type=int, default=0, help='Camera ID (default: 0)')
    parser.add_argument('--gpu', type=int, default=None, help='GPU device ID (default: auto-detect)')
    parser.add_argument('--model', type=str, default='yolov8n.pt', help='Model file (default: yolov8n.pt)')
    parser.add_argument('--host', type=str, default='127.0.0.1', help='OSC host (default: 127.0.0.1)')
    parser.add_argument('--port', type=int, default=8080, help='OSC port (default: 8080)')
    parser.add_argument('--websockets', action='store_true', help='Use WebSockets instead of UDP')
    args = parser.parse_args()
    
    print("Starting detector with GUI...")
    print("Note: Close the camera window (press Q) to exit")
    
    # Create detector instance with arguments
    detector = YOLODetectorOSC(
        camera_id=args.camera,
        gpu_id=args.gpu,
        model_name=args.model,
        osc_host=args.host,
        osc_port=args.port,
        use_websockets=args.websockets
    )
    
    # Launch GUI in non-blocking mode
    try:
        from detector_gui import DetectorGUI
        gui = DetectorGUI(detector)
        # Show GUI window without blocking
        gui.root.update()
        print("✓ GUI window created")
    except Exception as e:
        print(f"⚠ GUI failed to launch: {e}")
        gui = None
    
    # Run detector (this will block and show camera window)
    # The GUI will update in the detector's main loop
    try:
        detector.run(use_gui=False, headless=False, gui_instance=gui)
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        if gui:
            try:
                gui.destroy()
            except:
                pass

if __name__ == "__main__":
    main()
