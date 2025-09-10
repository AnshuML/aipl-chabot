@echo off
echo ========================================
echo Zorro Bot - Auto Deploy Script
echo ========================================

:loop
echo.
echo Checking for updates at %date% %time%...

REM Check if there are any changes
git fetch origin main
git diff HEAD origin/main --quiet
if %errorlevel% neq 0 (
    echo Changes detected! Starting deployment...
    call deploy-local.bat
    echo.
    echo Waiting 60 seconds before next check...
    timeout /t 60 /nobreak > nul
) else (
    echo No changes detected. Waiting 30 seconds...
    timeout /t 30 /nobreak > nul
)

goto loop
