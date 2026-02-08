@echo off
echo ============================================
echo   Pharmacy Image Setup
echo ============================================
echo.
echo This will help you add your pharmacy image
echo.

REM Create assets folder if it doesn't exist
if not exist "frontend\src\assets" (
    mkdir "frontend\src\assets"
    echo Created assets folder
)

echo.
echo INSTRUCTIONS:
echo.
echo 1. Save your pharmacy image (the green one) as:
echo    pharmacy-interior.jpg
echo.
echo 2. Place it in the same folder as this script
echo.
echo 3. Press any key to continue...
pause >nul

REM Check if image exists
if exist "pharmacy-interior.jpg" (
    echo.
    echo Found pharmacy-interior.jpg!
    echo Copying to assets folder...
    copy "pharmacy-interior.jpg" "frontend\src\assets\pharmacy-interior.jpg" >nul
    echo.
    echo ============================================
    echo   SUCCESS! Image copied!
    echo ============================================
    echo.
    echo NEXT STEP:
    echo Open: frontend\src\pages\LandingPage.jsx
    echo Find line ~115 with: src="https://i.postimg.cc...
    echo Replace with: src={require('../assets/pharmacy-interior.jpg')}
    echo.
    echo Then save and refresh your browser!
    echo.
) else if exist "pharmacy-interior.png" (
    echo.
    echo Found pharmacy-interior.png!
    echo Copying to assets folder...
    copy "pharmacy-interior.png" "frontend\src\assets\pharmacy-interior.png" >nul
    echo.
    echo ============================================
    echo   SUCCESS! Image copied!
    echo ============================================
    echo.
    echo NEXT STEP:
    echo Open: frontend\src\pages\LandingPage.jsx
    echo Find line ~115 with: src="https://i.postimg.cc...
    echo Replace with: src={require('../assets/pharmacy-interior.png')}
    echo.
    echo Then save and refresh your browser!
    echo.
) else (
    echo.
    echo ============================================
    echo   Image not found!
    echo ============================================
    echo.
    echo Please:
    echo 1. Save your pharmacy image as pharmacy-interior.jpg
    echo 2. Place it in the same folder as this script
    echo 3. Run this script again
    echo.
    echo OR use online hosting:
    echo 1. Upload to https://imgur.com
    echo 2. Copy the direct image URL
    echo 3. Update LandingPage.jsx with that URL
    echo.
)

echo ============================================
pause
