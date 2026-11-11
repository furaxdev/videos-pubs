@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=(New-Object -ComObject WScript.Shell).CreateShortcut([Environment]::GetFolderPath('Startup')+'\Serveur de voix.lnk'); $s.TargetPath='%~dp0SERVEUR.bat'; $s.WorkingDirectory='%~dp0'; $s.WindowStyle=7; $s.Save()"
echo.
echo  Le serveur de voix se lancera tout seul a chaque demarrage de Windows (fenetre reduite).
echo  Pour annuler : supprime « Serveur de voix » dans le dossier  shell:startup  (Win+R).
pause
