# Templates for Reactive Signs Module 2025
Templates for the 2025 module.

The repository contains a number of basic examples in the Poster_Templates, together with a custom library for handling pose tracking and aspect ratio. Use the examples in the folder Poster_Templates to get started. 

![Posters](/Raw/JT_Poster.gif?raw=true)| ![Posters](/Raw/RC_DS_Gif_Animation.gif?raw=true)         
:-------------------------------------:|:---------------------------------:

## Table of contents

- `Poster_Templates/` — example poster templates (3D, depth, images, simple). This is the most important folder for students, and the first place to start when preparing the code. 
- `2025_Exhibition/` — exhibition: this is what is running on location 
- `cameraPoseOSC/` — Python pose-detection: this is used for tracking the position of people in front of the posters. The tracking is fairly simple, using ML to detect the position and broadcast that position over OSC. If there is more than one person present, it will take an average use the mid point between those people. 
- `library/` — the code base for the library used to support the posters

## Variables

 These variables hold the coordinates of a tracker point, based on the camera and object (people) detection. When the python tracking application is not available, the data will be controlled by the mouse. Do not use mouseX and mouseY in place of these variables: your poster will not work with people tracking if you do this. 

 ```javascript
 poster.position.x  // represents left to right movement of one user 
 poster.position.y  // represents up and down movement of one user. Use sparingly: as this value only changes when people jump up and down!  

poster.posNormal.x,  poster.posNormal.y //The same as "position" but normalised. i.e values between 0 and 1. 
```

These variables provide units which are safer than using pixel coordinates. 
 ```javascript
poster.vw // 1 percent of viewport width
poster.vh // 1  percent of viewport height
```

Use getCounter to find the correct number to be displayed. For testing, use the up and down keys to cycle through numbers.  

 ```javascript
    poster.getCounter() // the number that should be displayed
```

#  Recording Screen Capture 

- Press Shift-R to start recording
- Press Shift-S to stop and save recording to your download folders

