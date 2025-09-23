#!/bin/bash

# Debug script to check build process
echo "=== WMP Build Debug Script ==="
echo ""

echo "1. Checking current directory:"
pwd
echo ""

echo "2. Checking if .next exists:"
if [ -d ".next" ]; then
    echo "✅ .next directory exists"
    echo "Contents:"
    ls -la .next/
    echo ""
    
    echo "3. Checking if standalone directory exists:"
    if [ -d ".next/standalone" ]; then
        echo "✅ standalone directory exists"
        echo "Contents:"
        ls -la .next/standalone/
        echo ""
        
        echo "4. Checking if server.js exists:"
        if [ -f ".next/standalone/server.js" ]; then
            echo "✅ server.js exists"
            echo "File size:"
            ls -lh .next/standalone/server.js
        else
            echo "❌ server.js not found"
        fi
    else
        echo "❌ standalone directory not found"
    fi
else
    echo "❌ .next directory not found"
fi

echo ""
echo "5. Checking package.json scripts:"
grep -A 5 '"scripts"' package.json

echo ""
echo "6. Checking next.config.mjs:"
if [ -f "next.config.mjs" ]; then
    echo "✅ next.config.mjs exists"
    grep -n "output.*standalone" next.config.mjs || echo "❌ standalone output not configured"
else
    echo "❌ next.config.mjs not found"
fi

echo ""
echo "7. Checking Node.js version:"
node --version

echo ""
echo "8. Checking npm version:"
npm --version

echo ""
echo "=== Debug Complete ==="
