@echo off
echo ============================================
echo   Starting ALL Backend Services
echo ============================================
echo.

REM Start MongoDB in background
echo [1/3] Starting MongoDB...
start /B mongod >nul 2>&1
timeout /t 2 /nobreak >nul
echo      MongoDB started

REM Start ML Backend in background
echo [2/3] Starting ML Backend (Python)...
cd ml-backend
start /B python app.py >nul 2>&1
cd ..
timeout /t 3 /nobreak >nul
echo      ML Backend started on port 5001

REM Start Node.js Backend (foreground - shows logs)
echo [3/3] Starting Node.js Backend...
echo.
echo ============================================
echo   Backend Services Running:
echo   - MongoDB: Port 27017
echo   - ML Backend: Port 5001
echo   - Node Backend: Port 3001
echo ============================================
echo.
cd backend
node server.js
