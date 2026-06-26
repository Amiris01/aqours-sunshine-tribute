@echo off
REM ============================================================
REM  Aqours - Love Live! Sunshine!! Fan Tribute
REM  Starts the Vite dev server. Double-click to run.
REM ============================================================

REM Run from this script's own folder, regardless of where it's launched.
cd /d "%~dp0"

REM Install dependencies the first time (or if node_modules is missing).
if not exist "node_modules" (
    echo Installing dependencies, please wait...
    call npm install
    if errorlevel 1 (
        echo.
        echo npm install failed. Make sure Node.js is installed.
        pause
        exit /b 1
    )
)

echo.
echo Starting the dev server...
echo Press Ctrl+C to stop.
echo.

call npm run dev

REM Keep the window open if the server exits or errors out.
pause
