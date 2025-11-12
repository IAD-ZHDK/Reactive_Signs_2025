#!/bin/bash
# Quick launcher for the GUI version

cd "$(dirname "$0")"
source venv/bin/activate
python run_detector_gui.py
