@echo off
echo Starting clean build process...

REM Stop PM2 if running
echo Stopping PM2 process...
pm2 stop wmp 2>nul || echo No PM2 process to stop

REM Remove old build
echo Removing old build...
rmdir /s /q .next 2>nul

REM Clean npm cache (optional)
echo Cleaning npm cache...
npm cache clean --force

REM Install dependencies (in case of any issues)
echo Installing dependencies...
npm install

REM Build the application
echo Building application...
npm run build

REM Check if build was successful
if exist ".next\standalone\server.js" (
    echo ✅ Build successful! Standalone server created.
    echo You can now start the application with:
    echo   pm2 start .next\standalone\server.js --name wmp
) else (
    echo ❌ Build failed! Standalone server not found.
    echo Please check the build output for errors.
    exit /b 1
)

echo Clean build process completed!
