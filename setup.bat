@echo off
REM Initial Setup Script for VATSIM Flight Analyzer (Windows)
REM Run this once after cloning the repository

echo Setting up VATSIM Flight Analyzer...

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm is not installed. Please install Node.js first.
    exit /b 1
)

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker is not installed. Please install Docker first.
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo Prerequisites check passed

REM Install dependencies
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

REM Install server dependencies
echo Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%
cd ..

REM Setup Husky hooks
echo Setting up Git hooks...
call npm run prepare
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo Setup complete!
echo.
echo Next steps:
echo    1. Build and start: deploy.bat
echo    2. Access frontend: http://localhost
echo    3. Access backend: http://localhost:3001
echo.
echo See DEPLOYMENT.md for more information
