@echo off
echo ============================================
echo   MediTrust Pharmacy Management System
echo   WITH MACHINE LEARNING
echo ============================================
echo.
echo Starting all services...
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo      MongoDB is already running
) else (
    echo      Starting MongoDB...
    start "MongoDB" cmd /k "cd C:\Program Files\MongoDB\Server\8.0\bin && mongod"
    timeout /t 3 /nobreak >nul
)
echo.

REM Start ML Backend (Python)
echo [2/4] Starting ML Backend (Python)...
start "ML Backend - Python Flask" cmd /k "cd ml-backend && python app.py"
timeout /t 5 /nobreak >nul
echo      ML Backend started on port 5001
echo.

REM Start Node.js Backend
echo [3/4] Starting Node.js Backend...
start "Backend - Node.js" cmd /k "cd backend && node server.js"
timeout /t 3 /nobreak >nul
echo      Backend started on port 3001
echo.

REM Start React Frontend
echo [4/4] Starting React Frontend...
start "Frontend - React" cmd /k "cd frontend && npm start"
echo      Frontend starting on port 3000...
echo.

echo ============================================
echo   ALL SERVICES STARTED!
echo ============================================
echo.
echo   MongoDB:      http://localhost:27017
echo   ML Backend:   http://localhost:5001
echo   Node Backend: http://localhost:3001
echo   Frontend:     http://localhost:3000
echo.
echo   Login: unishamahara01@gmail.com
echo   Password: password123
echo.
echo   4 windows will open:
echo   1. MongoDB
echo   2. ML Backend (Python)
echo   3. Node.js Backend
echo   4. React Frontend
echo.
echo   Browser will open automatically in 10 seconds...
echo ============================================
timeout /t 10 /nobreak >nul
start http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
