#!/bin/bash
# Startup script for Pose Detection OSC (macOS/Linux)

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

echo "Starting Pose Detection OSC..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found!"
    echo "Please run setup.sh first:"
    echo "  ./setup.sh"
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
python -c "import cv2, mediapipe, pythonosc.udp_client, numpy" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Requirements not installed or incomplete!"
    echo "Please run setup.sh first:"
    echo "  ./setup.sh"
    exit 1
fi

# Start the pose detection script
echo "Starting pose detection..."
echo "Press Ctrl+C to stop"
echo ""
python pose_detector_advanced.py

echo ""
echo "Pose detection stopped."
echo "Deactivating virtual environment..."
deactivate