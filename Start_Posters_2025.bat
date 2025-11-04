@echo off
cd "C:\Users\user\Desktop\"
echo starting...
echo closing open chrome windows...

TASKKILL /F /IM chrome.exe
TASKKILL /F /IM python.exe
TASKKILL /F /IM node.exe

echo starting cameraPoseOSC
cd "C:\Users\User\Desktop\Reactive_Signs_2025\cameraPoseOSC\" &
start cmd /k ".\venv\Scripts\activate.bat && python -u pose_detector_yoloV8.py --gpu 0"
echo Python pose detector started in new window 


TIMEOUT /t 10
echo npm version:
CMD /C npm --version

TIMEOUT /t 1

echo ensure that the port is free
CMD /C npx kill-port --port 8081 

TIMEOUT /t 2
echo starting Chrome in fullscreen mode
start chrome --start-fullscreen --disable-session-crashed-bubble --disable-infobars --disable-restore-session-state http://localhost:8081

echo changing to exhibition directory
cd "C:\Users\User\Desktop\Reactive_Signs_2025\2025_Exhibition\"
echo Current directory: %CD%

echo starting http-server in background on port 8081
start /min cmd /k "npx http-server -p 8081"

TIMEOUT /t 5
echo running....
echo Press Ctrl+C to stop