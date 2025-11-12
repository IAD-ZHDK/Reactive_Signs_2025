@echo off
cd "C:\Users\user\Desktop\"
echo starting...
echo closing open applications gracefully...

REM Close Chrome gracefully by closing all windows (prevents "unexpected close" popup)
taskkill /IM chrome.exe /T >nul 2>&1
timeout /t 2 /nobreak >nul

REM Force kill if still running
TASKKILL /F /IM chrome.exe >nul 2>&1
TASKKILL /F /IM python.exe >nul 2>&1
TASKKILL /F /IM node.exe >nul 2>&1

echo starting cameraPoseOSC
cd "C:\Users\User\Desktop\Reactive_Signs_2025\cameraPoseOSC\" &
start /min cmd /c ".\venv\Scripts\activate.bat && python -u run_detector_gui.py --gpu 0"
echo Python pose detector with GUI started in background 

TIMEOUT /t 10
echo npm version:
CMD /C npm --version

TIMEOUT /t 1

echo ensure that the port is free
CMD /C npx kill-port --port 8081 

TIMEOUT /t 2
echo starting Chrome in kiosk mode
start chrome --start-fullscreen http://localhost:8081 ^
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
  --no-crash-upload ^
  --disable-session-crashed-bubble ^
  --disable-infobars ^
  --disable-restore-session-state ^
  --disk-cache-dir=nul

echo changing to exhibition directory
cd "C:\Users\User\Desktop\Reactive_Signs_2025\2025_Exhibition\"
echo Current directory: %CD%

echo starting http-server in background on port 8081
start /min cmd /c "npx http-server -p 8081"

TIMEOUT /t 5
echo.
echo ============================================
echo All services started successfully!
echo ============================================
echo - Camera Pose Detector: Running in background
echo - HTTP Server: http://localhost:8081
echo - Chrome: Full screen mode
echo.
echo Press Ctrl+C to stop all services
echo ============================================
pause