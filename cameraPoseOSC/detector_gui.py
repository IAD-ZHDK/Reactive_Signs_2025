"""
Modern GUI control panel for YOLO Detector
Clean dark interface with toggles and sliders
Note: GUI is optional - if it fails, the detector will continue to work
"""

import tkinter as tk
from tkinter import ttk
import sys


class DetectorGUI:
    """Modern dark-themed GUI for detector controls"""
    
    def __init__(self, detector):
        self.detector = detector
        self.root = tk.Tk()
        self.root.title("Pose Detector Controls")
        self.root.geometry("400x900")
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
        # Greyscale theme colors
        self.bg_color = "#000000"
        self.fg_color = "#FFFFFF"
        self.widget_bg = "#1a1a1a"
        self.accent_color = "#CCCCCC"  # Light grey instead of green
        self.gray_color = "#808080"
        
        # Configure root
        self.root.configure(bg=self.bg_color)
        
        # Try to use RobotoMono font, fallback to Courier
        try:
            self.font = ("Roboto Mono", 10)
            self.font_title = ("Roboto Mono", 12, "bold")
        except:
            self.font = ("Courier", 10)
            self.font_title = ("Courier", 12, "bold")
        
        # Create main container without scrollbar
        self.main_container = tk.Frame(self.root, bg=self.bg_color)
        self.main_container.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Create two columns
        self.left_column = tk.Frame(self.main_container, bg=self.bg_color)
        self.left_column.pack(side="left", fill="both", expand=True, padx=5)
        
        self.right_column = tk.Frame(self.main_container, bg=self.bg_color)
        self.right_column.pack(side="left", fill="both", expand=True, padx=5)
        
        # Variables for live updates
        self.fps_var = tk.StringVar(value="FPS: --")
        self.device_var = tk.StringVar(value="Device: --")
        self.model_var = tk.StringVar(value="Model: --")
        
        # Build UI
        self.build_ui()
        
        # Start updating values
        self.update_values()
    
    def build_ui(self):
        """Build the complete UI in two columns"""
        # LEFT COLUMN
        left = self.left_column
        
        # === SYSTEM INFO ===
        self.create_section(left, "SYSTEM INFO")
        
        fps_label = tk.Label(left, textvariable=self.fps_var, bg=self.bg_color, 
                            fg=self.fg_color, font=self.font)
        fps_label.pack(pady=5, padx=10, fill="x")
        
        device_label = tk.Label(left, textvariable=self.device_var, bg=self.bg_color,
                               fg=self.fg_color, font=self.font)
        device_label.pack(pady=5, padx=10, fill="x")
        
        model_label = tk.Label(left, textvariable=self.model_var, bg=self.bg_color,
                              fg=self.fg_color, font=self.font)
        model_label.pack(pady=5, padx=10, fill="x")
        
        # === DISPLAY ===
        self.create_section(left, "DISPLAY")
        self.create_toggle(left, "Show Detections", "show_detections")
        self.create_toggle(left, "Draw Confidence", "draw_confidence")
        
        # === IMAGE PROCESSING ===
        self.create_section(left, "IMAGE PROCESSING")
        self.create_toggle(left, "Enable Enhancements", "enable_enhancements")
        self.create_toggle(left, "Flip Horizontal", "flip_horizontal")
        self.create_toggle(left, "Flip Vertical", "flip_vertical")
        self.create_toggle(left, "Auto Enhance", "auto_enhance")
        self.create_slider(left, "Brightness", "brightness", 0.0, 2.0)
        self.create_slider(left, "Contrast", "contrast", 0.0, 2.0)
        self.create_slider(left, "Saturation", "saturation", 0.0, 2.0)
        
        # === DETECTION ===
        self.create_section(left, "DETECTION")
        self.create_slider(left, "Confidence Threshold", "confidence_threshold", 0.0, 1.0)
        
        # RIGHT COLUMN
        right = self.right_column
        
        # === SMOOTHING ===
        self.create_section(right, "SMOOTHING")
        self.create_slider(right, "Smoothing Alpha", "smoothing_alpha", 0.0, 1.0)
        self.create_slider(right, "Hold Frames", "detection_hold_frames", 0, 30, step=1)  # Integer only
        
        # === MODEL ===
        self.create_section(right, "MODEL")
        models = ["yolov8n", "yolov8s", "yolov8l", "yolov9c", "yolov10n", "yolov10s", "exdark"]
        current_model = getattr(self.detector, 'selected_model_key', 'yolov8n')
        self.create_dropdown(right, "Model", models, self.on_model_change, initial_value=current_model)
        self.create_slider(right, "Inference Size", "inference_size", 160, 640, step=32)  # Integer only
        
        # === CAMERA ===
        self.create_section(right, "CAMERA")
        cameras = ["0", "1", "2", "3", "4"]  # Common camera indices
        current_camera = str(getattr(self.detector, 'camera_id', 0))
        self.create_dropdown(right, "Camera ID", cameras, self.on_camera_change, initial_value=current_camera)
        self.create_button(right, "Restart Camera", self.on_restart_camera)
        
        # === SETTINGS ===
        self.create_section(right, "SETTINGS")
        self.create_button(right, "Save Settings", self.detector.save_settings)
        
        # === GPU (if available) ===
        if hasattr(self.detector, 'device') and self.detector.device.startswith('cuda'):
            self.create_section(right, "GPU")
            self.create_toggle(right, "FP16 Precision", "use_fp16", 
                             callback=self.toggle_fp16)
    
    def create_section(self, parent, title):
        """Create a styled section header"""
        label = tk.Label(
            parent, text=f"  {title}", bg=self.widget_bg, fg=self.accent_color,
            font=self.font_title, anchor="w", padx=10, pady=8
        )
        label.pack(pady=(15, 5), padx=5, fill="x")
    
    def create_toggle(self, parent, label, attr, callback=None):
        """Create a toggle switch"""
        frame = tk.Frame(parent, bg=self.bg_color)
        frame.pack(pady=5, padx=10, fill="x")
        
        var = tk.BooleanVar(value=getattr(self.detector, attr, False))
        
        def on_toggle():
            setattr(self.detector, attr, var.get())
            if callback:
                callback(var.get())
        
        check = tk.Checkbutton(
            frame, text=label, variable=var, command=on_toggle,
            bg=self.bg_color, fg=self.fg_color, selectcolor=self.widget_bg,
            activebackground=self.bg_color, activeforeground=self.accent_color,
            font=self.font
        )
        check.pack(anchor="w")
    
    def create_slider(self, parent, label, attr, min_val, max_val, step=0.01):
        """Create a labeled slider"""
        frame = tk.Frame(parent, bg=self.bg_color)
        frame.pack(pady=5, padx=10, fill="x")
        
        current_val = getattr(self.detector, attr, (min_val + max_val) / 2)
        
        # Determine if this is an integer slider
        is_integer = step >= 1
        
        label_frame = tk.Frame(frame, bg=self.bg_color)
        label_frame.pack(fill="x", pady=(0, 3))
        
        label_widget = tk.Label(label_frame, text=label, bg=self.bg_color, 
                               fg=self.fg_color, font=self.font)
        label_widget.pack(side="left")
        
        # Format value based on type
        value_text = f"{int(current_val)}" if is_integer else f"{current_val:.2f}"
        value_label = tk.Label(label_frame, text=value_text, 
                              bg=self.bg_color, fg=self.accent_color, font=self.font)
        value_label.pack(side="right")
        
        def on_slider(val):
            if is_integer:
                int_val = int(float(val))
                setattr(self.detector, attr, int_val)
                value_label.config(text=f"{int_val}")
            else:
                float_val = float(val)
                setattr(self.detector, attr, float_val)
                value_label.config(text=f"{float_val:.2f}")
        
        slider = tk.Scale(
            frame, from_=min_val, to=max_val, orient="horizontal",
            resolution=step,  # Allow float values with this resolution
            bg=self.widget_bg, fg=self.accent_color, highlightthickness=0,
            command=on_slider, troughcolor=self.widget_bg,
            activebackground=self.accent_color
        )
        slider.set(current_val)
        slider.pack(fill="x")
    
    def create_dropdown(self, parent, label, options, callback, initial_value=None):
        """Create a dropdown menu"""
        frame = tk.Frame(parent, bg=self.bg_color)
        frame.pack(pady=5, padx=10, fill="x")
        
        label_widget = tk.Label(frame, text=label, bg=self.bg_color,
                               fg=self.fg_color, font=self.font)
        label_widget.pack(side="left", padx=(0, 10))
        
        # Use initial_value if provided and valid, otherwise use first option
        if initial_value and initial_value in options:
            default_value = initial_value
        else:
            default_value = options[0]
        
        var = tk.StringVar(value=default_value)
        
        dropdown = ttk.Combobox(
            frame, textvariable=var, values=options, state="readonly",
            width=20
        )
        dropdown.pack(side="right", fill="x", expand=True)
        dropdown.bind("<<ComboboxSelected>>", lambda e: callback(var.get()))
        
        return var  # Return the variable so caller can update it later if needed
    
    def create_button(self, parent, label, command):
        """Create a button"""
        btn = tk.Button(
            parent, text=label, command=command,
            bg=self.widget_bg, fg=self.accent_color, font=self.font,
            activebackground=self.accent_color, activeforeground=self.bg_color,
            padx=10, pady=8, relief="flat", border=0
        )
        btn.pack(pady=5, padx=10, fill="x")
    
    def on_model_change(self, model):
        """Handle model selection change"""
        try:
            self.detector.switch_model(model)
        except Exception as e:
            print(f"Error switching model: {e}")
    
    def on_camera_change(self, camera_id_str):
        """Handle camera selection change"""
        try:
            camera_id = int(camera_id_str)
            if camera_id != self.detector.camera_id:
                self.detector.switch_camera(camera_id)
        except Exception as e:
            print(f"Error switching camera: {e}")
    
    def on_restart_camera(self):
        """Handle camera restart button"""
        print("Camera restart requested (manual control via keyboard: X)")
    
    def toggle_fp16(self, value):
        """Handle FP16 toggle"""
        try:
            if value:
                self.detector.model.model.half()
                print("✓ FP16 enabled")
            else:
                self.detector.model.model.float()
                print("✓ FP32 enabled")
        except Exception as e:
            print(f"✗ Failed to toggle precision: {e}")
            self.detector.use_fp16 = False
    
    def update_values(self):
        """Update displayed values from detector"""
        try:
            self.fps_var.set(f"FPS: {self.detector.current_fps:.1f}")
            self.device_var.set(f"Device: {getattr(self.detector, 'device', 'unknown')}")
            self.model_var.set(f"Model: {self.detector.current_model_name}")
        except:
            pass
        
        # Update every 100ms
        self.root.after(100, self.update_values)
    
    def run(self):
        """Start the GUI (blocking, but handles events properly)"""
        try:
            self.root.mainloop()
        except Exception as e:
            print(f"GUI error: {e}")
    
    def on_closing(self):
        """Handle window close"""
        try:
            self.root.quit()
        except:
            pass
    
    def destroy(self):
        """Close the GUI"""
        try:
            self.root.quit()
        except:
            pass
