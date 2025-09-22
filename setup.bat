@echo off
echo ===================================================
echo        AIRATTIX - SETUP AND INSTALLATION
echo ===================================================
echo.

echo Step 1: Checking MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB is not installed or not in PATH.
    echo Please install MongoDB from https://www.mongodb.com/try/download/community
    echo After installation, run this script again.
    pause
    exit
) else (
    echo MongoDB is installed. Good!
)
echo.

echo Step 2: Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies.
    echo Please make sure Node.js is installed and try again.
    pause
    exit
)
echo.

echo Step 3: Setting up environment...
if not exist .env (
    copy .env.example .env
    echo Created .env file from template.
)
echo.

echo Step 4: Starting the application...
echo The application will start now. Press Ctrl+C to stop it.
echo Access the application at http://localhost:3000
echo.
pause
npm run dev 