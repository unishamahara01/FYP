@echo off
echo ========================================
echo   Pharmacy Image Setup Helper
echo ========================================
echo.
echo This script will help you add your pharmacy image to the dashboard.
echo.
echo INSTRUCTIONS:
echo 1. Save your pharmacy image with one of these names:
echo    - pharmacy-overview.jpg
echo    - pharmacy-overview.png
echo    - pharmacy-overview.webp
echo.
echo 2. Place it in the same folder as this script
echo.
echo 3. Run this script again
echo.
echo ========================================
echo.

REM Check if assets folder exists
if not exist "frontend\src\assets" (
    echo Creating assets folder...
    mkdir "frontend\src\assets"
    echo ✓ Assets folder created
    echo.
)

REM Check for image files
set IMAGE_FOUND=0

if exist "pharmacy-overview.jpg" (
    echo ✓ Found: pharmacy-overview.jpg
    copy "pharmacy-overview.jpg" "frontend\src\assets\pharmacy-overview.jpg" >nul
    set IMAGE_FOUND=1
)

if exist "pharmacy-overview.png" (
    echo ✓ Found: pharmacy-overview.png
    copy "pharmacy-overview.png" "frontend\src\assets\pharmacy-overview.png" >nul
    set IMAGE_FOUND=1
)

if exist "pharmacy-overview.webp" (
    echo ✓ Found: pharmacy-overview.webp
    copy "pharmacy-overview.webp" "frontend\src\assets\pharmacy-overview.webp" >nul
    set IMAGE_FOUND=1
)

if %IMAGE_FOUND%==1 (
    echo.
    echo ========================================
    echo   ✓ Image copied successfully!
    echo ========================================
    echo.
    echo NEXT STEPS:
    echo 1. Open: frontend\src\pages\Dashboard.jsx
    echo 2. Find line ~460 with: src="data:image/svg+xml...
    echo 3. Replace with: src={require('../assets/pharmacy-overview.jpg')}
    echo    (or .png/.webp depending on your image format)
    echo.
    echo 4. Save the file and refresh your browser
    echo.
) else (
    echo ❌ No pharmacy image found!
    echo.
    echo Please:
    echo 1. Save your pharmacy image as pharmacy-overview.jpg (or .png/.webp)
    echo 2. Place it in the same folder as this script
    echo 3. Run this script again
    echo.
)

echo ========================================
pause
