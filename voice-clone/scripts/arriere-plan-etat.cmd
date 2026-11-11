@echo off
cd /d "%~dp0.."
powershell -NoProfile -Command "$t=Get-ScheduledTask -TaskName 'ServeurDeVoix' -ErrorAction SilentlyContinue; if(-not $t){'Tache non installee.'}else{'Etat de la tache : '+$t.State}"
echo.
echo --- Dernieres lignes de server.log ---
if not exist server.log goto nolog
powershell -NoProfile -Command "Get-Content server.log -Tail 15"
goto adresse
:nolog
echo Pas encore de journal.
:adresse
echo.
if exist connexion.txt findstr /b "ADRESSE" connexion.txt
echo.
pause
