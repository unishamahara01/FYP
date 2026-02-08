@echo off
echo ============================================
echo   Setup Git and Push to GitHub
echo ============================================
echo.

REM Check if git is configured
git config user.name >nul 2>&1
if errorlevel 1 (
    echo Git is not configured yet.
    echo.
    echo Please enter your details:
    echo.
    set /p git_name="Your Name: "
    set /p git_email="Your Email: "
    
    echo.
    echo Configuring Git...
    git config --global user.name "%git_name%"
    git config --global user.email "%git_email%"
    echo Git configured successfully!
    echo.
)

echo Current Git Configuration:
git config user.name
git config user.email
echo.

REM Check if already initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    echo.
)

echo Adding all files...
git add .
echo.

echo Creating commit...
git commit -m "Initial commit: MediTrust Pharmacy Management System"
echo.

echo ============================================
echo   Ready to Push to GitHub!
echo ============================================
echo.
echo Next steps:
echo 1. Go to https://github.com/new
echo 2. Create a new repository named: meditrust-pharmacy
echo 3. DO NOT initialize with README
echo 4. Copy the repository URL
echo.
set /p repo_url="Paste your GitHub repository URL here: "

if "%repo_url%"=="" (
    echo No URL provided.
    echo.
    echo You can push later with these commands:
    echo   git remote add origin YOUR_REPO_URL
    echo   git branch -M main
    echo   git push -u origin main
    echo.
    pause
    exit /b 0
)

echo.
echo Connecting to GitHub...
git remote add origin %repo_url%
git branch -M main

echo.
echo Pushing to GitHub...
echo (You may need to enter your GitHub credentials)
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ============================================
    echo   Push Failed - Authentication Needed
    echo ============================================
    echo.
    echo If you see authentication error:
    echo 1. Go to: https://github.com/settings/tokens
    echo 2. Generate new token (classic)
    echo 3. Select 'repo' scope
    echo 4. Copy the token
    echo 5. Use token as password when prompted
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   SUCCESS! Code pushed to GitHub!
echo ============================================
echo.
echo Your repository: %repo_url%
echo.
echo Next steps:
echo 1. Visit your repository on GitHub
echo 2. Add description and topics
echo 3. Update README with your details
echo.
pause
