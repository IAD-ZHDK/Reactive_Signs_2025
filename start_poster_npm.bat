// requires NPM local server module 
@echo off
cd "C:\Users\user\Desktop\"
echo starting...
echo closing open chrome windows...

TASKKILL /F /IM chrome.exe
TASKKILL /F /IM javaw.exe

echo starting tracker
start rs2wsBlob.lnk &

TIMEOUT /t 10
echo npm version:
CMD /C npm --version

TIMEOUT /t 1

echo ensure that the port is free
CMD /C npx kill-port --port 8080 &

TIMEOUT /t 2
start chrome --start-fullscreen http://localhost:8080
//start chrome --start http://localhost:8080 &

cd "C:\Users\user\Desktop\2023_Exhibition\"
echo start server in background
CMD /C http-server -p 8080 &

TIMEOUT /t 10
echo running....

/bin/bash