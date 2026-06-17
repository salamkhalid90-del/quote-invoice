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
call npm.cmd run desktop
