@echo off
powershell -NoProfile -Command "Stop-ScheduledTask -TaskName 'ServeurDeVoix' -ErrorAction SilentlyContinue; Unregister-ScheduledTask -TaskName 'ServeurDeVoix' -Confirm:$false -ErrorAction SilentlyContinue"
taskkill /f /im pythonw.exe >nul 2>nul
taskkill /f /im ngrok.exe >nul 2>nul
taskkill /f /im cloudflared.exe >nul 2>nul
echo Serveur de voix arrete et retire du demarrage.
echo.
pause
