# Camera Pose Detection with OSC Output

Cross-platform pose detection system using YOLO that sends pose data via OSC (UDP or WebSocket) in realSenseOSC compatible format.

## Features

- **Cross-platform**: Runs on macOS, Windows, and Linux
- **YOLO pose detection**: Fast and accurate pose detection using YOLOv8
- **OSC compatibility**: Outputs in realSenseOSC format on `/depth` endpoint  
- **WebSocket support**: Compatible with `ws://localhost:8025` protocol
- **UDP fallback**: Standard OSC over UDP as backup
- **Interactive controls**: Crop area selection, landmark display, real-time settings
- **Virtual environment**: Isolated Python dependencies

## Quick Start

1. **Setup environment:**
   ```bash
   # On macOS/Linux:
   ./setup.sh
   
   # On Windows:
   setup.bat
   ```

2. **Run pose detection:**
   ```bash
   # Activate virtual environment
   source venv/bin/activate  # macOS/Linux
   # or
   venv\Scripts\activate     # Windows
   
   # Run with WebSocket
   python pose_detector_yoloV8.py
   
   
## OSC Output Format

The system sends OSC messages to `/depth` endpoint in realSenseOSC compatible format:

### WebSocket Mode (Default)
- **URL**: `ws://localhost:8025`
- **Protocol**: Binary OSC over WebSocket
- **Message**: `/depth [width, height, depth_array, x, y, z, tracking]`

### UDP Mode (Fallback)
- **Host**: `127.0.0.1:8025` 
- **Protocol**: Standard OSC over UDP
- **Message**: `/depth [width, height, depth_array, x, y, z, tracking]`

### Message Parameters
- `width` (int): Crop area width
- `height` (int): Crop area height  
- `depth_array` (array): Empty array (pose detection has no depth data)
- `x` (float): Normalized X position (0.0-1.0, flipped for realSense compatibility)
- `y` (float): Normalized Y position (0.0-1.0)
- `z` (float): Confidence score as depth value (0.0-1.0)
- `tracking` (int): 1 if pose detected, 0 if not

## Controls

- **C**: Toggle crop area interface
- **L**: Toggle landmark display
- **R**: Reset crop area to full frame
- **S**: Save current settings
- **SPACE**: Pause/resume detection
- **Q/ESC**: Quit application

## Configuration

Settings are saved in `pose_config.json`:

```json
{
  "osc": {
    "host": "127.0.0.1",
    "port": 8025,
    "message_path": "/depth",
    "use_websockets": true
  },
  "camera": {
    "device_id": 0,
    "fps": 30
  }
}
```

## Command Line Options

```bash
python pose_detector_yolov8.py [options]

Options:
  --osc-host HOST      OSC host address (default: 127.0.0.1)
  --osc-port PORT      OSC port (default: 8025)
  --camera ID          Camera device ID (default: 0)
  --model MODEL        YOLO model (default: yolov8n-pose.pt)
  --confidence CONF    Confidence threshold (default: 0.5)
  --use-udp           Use UDP OSC instead of WebSocket
  --no-camera         Disable camera preview window
```

## Requirements

- Python 3.9+ (YOLO compatible, Python 3.13+ supported)
- Camera (webcam or external)
- Network connection for model download (first run only)

## Troubleshooting

**WebSocket connection failed:**
- Ensure realSenseOSC or compatible server is running on port 8025
- System will fallback to UDP OSC automatically

**Camera not found:**
- Check camera device ID with `--camera` option
- Try different device IDs (0, 1, 2, etc.)

**Poor detection accuracy:**
- Adjust confidence threshold with `--confidence`
- Ensure good lighting and clear view of person
- Use crop area (C key) to focus on specific region