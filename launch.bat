@echo off
echo.
echo    ============================================
echo       APEX MOTORS - LUXURY CAR SHOWROOM
echo    ============================================
echo.

REM Check if Node.js is installed
node --version > nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js is not installed!
    echo.
    echo  Please install Node.js from: https://nodejs.org/
    echo  Recommended version: 18.x or higher
    echo.
    pause
    exit /b 1
)

echo  [OK] Node.js found
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo  [INFO] Installing dependencies for the first time...
    echo  This may take a few minutes...
    echo.
    npm install
    if errorlevel 1 (
        echo  [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo  [OK] Dependencies installed
    echo.
)

echo  [OK] Dependencies ready
echo.

REM Initialize database
echo  [INFO] Initializing database...
node setup-db.js > nul 2>&1
echo  [OK] Database ready
echo.

REM Start the server
echo    ============================================
echo       SERVER STARTING...
echo    ============================================
echo.
echo  Website:    http://localhost:3000
echo  Admin:      http://localhost:3000/admin
echo.
echo  Default Login:
echo    Username: admin
echo    Password: admin123
echo.
echo  Press Ctrl+C to stop the server
echo.
echo    ============================================
echo.

npm start
