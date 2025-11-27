# Templates for Reactive Signs Module 2025
Templates for the 2025 module.

The repository contains a number of basic examples in the Poster_Templates, together with a custom library for handling pose tracking and aspect ratio.

![Posters](/Raw/JT_Poster.gif?raw=true)| ![Posters](/Raw/RC_DS_Gif_Animation.gif?raw=true)         
:-------------------------------------:|:---------------------------------:

 These variables hold the coordinates of a tracker point, based on the camera and object (people) detection. When the python tracking application is not available, the data will be controlled by the mouse.

 ```javascript
 poster.position.x  // represents left to right movement of one user 
 poster.position.y  // represents up and down movement of one user. Use sparingly, as this movement is less intuitive! 

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