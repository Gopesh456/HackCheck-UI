@echo off
setlocal enabledelayedexpansion
color 0A
cls

echo ====================================================
echo    HackCheck-UI Setup and Launch Tool (Windows)
echo ====================================================
echo.
echo This script will set up and start the HackCheck application for you.
echo No coding experience required! Just follow the prompts.
echo.
echo [STEP 1/5] Checking if Node.js is installed...

REM Try to detect Node.js in a beginner-friendly way
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Node.js was not found on your computer!
    echo.
    echo To fix this issue:
    echo 1. Download Node.js from https://nodejs.org/
    echo 2. Install it by following the installation wizard
    echo 3. Select "Automatically install necessary tools" when prompted
    echo 4. After installation completes, close all command prompts
    echo 5. Run this script again
    echo.
    echo Press any key to exit...
    pause > nul
    exit /b 1
)

echo [SUCCESS] Node.js is installed!
echo [INFO] Version: 
node -v
echo.

echo [STEP 2/5] Setting up environment configuration...

if exist .env (
    echo [INFO] Configuration file already exists
    echo [INFO] Using existing settings from .env file
    
    REM Show current settings in a user-friendly way
    for /f "tokens=2 delims==" %%a in ('type .env ^| findstr NEXT_PUBLIC_API_BASE_URL') do (
        set api_url=%%a
        echo [INFO] Current Backend URL: %%a
    )
    
    echo.
    echo Would you like to keep this setting or create a new one?
    echo 1 - Keep current setting
    echo 2 - Enter new backend URL
    
    choice /c 12 /n /m "Enter your choice (1 or 2): "
    if !errorlevel! equ 2 (
        goto :setNewUrl
    ) else (
        echo [INFO] Keeping current settings
        goto :continueSetup
    )
) else (
    :setNewUrl
    echo.
    echo The backend API URL is needed to connect to your server.
    echo Example: http://localhost:8000/ or http://127.0.0.1:8000/
    echo.
    set /p api_url="Enter your backend API URL: "
    
    
    REM Add quotes to handle special characters properly
    echo NEXT_PUBLIC_API_BASE_URL="!api_url!"> .env
    echo [SUCCESS] Created configuration with Backend URL: !api_url!
)

:continueSetup
echo.
echo [STEP 3/5] Installing required packages...
echo This may take a few minutes depending on your internet speed...
echo.
call npm install
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Failed to install required packages!
    echo.
    echo Possible solutions:
    echo 1. Check your internet connection
    echo 2. Try running the script as administrator
    echo 3. If you're behind a corporate firewall, configure npm proxy settings
    echo.
    echo Press any key to exit...
    pause > nul
    exit /b 1
)

echo.
echo [STEP 4/5] Building the application...
echo This may take a minute or two...
echo.
call npm run build
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Failed to build the application!
    echo.
    echo Possible solutions:
    echo 1. Make sure your backend API URL is correct
    echo 2. Try running the script as administrator
    echo 3. Delete the node_modules folder and try again
    echo.
    echo Press any key to exit...
    pause > nul
    exit /b 1
)

echo.
echo [STEP 5/5] Starting the server...
echo.
call npm run start
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [ERROR] Failed to start the server!
    echo.
    echo Possible solutions:
    echo 1. Make sure your backend API URL is correct
    echo 2. Try running the script as administrator
    echo 3. Check if another application is using the same port
    echo.
    echo Press any key to exit...
    pause > nul
    exit /b 1
)

echo.
echo [SUCCESS] The application is running!
echo Open http://localhost:3000 in your browser.
pause
