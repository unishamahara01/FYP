@echo off
echo ============================================
echo   Push MediTrust to GitHub
echo ============================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/downloads
    echo.
    pause
    exit /b 1
)

echo Git is installed!
echo.

REM Check if already a git repository
if exist ".git" (
    echo This is already a Git repository.
    echo.
    set /p update="Do you want to push updates? (yes/no): "
    if /i "%update%"=="yes" (
        goto :push_updates
    ) else (
        echo Operation cancelled.
        pause
        exit /b 0
    )
)

REM Initialize new repository
echo Initializing Git repository...
git init
echo.

echo Adding all files...
git add .
echo.

echo Creating first commit...
git commit -m "Initial commit: MediTrust Pharmacy Management System"
echo.

echo ============================================
echo   Next Steps:
echo ============================================
echo.
echo 1. Go to GitHub.com and create a new repository
echo 2. Name it: meditrust-pharmacy (or your choice)
echo 3. DO NOT initialize with README
echo 4. Copy the repository URL
echo.
set /p repo_url="Paste your GitHub repository URL here: "

if "%repo_url%"=="" (
    echo No URL provided. Exiting...
    pause
    exit /b 1
)

echo.
echo Connecting to GitHub...
git remote add origin %repo_url%
git branch -M main

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ============================================
echo   SUCCESS!
echo ============================================
echo.
echo Your code is now on GitHub!
echo Repository: %repo_url%
echo.
goto :end

:push_updates
echo.
echo Staging changes...
git add .
echo.

set /p commit_msg="Enter commit message: "
if "%commit_msg%"=="" (
    set commit_msg=Update code
)

echo.
echo Committing changes...
git commit -m "%commit_msg%"
echo.

echo Pushing to GitHub...
git push
echo.

echo ============================================
echo   Updates pushed successfully!
echo ============================================
echo.

:end
pause
