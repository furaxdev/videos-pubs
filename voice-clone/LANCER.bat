@echo off
chcp 65001 >nul
title Clonage de voix
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Lance d'abord INSTALLER.bat
  pause
  exit /b 1
)
".venv\Scripts\python.exe" clone.py
pause
