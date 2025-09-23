#!/bin/bash

# Clean build script for WMP application
# This script ensures a proper clean build without database connection issues

echo "Starting clean build process..."

# Stop PM2 if running
echo "Stopping PM2 process..."
pm2 stop wmp 2>/dev/null || echo "No PM2 process to stop"

# Remove old build
echo "Removing old build..."
rm -rf .next

# Clean npm cache (optional)
echo "Cleaning npm cache..."
npm cache clean --force

# Install dependencies (in case of any issues)
echo "Installing dependencies..."
npm install

# Set environment variables for build
export NODE_ENV=production
export NEXT_PHASE=phase-production-build

# Build the application with verbose output
echo "Building application..."
npm run build 2>&1 | tee build.log

# Check if build was successful
if [ -f ".next/standalone/server.js" ]; then
    echo "✅ Build successful! Standalone server created."
    echo "Standalone directory contents:"
    ls -la .next/standalone/
    echo ""
    echo "You can now start the application with:"
    echo "  pm2 start .next/standalone/server.js --name wmp"
else
    echo "❌ Build failed! Standalone server not found."
    echo "Checking .next directory contents:"
    ls -la .next/
    echo ""
    echo "Build log contents:"
    tail -50 build.log
    echo ""
    echo "Please check the build output for errors."
    exit 1
fi

echo "Clean build process completed!"
