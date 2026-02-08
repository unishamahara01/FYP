@echo off
echo ========================================
echo   MediTrust Pharmacy Management System
echo ========================================
echo.
echo Starting Backend Server...
start "MediTrust Backend" cmd /k "cd backend && npm start"
echo Backend starting on http://localhost:3001
echo.
timeout /t 3 /nobreak >nul
echo Starting Frontend Server...
start "MediTrust Frontend" cmd /k "cd frontend && npm start"
echo Frontend starting on http://localhost:3000
echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend API: http://localhost:3001
echo Frontend App: http://localhost:3000
echo.
echo IMPORTANT: Keep both terminal windows open!
echo.
echo Press any key to exit this window...
pause >nul