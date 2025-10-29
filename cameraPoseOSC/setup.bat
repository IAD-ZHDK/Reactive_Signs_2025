@echo off
REM Setup script for Pose Detection OSC with virtual environment (Windows)

echo Setting up Pose Detection OSC with virtual environment...
echo.

REM Get the directory where this script is located
cd /d "%~dp0"

REM Check if Python 3 is available
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python 3 is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

REM Check Python version compatibility
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Detected Python version: %PYTHON_VERSION%

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to create virtual environment
        echo Make sure you have venv module installed
        pause
        exit /b 1
    )
) else (
    echo Virtual environment already exists
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo Installing requirements from requirements.txt...
if exist "requirements.txt" (
    pip install -r requirements.txt
    if %ERRORLEVEL% EQU 0 (
        echo Requirements installed successfully!
    ) else (
        echo Error: Failed to install requirements
        echo You may need to:
        echo 1. Use a different Python version (3.8-3.12 for MediaPipe^)
        echo 2. Install additional system dependencies
        echo 3. Try running "pip install --upgrade pip" manually
        pause
        exit /b 1
    )
) else (
    echo Error: requirements.txt not found
    pause
    exit /b 1
)

echo.
echo Setup complete!
echo.
echo To activate the virtual environment manually:
echo   venv\Scripts\activate.bat
echo.
echo To run pose detection:
echo   python pose_detector_yoloV8.py
echo.
echo To deactivate the virtual environment:
echo   deactivate
echo.
pause
