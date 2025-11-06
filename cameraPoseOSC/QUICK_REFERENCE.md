# Quick Start: Model Selection

## TL;DR - For Low-Light/Security Cameras

```bash
# Start with EXDark (optimized for low-light)
python pose_detector_yoloV8.py --use-exdark

# Or switch to it during runtime by pressing: 8
```

## Runtime Model Switching (Press Number Keys 1-8)

While running, press any key from 1-8 to instantly switch models:

| Key | Model | Best For |
|-----|-------|----------|
| **1** | YOLOv8 Nano | Speed/CPU only |
| **2** | YOLOv8 Small | Balanced (default) |
| **3** | YOLOv8 Medium | Better accuracy |
| **4** | YOLOv8 Large | Best accuracy |
| **5** | YOLOv9 Compact | Improved accuracy |
| **6** | YOLOv10 Nano | Fast (new version) |
| **7** | YOLOv10 Small | Balanced (new) |
| **8** | EXDark | **LOW-LIGHT/NIGHT** ⭐ |

## Command Line Options

```bash
# List all available models
python pose_detector_yoloV8.py --list-models

# Start with specific model
python pose_detector_yoloV8.py --model yolov8s
python pose_detector_yoloV8.py --model yolov8m
python pose_detector_yoloV8.py --model yolov10n

# Start with EXDark (low-light)
python pose_detector_yoloV8.py --use-exdark

# Custom weights
python pose_detector_yoloV8.py --weights ./path/to/model.pt
```

## Full Key Reference

- **Model Selection**: Press `1-8` to switch models
- **Confidence**: Press `,` or `.` to adjust threshold
- **Enhancement**: Press `E` to toggle enhancement (helps with low-light)
- **Gain**: Press `G` to toggle auto-gain, `+`/`-` to adjust manual gain
- **Smoothing**: Press `P`/`O` to adjust smoothing
- **Pause**: Press `SPACE` to pause/resume
- **Quit**: Press `Q` or `ESC`

## Recommended Settings for Low-Light

1. **Model**: Press `8` for EXDark
2. **Enhancement**: Press `E` to enable enhancement
3. **Auto-gain**: Press `G` to enable
4. **Confidence**: Adjust with `,` / `.` if needed

See `MODEL_SELECTION.md` for full documentation.
