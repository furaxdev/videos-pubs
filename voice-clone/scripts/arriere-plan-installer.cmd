@echo off
cd /d "%~dp0.."
set "D=%CD%\"
if not exist ".venv\Scripts\pythonw.exe" goto noinstall
echo Creation de la tache de fond ServeurDeVoix...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$d='%D%'; $a=New-ScheduledTaskAction -Execute ($d+'.venv\Scripts\pythonw.exe') -Argument 'server.py --service' -WorkingDirectory $d; $t=New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME; $s=New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew; Register-ScheduledTask -TaskName 'ServeurDeVoix' -Action $a -Trigger $t -Settings $s -Force | Out-Null; Start-ScheduledTask -TaskName 'ServeurDeVoix'"
if errorlevel 1 goto erreur
echo Le PC ne se mettra plus en veille. L'ecran pourra s'eteindre.
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
echo.
echo ============================================================
echo  C'est en route EN ARRIERE-PLAN, sans aucune fenetre.
echo  - Il se relance tout seul a l'ouverture de session Windows
echo    et s'il plante.
echo  - Le chargement du modele prend quelques minutes.
echo  - Messages et erreurs : fichier server.log dans ce dossier
echo  - Verifier : ARRIERE-PLAN-ETAT.bat
echo  - Tout arreter : ARRIERE-PLAN-ARRETER.bat
echo ============================================================
goto fin
:noinstall
echo Lance d'abord INSTALLER.bat puis LANCER.bat
goto fin
:erreur
echo *** Echec. Prends une photo de cette fenetre et envoie-la moi. ***
:fin
echo.
pause
