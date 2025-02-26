# Templates for Reactive Signs Module 2023
Templates for the 2024 module

The repository contains a number of basic examples in the Poster_Templates, together with a custom libraries for handling skeleton tracking etc. 

![Posters](/Raw/JT_Poster.gif?raw=true)| ![Posters](/Raw/RC_DS_Gif_Animation.gif?raw=true)         
:-------------------------------------:|:---------------------------------:

 These variables hold the coordinates of a tracker point, based on the camera and blob detection. When no camera is available the data will be controled by the mouse.

 ```javascript
 poster.position.x  // represents left to right movement of one user 
 poster.position.y  // represents up and down movement of one user. Use sparingly, as this movement is less intuitive. 
 poster.position.z  // represents distance from the user to the screen. 

poster.posNormal.x,  poster.posNormal.y,  poster.posNormal.z  //The same as "position" but normalised. i.e values between 0 and 1. 
```

These variables provide units which are safer than using pixel coordinates. 
 ```javascript
poster.vw // 1 percent of viewport width
poster. vh // 1  percent of viewport height
```

#  Testing your code on the duel display

The monitors and the computer have been setup to make testing as fast as possible.

Let's say you want to test out the folder called "my_demo" in the Poster_Templates:

```bash 
│   ├── Poster_Templates
│   │   ├── my_demo
│   │   │   ├── index.html
│   │   │   ├── sketch.js
│   │   ├── demo_poster_3D
│   │   ├── demo_poster_images
│   │   ├── demo_poster_simple
│   │   ├── demo_poster_depth
│   │   ├── libraries
│   │   ├── style.cs
│

```

- Copy the "my_demo" folder to a USB thumb-drive, and rename the folder "Poster".
- Turn on the Dual-Monitor PC if necessary 
- Close any open program windows 
- If the screen is rotated, click the following icon to set it to portrait 

![icon](/Raw/iconPortrait.png?raw=true)

- If "Poster" already exists on the desktop of the Dual-Monitor PC, delete it.
- Don't delete or move anything else!
- Move "Poster" to the desktop of the Dual-Monitor PC.
- Click the "startPoster" icon on the desktop 
- Your project should now run after a few seconds


#  Running realSense OSC (rs2wsBlob) - Optional
The Processing (JAVA) application connects to the realsense camera, and provides all the data over OSC. 

To run, install [Processing]( https://processing.org/download).

Navigate to the rs2wsBlob folder, and open any file with Processing.

Install the following libraries via the Library Manager

- bildspur.realsense
- controlP5
- oscP5
- opencv

Hit the play button.

#  Recording Screen Capture 

- Press Shift-R to start recording
- Press Shift-S to stop and save recording to your download folders