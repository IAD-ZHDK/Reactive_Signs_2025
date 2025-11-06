# Keyboard Shortcut Reference

## 🎯 Model Selection (NEW!)
Press any number key 1-8 to switch models instantly during runtime:

```
1 = YOLOv8 Nano       (fastest)
2 = YOLOv8 Small      (balanced - default)
3 = YOLOv8 Medium     (accurate)
4 = YOLOv8 Large      (most accurate)
5 = YOLOv9 Compact    (improved)
6 = YOLOv10 Nano      (fast, new)
7 = YOLOv10 Small     (balanced, new)
8 = EXDark            (LOW-LIGHT/NIGHT ⭐)
```

## 🖼️ Display & Visualization
```
C = Toggle crop interface
D = Toggle detections overlay
R = Reset crop area
S = Save settings
E = Toggle enhancement (CLAHE + gain for low-light)
```

## 🎛️ Camera & Processing Settings
```
G = Toggle auto-gain
+ = Increase manual gain
- = Decrease manual gain
U = Decrease processing frequency (process fewer frames)
I = Increase processing frequency (process more frames)
A = Toggle frame accumulation (temporal averaging)
M = Toggle enhancement applied to inference (slower but better)
```

## 🎚️ Detection Tuning
```
, = Decrease confidence threshold (more detections)
. = Increase confidence threshold (fewer, confident detections)
P = Increase smoothing alpha (less smoothing)
O = Decrease smoothing alpha (more smoothing)
```

## 🎬 Playback Control
```
SPACE = Pause / Resume detection
B = Toggle background subtraction
Z = Reset background model
K = Decrease background subtraction learning rate
L = Increase background subtraction learning rate
```

## 🛑 Exit
```
Q = Quit application
ESC = Quit application
```

---

## 📋 Full Sequence Example: Testing Low-Light Performance

1. **Start**: `python pose_detector_yoloV8.py --use-exdark`
2. **Enhance**: Press `E` to enable enhancement
3. **Auto-Gain**: Press `G` to enable auto-gain
4. **Compare**: Press `3` to try YOLOv8 Medium instead
5. **Lower Threshold**: Press `,` to see more detections
6. **Pause**: Press `SPACE` to pause and inspect
7. **Resume**: Press `SPACE` to continue
8. **Quit**: Press `Q` to exit

---

## 📊 Group by Category

### Model Performance Tuning (1-8)
| Key | Purpose |
|-----|---------|
| 1-8 | Switch between 8 models for testing |

### Image Enhancement (E, G, +/-, A, M)
| Key | Purpose |
|-----|---------|
| E | Toggle visual enhancement (CLAHE + gain) |
| G | Toggle auto-gain (automatic brightness adjustment) |
| + | Increase manual gain/brightness |
| - | Decrease manual gain/brightness |
| A | Toggle frame accumulation (temporal smoothing) |
| M | Apply enhancement to inference frame (slower) |

### Detection Parameters (,, ., P, O)
| Key | Purpose |
|-----|---------|
| , | Lower confidence threshold (more detections) |
| . | Raise confidence threshold (fewer detections) |
| P | Increase smoothing (less jittery) |
| O | Decrease smoothing (more responsive) |

### Processing Control (U, I)
| Key | Purpose |
|-----|---------|
| U | Skip more frames (faster but less frequent) |
| I | Process more frames (slower but more frequent) |

### Crop & Display (C, D, R, S)
| Key | Purpose |
|-----|---------|
| C | Toggle crop selection mode |
| D | Toggle detection box overlay |
| R | Reset crop to full frame |
| S | Save current crop settings |

### Background Subtraction (B, Z, K, L)
| Key | Purpose |
|-----|---------|
| B | Enable/disable background subtraction |
| Z | Reset background model |
| K | Lower learning rate (slower adaptation) |
| L | Raise learning rate (faster adaptation) |

### Playback (SPACE, Q)
| Key | Purpose |
|-----|---------|
| SPACE | Pause / Resume |
| Q / ESC | Quit |

---

## 💡 Pro Tips

1. **First Thing to Try**: Press `8` for EXDark if you have low-light content
2. **If Too Slow**: Press `1` or `U` to speed up
3. **If Missing Detections**: Press `,` to lower confidence or `E` to enable enhancement
4. **If Too Many False Detections**: Press `.` to raise confidence
5. **For Stability**: Press `P` or `A` for more smoothing
6. **Compare Models**: Press different numbers (1-8) while looking at same scene

---

## 🔄 Quick Workflows

### Testing Model Performance
```
1. Start with: python pose_detector_yoloV8.py
2. Press: 2, then 3, then 1 to compare
3. Watch FPS in top-left corner
4. Compare detection quality
```

### Low-Light Optimization
```
1. Start with: python pose_detector_yoloV8.py --use-exdark
2. Press: E (enable enhancement)
3. Press: G (enable auto-gain)
4. If needed, press: , (lower threshold)
5. If needed, press: P (less smoothing for responsiveness)
```

### Finding Best Speed/Accuracy Balance
```
1. Press 2 (small - balanced)
2. If too slow, press 1 (nano)
3. If need better accuracy, press 3 (medium)
4. Adjust processing frequency with U/I
5. Fine-tune confidence with ,/.
```

---

Last updated: November 2025
