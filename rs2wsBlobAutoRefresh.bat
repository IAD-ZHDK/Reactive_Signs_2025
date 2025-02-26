
@echo off

counter=1
while [ $counter -le 1000 ]
do
    echo closing open java windows...
    TASKKILL /F /IM javaw.exe
    TIMEOUT /t 5
    ((counter++))
    echo starting tracker attempt:
    echo $counter
    start rs2wsBlob.lnk &
    TIMEOUT /t 200
done
echo All done

/bin/bash