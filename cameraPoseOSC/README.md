# Pose Detector with YOLO & OSC

Real-time pose detection using YOLOv8 with WebSocket/UDP OSC output for interactive installations.

## Installation

```bash
# macOS/Linux
./setup.sh

# Windows
setup.bat
```

## Running

### With GUI (Recommended)

**macOS/Linux:**
```bash
python run_detector_gui.py
# or
./start_gui.sh
```

**Windows:**
```cmd
start_gui.bat
```

This launches both the camera window and a greyscale control panel with toggles and sliders.

### Without GUI (Keyboard controls only)
```bash
python pose_detector_yoloV8.py
```

## GUI Controls

**System Info**
- Live FPS, device (CPU/GPU), and model name display

**Display**
- Draw Skeleton, Draw Confidence, Draw FPS toggles

**Image Processing**
- Flip Horizontal/Vertical, Auto Enhance
- Brightness, Contrast, Saturation sliders (0.0-2.0)

**Detection**
- Confidence Threshold (0.0-1.0)
- Min Detection Area (0.0-0.5)

**Smoothing**
- Enable/Disable smoothing
- Smoothing Factor (0.0-1.0)
- Hold Frames (0-30)

**Model**
- Dropdown: yolov8n, yolov8s, yolov8m, exdark
- Inference Size (160-640, step 32)

**Camera**
- Restart Camera button
- Reset Crop Area button

**Settings**
- Save Settings button (persists to JSON)

**GPU** (if available)
- FP16 Precision toggle

## Keyboard Controls (GUI mode)

- `Y` – Show performance diagnostics
- `Q` – Quit application
- `S` – Save settings

## Keyboard Controls (No-GUI mode)

- `H` – Flip horizontal
- `F` – Flip vertical
- `Z/N` – Switch camera input
- `C` – Toggle crop mode
- `D` – Toggle detections display
- `R` – Reset crop
- `E` – Toggle auto-enhance
- `X` – Restart camera
- `SPACE` – Pause/resume
- `S` – Save settings
- `Y` – Performance diagnostics
- `Q` – Quit

## OSC Output Format

```
/pose {skeleton_data}  → WebSocket (ws://0.0.0.0:8025)
              OR
/pose {skeleton_data}  → UDP fallback (OSC format)
```

Default: UDP OSC on ports 8025 (output) / 8026 (input)

## Configuration

Settings auto-save to `detector_settings.json`:
- Model selection
- Confidence threshold
- Flip orientation
- Smoothing parameters
- All GUI slider values

Delete `detector_settings.json` to reset to defaults.

## Requirements

- Python 3.9+
- OpenCV, PyTorch, Ultralytics YOLO
- Tkinter (for GUI mode)
- websockets (optional, uses UDP fallback)

See `requirements.txt` for full dependency list.

## Troubleshooting

**GUI not appearing?** Use `python run_detector_gui.py` (the proper launcher)

**No camera?** Change `camera_id` in detector code or use different input source

**Slow FPS?** Try smaller inference_size (e.g., 192) or switch to yolov8n model via GUI

**Model loading errors?** Ensure `./exdark/best.pt` exists for exdark model
