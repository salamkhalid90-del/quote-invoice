@echo off
cd /d "%~dp0"
echo Starting Smart Quote...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath npm.cmd -ArgumentList 'run','start','--','-H','127.0.0.1','-p','3000' -WorkingDirectory '%~dp0' -WindowStyle Minimized"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 3"
call "%~dp0node_modules\.bin\electron.cmd" "electron\main.cjs"
