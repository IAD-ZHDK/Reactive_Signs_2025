# Pose Detection OSC for Reactive Signs

Cross-platform Python script for pose detection with OSC output, designed to work with the Reactive Signs project.

## Features

- **Cross-platform**: Works on macOS, Windows, and Linux
- **Real-time pose detection** using MediaPipe
- **OSC output** compatible with existing Reactive Signs setup
- **Simple cropping interface** for webcam input
- **Configurable models** via JSON configuration
- **Average pose point calculation** from multiple detected poses
- **Settings persistence** between sessions

## Installation

### Python Version Compatibility

⚠️ **Important**: MediaPipe currently supports Python 3.8-3.12 only. If you have Python 3.13+, you have a few options:

1. **Install Python 3.12** (recommended for MediaPipe)
2. **Use YOLO-based alternative** (works with Python 3.13+)
3. **Use pyenv to manage multiple Python versions**

### Automatic Setup (Recommended)

1. **Install Python 3.8-3.12** if you want to use MediaPipe
2. **Run the setup script**:
   
   **macOS/Linux:**
   ```bash
   ./setup.sh
   ```
   
   **Windows:**
   ```batch
   setup.bat
   ```

The setup script will:
- Detect your Python version
- Offer alternatives if MediaPipe is incompatible
- Create a virtual environment
- Install all required packages
- Set up the project for immediate use

### Manual Setup

#### For MediaPipe (Python 3.8-3.12)
1. **Create virtual environment**:
   ```bash
   python3 -m venv venv
   ```
2. **Activate virtual environment**:
   
   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```
   
   **Windows:**
   ```batch
   venv\Scripts\activate.bat
   ```
3. **Install required packages**:
   ```bash
   pip install -r requirements.txt
   ```

#### For YOLO Alternative (Python 3.13+)
1. **Create virtual environment**:
   ```bash
   python3 -m venv venv
   ```
2. **Activate virtual environment** (see above)
3. **Install alternative packages**:
   ```bash
   pip install -r requirements_alt.txt
   ```

## Quick Start

### First Time Setup
1. **Run setup script**:
   ```bash
   # macOS/Linux
   ./setup.sh
   
   # Windows
   setup.bat
   ```

### Running the Application

#### MediaPipe Version (Python 3.8-3.12)
1. **Start pose detection**:
   ```bash
   # macOS/Linux
   ./start_pose_detection.sh
   
   # Windows
   start_pose_detection.bat
   ```

#### YOLO Version (Python 3.13+ or MediaPipe alternative)
1. **Start YOLO pose detection**:
   ```bash
   # After installing requirements_alt.txt
   source venv/bin/activate  # macOS/Linux
   # or
   venv\Scripts\activate.bat  # Windows
   
   python pose_detector_yolo.py
   ```

### Manual Usage (if needed)
1. **Activate virtual environment**:
   ```bash
   # macOS/Linux
   source venv/bin/activate
   
   # Windows
   venv\Scripts\activate.bat
   ```

2. **Basic usage**:
   ```bash
   python pose_detector_osc.py
   ```

3. **Advanced usage with configuration**:
   ```bash
   python pose_detector_advanced.py
   ```

4. **Custom OSC settings**:
   ```bash
   python pose_detector_osc.py --osc-host 192.168.1.100 --osc-port 9001
   ```

## Controls

### Keyboard Controls
- **C** - Toggle crop interface on/off
- **L** - Toggle landmark visualization (advanced version)
- **R** - Reset crop area to full camera view
- **S** - Save current settings
- **SPACE** - Pause/Resume processing
- **Q** or **ESC** - Quit application

### Mouse Controls
- **Click and drag** - Set crop area (when crop interface is enabled)

## Configuration

### Basic Script (`pose_detector_osc.py`)
Command line arguments:
- `--osc-host` - OSC host address (default: 127.0.0.1)
- `--osc-port` - OSC port (default: 8025)
- `--camera` - Camera device ID (default: 0)
- `--model-complexity` - Model complexity 0=lite, 1=full, 2=heavy (default: 1)
- `--min-detection-confidence` - Minimum detection confidence (default: 0.5)
- `--min-tracking-confidence` - Minimum tracking confidence (default: 0.5)

### Advanced Script (`pose_detector_advanced.py`)
Uses `pose_config.json` for configuration:

```json
{
  "models": {
    "mediapipe_pose": {
      "type": "mediapipe",
      "model_complexity": 1,
      "min_detection_confidence": 0.5,
      "min_tracking_confidence": 0.5
    }
  },
  "osc": {
    "host": "127.0.0.1",
    "port": 8025,
    "message_path": "/pose"
  },
  "camera": {
    "device_id": 0,
    "fps": 30
  }
}
```

## Changing Models

### Method 1: Edit Configuration File
Edit `pose_config.json` to add new model configurations or modify existing ones.

### Method 2: Command Line (Advanced Version)
```bash
# List available models
python pose_detector_advanced.py --list-models

# Use specific model
python pose_detector_advanced.py --model mediapipe_pose_lite
```

### Available Model Types
- **MediaPipe Models** (Python 3.8-3.12):
  - **mediapipe_pose** - Standard model (balanced speed/accuracy)
  - **mediapipe_pose_lite** - Lightweight model (faster, less accurate)
  - **mediapipe_pose_heavy** - Heavy model (slower, more accurate)

- **YOLO Models** (Python 3.13+ compatible):
  - **yolov8n-pose.pt** - Nano model (fastest, least accurate)
  - **yolov8s-pose.pt** - Small model (balanced)
  - **yolov8m-pose.pt** - Medium model (more accurate)
  - **yolov8l-pose.pt** - Large model (most accurate, slowest)

## OSC Output Format

The script sends OSC messages **compatible with the existing realSenseOSC format**:

**OSC Message Path**: `/depth` (same as realSenseOSC)
**Port**: `8025` (same as realSenseOSC)

**OSC Message Arguments** (matches realSenseOSC exactly):
1. `width` (int) - Crop area width (args[0])
2. `height` (int) - Crop area height (args[1])
3. `depth_data` (array) - Empty array for pose detection (args[2])
4. `x` (float) - Normalized X position (0.0-1.0, flipped) (args[3])
5. `y` (float) - Normalized Y position (0.0-1.0) (args[4]) 
6. `z` (float) - Normalized Z position (confidence estimate) (args[5])
7. `tracking` (int) - 1 if pose detected, 0 if not (args[6])

This format is **100% compatible** with the existing JavaScript OSC receiver in `library/src/OSC_Control.js`.

## Troubleshooting

### Camera Issues
- **Camera not found**: Try different camera IDs (0, 1, 2...)
- **Permission denied**: Grant camera permissions to Terminal/Python
- **Low FPS**: Use a lower model complexity or reduce camera resolution

### OSC Issues
- **Connection refused**: Check if receiving application is running
- **Wrong port**: Verify OSC port matches receiver
- **Network issues**: For remote OSC, check firewall settings

### Performance Issues
- **High CPU usage**: Lower model complexity or reduce camera FPS
- **Memory issues**: Close other applications or use lite model
- **Lag**: Disable landmark visualization with 'L' key

## Integration with Reactive Signs

This script is designed to **replace the realSenseOSC Processing sketch** with the exact same output format. No changes needed to the existing JavaScript code!

**Perfect compatibility:**
- ✅ Same OSC port (8025)
- ✅ Same message path (`/depth`)
- ✅ Same message format (args[0-6])
- ✅ Works with existing `library/src/OSC_Control.js`

**To integrate:**
1. Stop the realSenseOSC Processing sketch
2. Run this Python pose detection script  
3. Your existing Reactive Signs setup will work immediately!

**No code changes needed** - the JavaScript receiver already expects messages on `/depth` port 8025.

## Files

- `setup.sh` / `setup.bat` - Setup scripts for virtual environment
- `start_pose_detection.sh` / `start_pose_detection.bat` - Startup scripts
- `pose_detector_osc.py` - Basic pose detection script
- `pose_detector_advanced.py` - Advanced configurable version
- `pose_config.json` - Configuration file for advanced version
- `requirements.txt` - Python package requirements
- `test_osc_receiver.py` - OSC test receiver
- `pose_detector_settings.json` - Auto-generated settings file
- `README_PoseDetection.md` - This documentation
- `.gitignore` - Git ignore file for virtual environment

## Platform-Specific Notes

### macOS
- May need to grant camera permissions in System Preferences
- Use Command+Q to quit if ESC doesn't work

### Windows  
- Install Visual C++ Redistributable if OpenCV fails to load
- Use Windows key combinations if needed

### Linux
- Install additional packages if needed: `sudo apt-get install python3-opencv`
- Ensure user has camera permissions: `sudo usermod -a -G video $USER`

## License

Same as parent Reactive Signs project.