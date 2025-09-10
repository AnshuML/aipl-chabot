@echo off
echo ========================================
echo Zorro Bot - Local CI/CD Deployment
echo ========================================

echo.
echo Step 1: Stopping existing services...
taskkill /F /IM python.exe /T 2>nul || echo "No Python processes to kill"
taskkill /F /IM node.exe /T 2>nul || echo "No Node processes to kill"

echo.
echo Step 2: Pulling latest changes from GitHub...
git pull origin main
if %errorlevel% neq 0 (
    echo Git pull failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Installing Backend Dependencies...
cd api
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Backend setup failed!
    pause
    exit /b 1
)

echo.
echo Step 4: Installing Admin Frontend Dependencies...
cd ..\admin-frontend
npm install
if %errorlevel% neq 0 (
    echo Admin frontend setup failed!
    pause
    exit /b 1
)

echo.
echo Step 5: Installing Chat Frontend Dependencies...
cd ..\chat-frontend
npm install
if %errorlevel% neq 0 (
    echo Chat frontend setup failed!
    pause
    exit /b 1
)

echo.
echo Step 6: Building Frontend Applications...
cd ..\admin-frontend
npm run build
if %errorlevel% neq 0 (
    echo Admin frontend build failed!
    pause
    exit /b 1
)

cd ..\chat-frontend
npm run build
if %errorlevel% neq 0 (
    echo Chat frontend build failed!
    pause
    exit /b 1
)

echo.
echo Step 7: Starting Services...
cd ..\api
start "Backend API" cmd /k "uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

cd ..\admin-frontend
start "Admin Frontend" cmd /k "npm run dev"

cd ..\chat-frontend
start "Chat Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Services running on:
echo - Backend API: http://localhost:8000
echo - Chat Frontend: http://localhost:5173
echo - Admin Frontend: http://localhost:5174
echo.
echo Press any key to exit...
pause > nul
