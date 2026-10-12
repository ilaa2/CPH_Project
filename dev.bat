@echo off
echo ========================================
echo   Central Palantea - Development
echo ========================================

if not exist "public\storage" (
    echo.
    echo [1/3] Creating storage link...
    php artisan storage:link
) else (
    echo.
    echo [1/3] Storage link already exists.
)

echo.
echo [2/3] Starting Laravel...
start cmd /k "php artisan serve"

echo.
echo [3/3] Starting Vite...
start cmd /k "npm run dev"

echo.
echo ========================================
echo   Development server started!
echo ========================================