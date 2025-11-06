# Model Selection Guide

This document explains how to select and switch between different person detection models optimized for various scenarios.

## Available Models

### 1. **YOLOv8 Nano** (Key: `1`)
- **File**: `yolov8n.pt`
- **Speed**: ⭐⭐⭐⭐⭐ Fastest
- **Accuracy**: ⭐⭐ Basic
- **Use Case**: Real-time detection on CPU or low-power devices
- **Optimized For**: Speed

### 2. **YOLOv8 Small** (Key: `2`)
- **File**: `yolov8s.pt`
- **Speed**: ⭐⭐⭐⭐ Fast
- **Accuracy**: ⭐⭐⭐ Good
- **Use Case**: Balanced speed/accuracy for most applications
- **Optimized For**: Balanced performance

### 3. **YOLOv8 Medium** (Key: `3`)
- **File**: `yolov8m.pt`
- **Speed**: ⭐⭐⭐ Medium
- **Accuracy**: ⭐⭐⭐⭐ Excellent
- **Use Case**: Better detection in complex scenes
- **Optimized For**: Accuracy

### 4. **YOLOv8 Large** (Key: `4`)
- **File**: `yolov8l.pt`
- **Speed**: ⭐⭐ Slow
- **Accuracy**: ⭐⭐⭐⭐⭐ Best
- **Use Case**: Maximum accuracy, requires good GPU
- **Optimized For**: Accuracy

### 5. **YOLOv9 Compact** (Key: `5`)
- **File**: `yolov9c.pt`
- **Speed**: ⭐⭐⭐⭐ Fast
- **Accuracy**: ⭐⭐⭐⭐ Excellent
- **Use Case**: Next-gen architecture with improved accuracy
- **Optimized For**: Balanced performance

### 6. **YOLOv10 Nano** (Key: `6`)
- **File**: `yolov10n.pt`
- **Speed**: ⭐⭐⭐⭐⭐ Fastest
- **Accuracy**: ⭐⭐⭐ Good
- **Use Case**: Latest architecture, fastest version
- **Optimized For**: Speed

### 7. **YOLOv10 Small** (Key: `7`)
- **File**: `yolov10s.pt`
- **Speed**: ⭐⭐⭐⭐ Fast
- **Accuracy**: ⭐⭐⭐⭐ Good
- **Use Case**: Latest architecture with better accuracy
- **Optimized For**: Balanced performance

### 8. **EXDark (Low-Light Optimized)** (Key: `8`)
- **File**: Custom weights from `./exdark` folder
- **Speed**: ⭐⭐⭐ Medium
- **Accuracy**: ⭐⭐⭐⭐⭐ Excellent in low-light
- **Use Case**: **BEST for security cameras, night detection**
- **Optimized For**: Low-light/night scenes

## Using Models from Command Line

### List all available models:
```bash
python pose_detector_yoloV8.py --list-models
```

### Start with a specific model:
```bash
# Start with YOLOv8 Small (balanced)
python pose_detector_yoloV8.py --model yolov8s

# Start with YOLOv8 Medium
python pose_detector_yoloV8.py --model yolov8m

# Start with EXDark (low-light optimized)
python pose_detector_yoloV8.py --use-exdark

# Start with custom weights
python pose_detector_yoloV8.py --weights /path/to/custom/model.pt
```

## Switching Models During Runtime

While the application is running, you can switch between models using keyboard shortcuts:

| Key | Model | Optimized For |
|-----|-------|---------------|
| `1` | YOLOv8 Nano | Speed |
| `2` | YOLOv8 Small | Balanced |
| `3` | YOLOv8 Medium | Accuracy |
| `4` | YOLOv8 Large | Accuracy |
| `5` | YOLOv9 Compact | Balanced |
| `6` | YOLOv10 Nano | Speed |
| `7` | YOLOv10 Small | Balanced |
| `8` | EXDark | Low-light |

**Example workflow:**
1. Start with YOLOv8 Small for testing
2. Press `3` to switch to YOLOv8 Medium if you need better accuracy
3. Press `8` to switch to EXDark if working in low-light conditions
4. Switch back with `1` if you need faster inference

## Recommendations for Different Scenarios

### Security Camera (Low-Light) - **RECOMMENDED FOR YOUR USE CASE**
- **Best Choice**: `8` - EXDark (trained on low-light data)
- **Fallback**: `3` - YOLOv8 Medium with enhancement enabled
- **Command**: `python pose_detector_yoloV8.py --use-exdark`

### Real-Time Detection (Good Lighting)
- **Best Choice**: `2` - YOLOv8 Small
- **If CPU only**: `1` - YOLOv8 Nano
- **If GPU available**: `3` - YOLOv8 Medium

### High Accuracy (Unlimited Time)
- **Best Choice**: `4` - YOLOv8 Large
- **If slow**: `3` - YOLOv8 Medium

### Latest Architecture (Experimental)
- **Speed**: `6` - YOLOv10 Nano
- **Balanced**: `7` - YOLOv10 Small

## Performance Tips

1. **Enable Frame Enhancement** (Press `E`) when using low-light models to improve input quality
2. **Adjust Confidence Threshold** (Press `,` / `.`) based on false positive rate
3. **Reduce Processing Frequency** (Press `U`) if FPS is low and you don't need real-time updates
4. **Combine with Smoothing Alpha** (Press `P` / `O`) to reduce jitter

## First-Time Setup

1. Ensure YOLO models can be downloaded automatically (first use will download ~50MB per model)
2. For EXDark model, ensure `./exdark` folder contains trained weights
3. GPU recommended for models 3, 4, and 5

## Notes

- Models are downloaded automatically from Ultralytics on first use
- EXDark model requires custom weights file in `./exdark/` folder
- Switching models takes 1-3 seconds depending on model size
- Current FPS and model info displayed in top-left corner
- Frame processing may temporarily pause during model loading
