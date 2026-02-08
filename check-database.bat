@echo off
echo ============================================
echo   MediTrust Database Status Check
echo ============================================
echo.
echo Checking MongoDB database...
echo.

cd backend
node checkDatabase.js
cd ..

echo.
echo ============================================
pause
