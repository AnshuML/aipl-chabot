@echo off
echo Starting AIPL Chatbot System...
echo.

echo Starting Backend API...
start "API Server" cmd /k "cd api && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo Starting Admin Frontend...
start "Admin Panel" cmd /k "cd admin-frontend && npm run dev"

timeout /t 2 /nobreak > nul

echo Starting Chat Frontend...
start "Chat Interface" cmd /k "cd chat-frontend && npm run dev"

echo.
echo All services are starting...
echo.
echo Access Points:
echo - API Documentation: http://localhost:8000/docs
echo - Admin Panel: http://localhost:5173
echo - Chat Interface: http://localhost:5174
echo.
echo Press any key to run system test...
pause > nul

python test_complete_system.py

echo.
echo Press any key to exit...
pause > nul
