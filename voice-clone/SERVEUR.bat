@echo off
chcp 65001 >nul
title Serveur de voix (laisse cette fenetre ouverte)
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Lance d'abord INSTALLER.bat
  pause
  exit /b 1
)
".venv\Scripts\python.exe" server.py
pause
