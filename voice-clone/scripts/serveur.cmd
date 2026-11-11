@echo off
cd /d "%~dp0.."
title Serveur de voix - laisse cette fenetre ouverte
if not exist ".venv\Scripts\python.exe" goto noinstall
".venv\Scripts\python.exe" server.py
goto fin
:noinstall
echo Lance d'abord INSTALLER.bat
:fin
echo.
pause
