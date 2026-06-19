@echo off
cd /d "%~dp0"
echo Starting Smart Quote...
start "Smart Quote Server" /min npm.cmd run start -- -H 127.0.0.1 -p 3000
timeout /t 3 /nobreak >nul
call npm.cmd run desktop
