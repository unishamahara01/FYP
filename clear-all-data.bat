@echo off
echo ============================================
echo   Clear All Data (Real Data Only Mode)
echo ============================================
echo.
echo WARNING: This will delete ALL data:
echo - All products
echo - All orders
echo - All sales
echo - All customers
echo - All suppliers
echo.
echo User accounts will be preserved.
echo.
set /p confirm="Are you sure? (yes/no): "

if /i "%confirm%"=="yes" (
    echo.
    echo Clearing all data...
    cd backend
    node freshStart.js
    cd ..
    echo.
    echo ============================================
    echo   Data cleared successfully!
    echo ============================================
    echo.
    echo Your system is now ready for fresh real data.
    echo Start by adding products in the Inventory section.
    echo.
) else (
    echo.
    echo Operation cancelled.
    echo.
)

pause
