#!/usr/bin/env python3
"""Quick test to verify GUI can be imported"""

try:
    from detector_gui import DetectorGUI
    print("✓ DetectorGUI imports successfully")
except Exception as e:
    print(f"✗ Import failed: {e}")
    import traceback
    traceback.print_exc()
