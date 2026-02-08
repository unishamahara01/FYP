@echo off
echo ========================================
echo   Starting MediTrust Pharmacy System
echo ========================================
echo.

REM Check if MongoDB is running
echo [1/4] Checking MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo       [OK] MongoDB is running
) else (
    echo       [WARNING] MongoDB is not running!
    echo       Starting MongoDB...
    start "MongoDB" cmd /c "mongod --dbpath C:\data\db"
    timeout /t 3 /nobreak >nul
)

echo.
echo [2/4] Checking if ports are available...
netstat -ano | findstr :3001 >nul
if "%ERRORLEVEL%"=="0" (
    echo       [WARNING] Port 3001 is already in use
    echo       Killing process on port 3001...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

netstat -ano | findstr :3000 >nul
if "%ERRORLEVEL%"=="0" (
    echo       [WARNING] Port 3000 is already in use
    echo       Killing process on port 3000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /F /PID %%a >nul 2>&1
    timeout /t 2 /nobreak >nul
)

echo       [OK] Ports are available

echo.
echo [3/4] Starting Backend Server...
start "MediTrust Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 5 /nobreak >nul
echo       [OK] Backend started on http://localhost:3001

echo.
echo [4/4] Starting Frontend Server...
start "MediTrust Frontend" cmd /k "cd /d %~dp0frontend && npm start"
timeout /t 3 /nobreak >nul
echo       [OK] Frontend starting on http://localhost:3000

echo.
echo ========================================
echo   MediTrust Started Successfully!
echo ========================================
echo.
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:3000
echo.
echo   Both servers are running in separate windows.
echo   DO NOT CLOSE those windows!
echo.
echo   Your browser will open automatically...
echo ========================================
echo.

REM Wait a bit more for frontend to fully start
timeout /t 5 /nobreak >nul

REM Open browser automatically
start http://localhost:3000

echo.
echo Press any key to close this window...
echo (The servers will keep running)
pause >nul
