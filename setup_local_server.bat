@echo off
echo ========================================
echo AIPL ChatBot Local Server Setup
echo ========================================

echo.
echo Step 1: Installing Backend Dependencies...
cd api
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Backend setup failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Installing Chat Frontend Dependencies...
cd ..\chat-frontend
npm install
if %errorlevel% neq 0 (
    echo Chat frontend setup failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Installing Admin Frontend Dependencies...
cd ..\admin-frontend
npm install
if %errorlevel% neq 0 (
    echo Admin frontend setup failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete! 
echo ========================================
echo.
echo To start the services:
echo 1. Backend: cd api && uvicorn app.main:app --host 0.0.0.0 --port 8000
echo 2. Chat Frontend: cd chat-frontend && npm run dev
echo 3. Admin Frontend: cd admin-frontend && npm run dev
echo.
echo Access URLs:
echo - Backend API: http://localhost:8000
echo - Chat Frontend: http://localhost:5173
echo - Admin Frontend: http://localhost:5174
echo.
pause
