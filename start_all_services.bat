@echo off
echo ========================================
echo Starting AIPL ChatBot Services
echo ========================================

echo.
echo Starting Backend API...
start "Backend API" cmd /k "cd api && uvicorn app.main:app --host 0.0.0.0 --port 8000"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Chat Frontend...
start "Chat Frontend" cmd /k "cd chat-frontend && npm run dev"

echo.
echo Starting Admin Frontend...
start "Admin Frontend" cmd /k "cd admin-frontend && npm run dev"

echo.
echo ========================================
echo All Services Started!
echo ========================================
echo.
echo Access URLs:
echo - Backend API: http://localhost:8000
echo - Chat Frontend: http://localhost:5173
echo - Admin Frontend: http://localhost:5174
echo.
echo Press any key to exit...
pause > nul