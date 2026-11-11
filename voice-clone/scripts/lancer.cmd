@echo off
cd /d "%~dp0.."
title Clonage de voix
if not exist ".venv\Scripts\python.exe" goto noinstall
".venv\Scripts\python.exe" clone.py
goto fin
:noinstall
echo Lance d'abord INSTALLER.bat
:fin
echo.
pause
