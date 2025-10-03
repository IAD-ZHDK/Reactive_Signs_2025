#!/bin/bash
# Setup script for Pose Detection OSC with virtual environment

echo "Setting up Pose Detection OSC with virtual environment..."

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

# Check Python version compatibility
PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "Detected Python version: $PYTHON_VERSION"

if [[ "$PYTHON_VERSION" > "3.12" ]]; then
    echo "Warning: Python $PYTHON_VERSION detected."
    echo "MediaPipe currently supports Python 3.8-3.12."
    echo "You have a few options:"
    echo "1. Install Python 3.12 using pyenv or similar"
    echo "2. Use alternative pose detection (will install YOLO-based solution)"
    echo "3. Continue anyway (may fail)"
    echo ""
    read -p "Choose option (1/2/3): " choice
    case $choice in
        1)
            echo "Please install Python 3.12 and run this script again"
            echo "Using pyenv:"
            echo "  brew install pyenv  # macOS"
            echo "  pyenv install 3.12.0"
            echo "  pyenv local 3.12.0"
            exit 1
            ;;
        2)
            echo "Will use alternative requirements (YOLO-based pose detection)"
            REQUIREMENTS_FILE="requirements_alt.txt"
            ;;
        3)
            echo "Continuing with standard requirements..."
            REQUIREMENTS_FILE="requirements.txt"
            ;;
        *)
            echo "Invalid choice. Exiting."
            exit 1
            ;;
    esac
else
    echo "Python version is compatible with MediaPipe"
    REQUIREMENTS_FILE="requirements.txt"
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create virtual environment"
        echo "Make sure you have python3-venv installed:"
        echo "  Ubuntu/Debian: sudo apt-get install python3-venv"
        echo "  macOS: Should be included with Python 3"
        exit 1
    fi
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "Installing requirements from $REQUIREMENTS_FILE..."
if [ -f "$REQUIREMENTS_FILE" ]; then
    pip install -r "$REQUIREMENTS_FILE"
    if [ $? -eq 0 ]; then
        echo "Requirements installed successfully!"
        if [ "$REQUIREMENTS_FILE" = "requirements_alt.txt" ]; then
            echo ""
            echo "Note: Using alternative pose detection (YOLO-based)"
            echo "You'll need to use the alternative script: pose_detector_yolo.py"
        fi
    else
        echo "Error: Failed to install requirements"
        echo "You may need to:"
        echo "1. Use a different Python version (3.8-3.12 for MediaPipe)"
        echo "2. Install additional system dependencies"
        echo "3. Try the alternative requirements: pip install -r requirements_alt.txt"
        exit 1
    fi
else
    echo "Error: $REQUIREMENTS_FILE not found"
    exit 1
fi

echo ""
echo "Setup complete!"
echo ""
echo "To activate the virtual environment manually:"
echo "  source venv/bin/activate"
echo ""
echo "To run pose detection:"
echo "  ./start_pose_detection.sh"
echo ""
echo "To deactivate the virtual environment:"
echo "  deactivate"