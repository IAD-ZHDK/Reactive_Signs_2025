#!/usr/bin/env python3
"""
Create default detector_settings.json file if it doesn't exist.
This is useful for first-time setup or resetting to defaults.
"""

import json
import os

def create_default_settings():
    """Create default detector settings file"""
    settings_file = "detector_settings.json"
    
    # Check if file already exists
    if os.path.exists(settings_file):
        response = input(f"{settings_file} already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Cancelled. Existing settings preserved.")
            return
    
    # Default settings
    default_settings = {
        "crop_x1": 0,
        "crop_y1": 0,
        "crop_x2": 1280,
        "crop_y2": 720,
        "detection_hold_frames": 2,
        "current_model": "yolov8n",
        "flip_horizontal": False,
        "flip_vertical": False
    }
    
    # Write to file
    try:
        with open(settings_file, 'w') as f:
            json.dump(default_settings, f, indent=2)
        print(f"✓ Created {settings_file} with default settings:")
        print(json.dumps(default_settings, indent=2))
    except Exception as e:
        print(f"✗ Error creating settings file: {e}")

if __name__ == "__main__":
    create_default_settings()
