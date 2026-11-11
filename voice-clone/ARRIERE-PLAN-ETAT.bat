@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -Command "$t=Get-ScheduledTask -TaskName 'ServeurDeVoix' -ErrorAction SilentlyContinue; if(-not $t){'Tache non installee.'} else {'Etat de la tache : '+$t.State}"
echo.
echo --- Dernieres lignes de server.log ---
if exist server.log (powershell -NoProfile -Command "Get-Content server.log -Tail 15") else (echo Pas encore de journal.)
echo.
if exist connexion.txt (echo --- Adresse --- & type connexion.txt | findstr /b "ADRESSE")
pause
