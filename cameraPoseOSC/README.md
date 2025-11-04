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

### macOS / Linux

1. **Setup environment:**
   ```bash
   ./setup.sh
   ```

2. **Run pose detection:**
   ```bash
   # Virtual environment is auto-activated by setup.sh
   python pose_detector_yoloV8.py
   
   # Or manually activate:
   source venv/bin/activate
   python pose_detector_yoloV8.py
   ```

### Windows

1. **Prerequisites:**
   - Python 3.9-3.12 installed with "Add Python to PATH" checked
   - Download from: https://www.python.org/downloads/
   - For GPU acceleration: NVIDIA GPU with CUDA support

2. **Setup environment (PowerShell):**
   ```powershell
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   .\venv\Scripts\Activate.ps1
   
   # If PowerShell blocks script execution, allow user-level scripts (no admin required):
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   .\venv\Scripts\Activate.ps1
   
   # Upgrade pip
   python -m pip install --upgrade pip
   
   # Install requirements
   pip install -r requirements.txt
   
   # Install PyTorch with CUDA support (for GPU acceleration)
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   
   # Install Ultralytics YOLO and websockets
   pip install ultralytics websockets
   ```

   **Setup environment (Command Prompt - cmd.exe):**
   ```cmd
   REM Create virtual environment
   python -m venv venv
   
   REM Activate virtual environment
   venv\Scripts\activate.bat
   
   REM Upgrade pip
   python -m pip install --upgrade pip
   
   REM Install requirements
   pip install -r requirements.txt
   
   REM Install PyTorch with CUDA support (for GPU acceleration)
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
   
   REM Install Ultralytics YOLO and websockets
   pip install ultralytics websockets
   ```

3. **Run pose detection:**
   
   **PowerShell:**
   ```powershell
   # Activate virtual environment (if not already activated)
   .\venv\Scripts\Activate.ps1
   
   # Run with default GPU (GPU 0)
   python pose_detector_yoloV8.py
   
   # Run with specific GPU (e.g., GPU 1)
   python pose_detector_yoloV8.py --gpu 1
   
   # Check available GPUs
   python -c "import torch; print('CUDA available:', torch.cuda.is_available()); print('GPU count:', torch.cuda.device_count()); [print(f'GPU {i}: {torch.cuda.get_device_name(i)}') for i in range(torch.cuda.device_count())]"
   ```

   **Command Prompt (cmd.exe):**
   ```cmd
   REM Activate virtual environment (if not already activated)
   venv\Scripts\activate.bat
   
   REM Run with default GPU (GPU 0)
   python pose_detector_yoloV8.py
   
   REM Run with specific GPU (e.g., GPU 1)
   python pose_detector_yoloV8.py --gpu 1
   ```

4. **To deactivate virtual environment:**
   
   **PowerShell:**
   ```powershell
   deactivate
   ```
   
   **Command Prompt (cmd.exe):**
   ```cmd
   deactivate
   ```
   
   
## OSC Output Format

The system sends OSC messages to `/depth` endpoint in realSenseOSC compatible format:

### WebSocket Mode (Default)
- **URL**: `ws://localhost:8025`
- **Protocol**: Binary OSC over WebSocket
- **Message**: `/depth [width, height, depth_array, x, y, z, tracking]`

Note: the Python WebSocket client library may not be installed by default. If the script cannot import a WebSocket client it will automatically fall back to UDP OSC. To enable WebSocket mode install the client library in your environment:

```powershell
# inside the activated venv
pip install websocket-client
```

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
  --model MODEL        YOLO model (default: yolov8n.pt)
  --confidence CONF    Confidence threshold (default: 0.5)
  --gpu ID             GPU device ID to use (e.g., 0, 1, 2). If not specified, uses default CUDA device
  --weights PATH       Path to custom weights (.pt) to load
  --use-exdark         Search local exdark folder for trained weights
  --exdark-path PATH   Path to local exdark repo/folder (default: ./exdark)
```

## Requirements

- Python 3.9-3.12 (recommended for best compatibility)
- Camera (webcam or external)
- Network connection for model download (first run only)
- For GPU acceleration: NVIDIA GPU with CUDA support

## GPU Acceleration

The script automatically detects and uses NVIDIA GPUs when available. You can:

- **Check GPU availability:**
  ```powershell
  python -c "import torch; print('CUDA:', torch.cuda.is_available()); print('GPUs:', torch.cuda.device_count()); [print(f'  GPU {i}: {torch.cuda.get_device_name(i)}') for i in range(torch.cuda.device_count())]"
  ```

- **Select specific GPU:**
  ```powershell
  python pose_detector_yoloV8.py --gpu 0  # Use GPU 0
  python pose_detector_yoloV8.py --gpu 1  # Use GPU 1
  ```

- **Monitor GPU usage:**
  ```powershell
  nvidia-smi
  ```

## Troubleshooting

### All Platforms

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

### Windows Specific

**"Python not found" or "'python' is not recognized":**
- Reinstall Python and ensure "Add Python to PATH" is checked during installation
- Restart PowerShell/Command Prompt after installing Python
- Or use `py` instead: `py -m venv venv`

**Virtual environment activation fails in PowerShell:**
- Run this command first (no admin required):
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
- Then activate:
  ```powershell
  .\venv\Scripts\Activate.ps1
  ```

**'source' command not recognized in PowerShell:**
- `source` is a bash command (macOS/Linux)
- Use PowerShell command instead: `.\venv\Scripts\Activate.ps1`
- Or use Command Prompt: `venv\Scripts\activate.bat`

**Virtual environment not writeable / "Defaulting to user installation":**
- Delete and recreate the venv:
  ```powershell
  Remove-Item -Recurse -Force venv
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  pip install -r requirements.txt
  ```

**ModuleNotFoundError: No module named 'cv2' or 'torch':**
- Make sure virtual environment is activated (you should see `(venv)` in prompt)
- Reinstall requirements:
  ```powershell
  pip install -r requirements.txt
  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
  pip install ultralytics websockets
  ```

**GPU not detected / "No CUDA GPUs detected - using CPU":**
- Check if you have an NVIDIA GPU: `nvidia-smi`
- Install PyTorch with CUDA support:
  ```powershell
  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
  ```
- Verify installation:
  ```powershell
  python -c "import torch; print('CUDA available:', torch.cuda.is_available())"
  ```
- If CUDA is still not available:
  - Ensure you have an NVIDIA GPU with updated drivers
  - CUDA Toolkit is NOT required (PyTorch includes it)
  - Try reinstalling PyTorch with the correct CUDA version for your driver

**"expected mat1 and mat2 to have the same dtype" error:**
- This has been fixed in the latest version
- The script now handles FP16/FP32 precision automatically