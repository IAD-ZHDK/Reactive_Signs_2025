// using python local server 

cd "C:\Users\user\Desktop\"
//echo --resize screen and start realsense
//start SpannedScreen.lnk
start rs2wsBlob.lnk
TIMEOUT /t 5
cd "C:\Users\user\Desktop\2023_Exhibition\"
start chrome --start-fullscreen http://localhost:8080
py -m http.server 8080 