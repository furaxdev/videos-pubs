@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist ".venv\Scripts\pythonw.exe" (
  echo Lance d'abord INSTALLER.bat puis LANCER.bat
  pause
  exit /b 1
)
echo Creation de la tache de fond "ServeurDeVoix"...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$d='%~dp0'; $a=New-ScheduledTaskAction -Execute ($d+'.venv\Scripts\pythonw.exe') -Argument 'server.py --service' -WorkingDirectory $d; $t=New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME; $s=New-ScheduledTaskSettingsSet -RestartCount 999 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit ([TimeSpan]::Zero) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew; Register-ScheduledTask -TaskName 'ServeurDeVoix' -Action $a -Trigger $t -Settings $s -Force | Out-Null; Start-ScheduledTask -TaskName 'ServeurDeVoix'" || goto :erreur
echo Le PC ne se mettra plus en veille (l'ecran peut s'eteindre).
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
echo.
echo ============================================================
echo  C'est en route EN ARRIERE-PLAN (aucune fenetre).
echo  - Il se relance tout seul a chaque ouverture de session Windows
echo    et s'il plante.
echo  - Le chargement du modele prend quelques minutes au demarrage.
echo  - Messages et erreurs : fichier server.log (ce dossier)
echo  - Pour verifier : ouvre ARRIERE-PLAN-ETAT.bat
echo  - Pour tout arreter : ARRIERE-PLAN-ARRETER.bat
echo ============================================================
pause
exit /b 0
:erreur
echo *** Echec. Prends une photo de cette fenetre et envoie-la moi. ***
pause
exit /b 1
