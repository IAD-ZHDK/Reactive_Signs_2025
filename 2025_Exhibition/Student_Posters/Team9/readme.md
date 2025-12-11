Notes on changes from Luke
- I changed to webgl mode for performance: this probably wasn't needed since there was other issues causing the slow framerate
- framerate(10) removed: This was causing the slow framerate, there is always a better way to slow down an animation.
- Turns out quad is very slow: I replaced it with rotated rectangles.
- const speed = 0.025; I reduced this to compensate for the higher framerate
- amplitude was hardcoded!
