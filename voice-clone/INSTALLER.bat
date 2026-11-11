@echo off
chcp 65001 >nul
title Installation du clonage de voix (une seule fois)
cd /d "%~dp0"
echo ============================================================
echo  Installation - ca prend 10 a 20 minutes (telechargement ~3 Go)
echo  Tout reste sur TON PC. Rien n'est envoye nulle part.
echo ============================================================
where uv >nul 2>nul
if errorlevel 1 (
  echo [1/3] Installation de uv (gestionnaire Python)...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://astral.sh/uv/install.ps1 | iex"
)
set "PATH=%USERPROFILE%\.local\bin;%PATH%"
echo [2/3] Creation de l'environnement Python 3.11...
uv venv --python 3.11 .venv || goto :erreur
echo [3/3] Installation de Chatterbox (clonage de voix)...
uv pip install --python ".venv\Scripts\python.exe" chatterbox-tts sounddevice soundfile lameenc numpy pyngrok || goto :erreur
echo.
echo ============================================================
echo  Installation terminee ! Lance maintenant : LANCER.bat
echo ============================================================
pause
exit /b 0
:erreur
echo.
echo *** Une etape a echoue. Prends une photo de cette fenetre et envoie-la moi. ***
pause
exit /b 1
