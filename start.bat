@echo off
setlocal

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installing, re-run this file.
    pause
    exit /b 1
)

echo.
echo [INFO] Node.js is installed. Version:
node -v

:: Install dependencies
echo.
echo [INFO] Installing dependencies. This may take a few minutes...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to install dependencies. Please check your internet connection or try running 'npm install' manually.
    pause
    exit /b 1
)

:: Build the app
echo.
echo [INFO] Building the application for production...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed. Please check the error messages above.
    pause
    exit /b 1
)

:: Start the app
echo.
echo [INFO] Starting the server...
call npm run start
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to start the server. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] The application is running!
echo Open http://localhost:3000 in your browser.
pause
