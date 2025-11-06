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
echo starting Chrome in kiosk mode
start chrome --kiosk http://localhost:8081 ^
  --no-first-run ^
  --no-default-browser-check ^
  --no-pings ^
  --no-service-autorun ^
  --disable-background-networking ^
  --disable-breakpad ^
  --disable-client-side-phishing-detection ^
  --disable-component-extensions-with-background-pages ^
  --disable-component-update ^
  --disable-default-apps ^
  --disable-device-discovery-notifications ^
  --disable-extensions ^
  --disable-features=InterestFeedContentSuggestions ^
  --disable-geolocation ^
  --disable-preconnect ^
  --disable-sync ^
  --enable-automation ^
  --no-crash-upload ^
  --disable-session-crashed-bubble ^
  --disable-infobars ^
  --disable-restore-session-state ^
  --no-default-browser-check ^
  --disk-cache-dir=nul

echo changing to exhibition directory
cd "C:\Users\User\Desktop\Reactive_Signs_2025\2025_Exhibition\"
echo Current directory: %CD%

echo starting http-server in background on port 8081
start /min cmd /k "npx http-server -p 8081"

TIMEOUT /t 5
echo running....
echo Press Ctrl+C to stop