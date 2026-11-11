@echo off
cd /d "%~dp0.."
title Installation du clonage de voix
echo ============================================================
echo  Installation : 10 a 20 minutes, environ 3 Go a telecharger
echo  Tout reste sur TON PC. Rien n'est envoye nulle part.
echo ============================================================
echo.
where uv >nul 2>nul
if not errorlevel 1 goto haveuv
echo [1/3] Installation de uv, le gestionnaire Python...
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://astral.sh/uv/install.ps1 | iex"
:haveuv
set "PATH=%USERPROFILE%\.local\bin;%PATH%"
where uv >nul 2>nul
if errorlevel 1 goto erreur
echo [2/3] Creation de l'environnement Python 3.11...
uv venv --python 3.11 .venv
if errorlevel 1 goto erreur
echo [3/3] Installation de Chatterbox, le clonage de voix...
uv pip install --python ".venv\Scripts\python.exe" chatterbox-tts sounddevice soundfile lameenc numpy pyngrok
if errorlevel 1 goto erreur
echo.
echo Installation terminee. Lance maintenant LANCER.bat
goto fin
:erreur
echo.
echo *** Une etape a echoue. Prends une photo de cette fenetre et envoie-la moi. ***
:fin
echo.
pause
