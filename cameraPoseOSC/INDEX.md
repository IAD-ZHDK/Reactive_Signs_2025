# 📚 Model Selection System - Documentation Index

Welcome! This documentation covers the new model selection and switching system that lets you experiment with 8 different person detection models, including one specifically optimized for low-light and security camera scenarios.

## 🚀 Quick Start (2 Minutes)

**Start here if you want to get going immediately:**

```bash
# For security cameras / low-light
python pose_detector_yoloV8.py --use-exdark

# Then press E for enhancement and G for auto-gain while running
```

See: **QUICK_REFERENCE.md**

## 📖 Full Documentation

### **For First-Time Users**
1. **README_MODELS.md** ← Start here!
   - Complete overview
   - Why multiple models
   - Quick examples
   - Troubleshooting

### **For Understanding Each Model**
2. **MODEL_SELECTION.md**
   - Detailed specs for each of 8 models
   - Performance comparisons
   - Recommendations for different use cases
   - Best practices

### **For Keyboard Control**
3. **KEYBOARD_SHORTCUTS.md**
   - Complete reference for all keys
   - Model selection shortcuts (1-8)
   - Pro tips and workflows
   - Example sequences

### **For Command Line Usage**
4. **QUICK_REFERENCE.md**
   - One-page reference
   - Command examples
   - Key bindings table

### **For Technical Details**
5. **MODEL_SYSTEM_NOTES.md**
   - Implementation details
   - Files modified
   - How the system works

### **For Change Log**
6. **CHANGES_SUMMARY.md** (this file)
   - What was added
   - How to use
   - Benefits

## 🎯 What You Can Do Now

### Try Different Models Without Restarting
```
Press 1-8 during execution to switch instantly
```

### Start with Optimized Configuration
```bash
# For low-light/night/security cameras
python pose_detector_yoloV8.py --use-exdark

# For balanced speed/accuracy
python pose_detector_yoloV8.py --model yolov8s

# For maximum accuracy
python pose_detector_yoloV8.py --model yolov8l

# See all options
python pose_detector_yoloV8.py --list-models
```

### Compare Models on Same Scene
```
1. Start app
2. Observe detection with one model
3. Press 1-8 to switch models
4. Compare FPS (top-left) and detection quality
5. Rinse and repeat
```

## 🔑 Key Shortcuts (One Line Each)

```
1-8   = Switch models
E     = Enhancement (helps low-light)
G     = Auto-gain
+/-   = Manual gain
,/.   = Confidence threshold
P/O   = Smoothing
C/D   = Crop/Detections
SPACE = Pause
Q     = Quit
```

Full list: See **KEYBOARD_SHORTCUTS.md**

## 🎬 Model Selection Reference

| Key | Model | Speed | Accuracy | Best For |
|-----|-------|-------|----------|----------|
| **1** | YOLOv8 Nano | ⭐⭐⭐⭐⭐ | ⭐⭐ | Real-time / CPU |
| **2** | YOLOv8 Small | ⭐⭐⭐⭐ | ⭐⭐⭐ | Balanced (default) |
| **3** | YOLOv8 Medium | ⭐⭐⭐ | ⭐⭐⭐⭐ | Better accuracy |
| **4** | YOLOv8 Large | ⭐⭐ | ⭐⭐⭐⭐⭐ | Maximum accuracy |
| **5** | YOLOv9 Compact | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Improved arch |
| **6** | YOLOv10 Nano | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Fast (latest) |
| **7** | YOLOv10 Small | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Balanced (latest) |
| **8** | EXDark | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **LOW-LIGHT/NIGHT** |

**⭐ = Best for your use case (security cameras / low-light)**

## 💡 Recommended Workflows

### For Security Cameras (Your Use Case)
1. `python pose_detector_yoloV8.py --use-exdark`
2. Press `E` to enable enhancement
3. Press `G` to enable auto-gain
4. Adjust confidence with `,` / `.` as needed
5. Press `SPACE` to pause and inspect

### For Real-Time Performance Testing
1. `python pose_detector_yoloV8.py --model yolov8n`
2. Note FPS in top-left
3. Press `2` to try Small
4. Press `3` to try Medium
5. Compare FPS and accuracy

### For Maximum Accuracy (When Speed Doesn't Matter)
1. `python pose_detector_yoloV8.py --model yolov8l`
2. Or press `4` during runtime
3. Use with GPU (M1/M2/NVIDIA)

## 📊 Expected Performance

### FPS by Model (typical GPU like RTX 3080)
- YOLOv8 Nano: 40-50 FPS
- YOLOv8 Small: 30-40 FPS
- YOLOv8 Medium: 15-25 FPS
- YOLOv8 Large: 8-12 FPS
- EXDark: 15-20 FPS (varies)

### FPS by Model (CPU only)
- YOLOv8 Nano: 2-5 FPS
- YOLOv8 Small: 1-2 FPS
- Others: Too slow for real-time

## ✅ What's New

✅ 8 pre-configured models to choose from
✅ Runtime model switching (press 1-8)
✅ Command-line model selection
✅ Low-light optimized model (EXDark)
✅ Model list display (`--list-models`)
✅ Custom weights support
✅ Automatic device selection (CPU/GPU)
✅ On-screen control reference updated

## 📝 Documentation Files at a Glance

| File | Purpose | Read If... |
|------|---------|-----------|
| **README_MODELS.md** | Complete guide | You're new to the system |
| **MODEL_SELECTION.md** | Model details | You want to learn about each model |
| **QUICK_REFERENCE.md** | Quick reference | You need a 1-page cheat sheet |
| **KEYBOARD_SHORTCUTS.md** | Key bindings | You want to see all shortcuts |
| **MODEL_SYSTEM_NOTES.md** | Technical | You want implementation details |
| **CHANGES_SUMMARY.md** | What changed | You want to know what's new |

## 🆘 Common Questions

**Q: How do I switch models during runtime?**
A: Press any number key 1-8. Model changes instantly.

**Q: Which model is best for security cameras?**
A: Model 8 (EXDark) - trained on low-light/night data.

**Q: My FPS is too low, what do I do?**
A: Press `1` to use Nano (fastest), or press `U` to skip more frames.

**Q: Models aren't downloading, what's wrong?**
A: Check internet connection. Models auto-download on first use (~50MB each).

**Q: Where are detailed instructions?**
A: See **README_MODELS.md** for comprehensive guide.

## 🔗 Quick Links to Sections

- **To start immediately**: See QUICK_REFERENCE.md
- **To understand models**: See MODEL_SELECTION.md
- **To learn keyboard shortcuts**: See KEYBOARD_SHORTCUTS.md
- **To troubleshoot**: See README_MODELS.md → Troubleshooting
- **For technical details**: See MODEL_SYSTEM_NOTES.md

## 📧 Summary

You now have a complete model selection system that lets you:
- Try 8 different models on any scene
- Instantly switch models with 1-8 keys
- Start with pre-optimized configurations
- Fine-tune detection with various parameters
- Optimize for both speed and accuracy
- Handle low-light scenarios specifically

**Start with**: `python pose_detector_yoloV8.py --use-exdark`

**Then press**: `1-8` to explore different models!

---

For more help, check the specific documentation files above.
Last updated: November 2025
