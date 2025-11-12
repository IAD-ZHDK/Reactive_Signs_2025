@echo off
REM Quick launcher for the GUI version (Windows)

cd /d "%~dp0"

REM Check if venv exists
if not exist "venv" (
    echo Error: Virtual environment not found!
    echo Please run setup.bat first to install dependencies.
    pause
    exit /b 1
)

REM Activate virtual environment and run
call venv\Scripts\activate.bat
python run_detector_gui.py

REM Deactivate when done
deactivate
