@echo off
echo ========================================
echo   MediTrust MongoDB Setup
echo ========================================
echo.

echo Step 1: Checking MongoDB service...
net start | find "MongoDB" >nul
if %errorlevel% == 0 (
    echo [OK] MongoDB is running
) else (
    echo [!] MongoDB is not running
    echo Starting MongoDB service...
    net start MongoDB
    if %errorlevel% == 0 (
        echo [OK] MongoDB started successfully
    ) else (
        echo [ERROR] Failed to start MongoDB
        echo Please start MongoDB manually or install it from:
        echo https://www.mongodb.com/try/download/community
        pause
        exit /b 1
    )
)
echo.

echo Step 2: Installing backend dependencies...
cd backend
if not exist node_modules (
    echo Installing packages...
    call npm install
) else (
    echo [OK] Dependencies already installed
)
echo.

echo Step 3: Seeding database with initial users...
call npm run seed
if %errorlevel% == 0 (
    echo [OK] Database seeded successfully
) else (
    echo [ERROR] Failed to seed database
    pause
    exit /b 1
)
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend:  cd backend ^&^& npm start
echo 2. Start frontend: cd frontend ^&^& npm start
echo 3. Login with: admin@meditrust.com / password123
echo.
echo Press any key to exit...
pause >nul
