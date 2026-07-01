@echo off
cd /d "%~dp0"
if not exist backups mkdir backups
for /f %%i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set stamp=%%i
powershell -NoProfile -ExecutionPolicy Bypass -Command "$dest='backups\smart-quote-backup-%stamp%.zip'; $paths=@(); if(Test-Path 'data'){ $paths += 'data' }; if(Test-Path 'public\uploads'){ $paths += 'public\uploads' }; Compress-Archive -Path $paths -DestinationPath $dest -Force; Write-Host ('Backup created: ' + $dest)"
pause
