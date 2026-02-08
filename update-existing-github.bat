@echo off
echo ============================================
echo   Update Existing GitHub Repository
echo ============================================
echo.
echo Repository: https://github.com/unishamahara01/FYP
echo.

REM Configure Git if not already done
git config user.name >nul 2>&1
if errorlevel 1 (
    echo Configuring Git...
    echo.
    set /p git_name="Your Name (e.g., Unisha Mahara): "
    set /p git_email="Your Email: "
    
    git config --global user.name "%git_name%"
    git config --global user.email "%git_email%"
    echo.
    echo Git configured!
    echo.
)

REM Check if .git folder exists
if exist ".git" (
    echo Git repository already initialized.
    echo.
) else (
    echo Initializing Git repository...
    git init
    echo.
    
    echo Connecting to your GitHub repository...
    git remote add origin https://github.com/unishamahara01/FYP.git
    echo.
)

REM Check current branch
git branch >nul 2>&1
if errorlevel 1 (
    echo Creating main branch...
    git checkout -b main
)

echo Adding all files...
git add .
echo.

echo Creating commit...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" (
    set commit_msg=Update: Complete MediTrust Pharmacy System with AI features
)

git commit -m "%commit_msg%"
echo.

echo ============================================
echo   Pushing to GitHub...
echo ============================================
echo.
echo Repository: https://github.com/unishamahara01/FYP
echo.
echo NOTE: You may need to enter your GitHub credentials
echo       Use Personal Access Token as password (not your GitHub password)
echo.

REM Try to pull first to avoid conflicts
echo Pulling latest changes...
git pull origin main --allow-unrelated-histories
echo.

echo Pushing your code...
git push -u origin main

if errorlevel 1 (
    echo.
    echo ============================================
    echo   Authentication Required
    echo ============================================
    echo.
    echo If push failed, you need a Personal Access Token:
    echo.
    echo 1. Go to: https://github.com/settings/tokens
    echo 2. Click "Generate new token (classic)"
    echo 3. Select scope: repo (check all repo boxes)
    echo 4. Click "Generate token"
    echo 5. Copy the token
    echo.
    echo Then run this script again and use:
    echo   Username: unishamahara01
    echo   Password: [paste your token]
    echo.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   SUCCESS! Code Updated on GitHub!
echo ============================================
echo.
echo Your repository: https://github.com/unishamahara01/FYP
echo.
echo Next steps:
echo 1. Visit: https://github.com/unishamahara01/FYP
echo 2. Verify all files are uploaded
echo 3. Update repository description
echo 4. Add topics/tags
echo.
pause
