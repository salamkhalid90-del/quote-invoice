@echo off
cd /d "%~dp0"
echo Preparing Smart Quote desktop app...
call npm.cmd run desktop:prepare
if errorlevel 1 (
  echo.
  echo Failed to prepare the app. Press any key to close.
  pause >nul
  exit /b 1
)
echo Starting local server...
start "Smart Quote Server" /min npm.cmd run start -- -H 127.0.0.1 -p 3000
timeout /t 3 /nobreak >nul
echo Opening desktop app...
call npm.cmd run desktop
