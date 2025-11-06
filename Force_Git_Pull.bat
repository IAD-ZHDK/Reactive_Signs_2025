@echo off
echo ========================================
echo Force Git Pull - Reactive Signs 2025
echo ========================================
echo.

cd "C:\Users\User\Desktop\Reactive_Signs_2025"

echo Fetching latest changes from remote...
git fetch --all

echo.
echo Resetting local branch to match remote (WARNING: This will discard local changes)...
git reset --hard origin/main

echo.
echo Cleaning untracked files...
git clean -fd

echo.
echo ========================================
echo Git pull completed successfully!
echo ========================================
echo.
pause
