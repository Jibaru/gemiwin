#!/bin/bash
set -e  # Exit on first error

# Step 1: Go to the 'ui' folder and run npm run make
echo "🚀 Building UI with Electron Forge..."
cd ui
npm run make

# Step 2: Go back to the root, and copy the out folder to dist
echo "📦 Copying UI files to the dist folder..."
cd ..
rm -rf dist
mkdir -p dist
cp -r ui/out/gemiwin-darwin-x64/* dist/

# Step 3: Build the API for macOS amd64
echo "🔨 Building API for macOS (amd64)..."
cd api
mkdir -p build
GOOS=darwin GOARCH=amd64 go build -o build/geminiapi-darwin-x64 ./cmd/app
cd ..

# Step 4: Copy the API binary to dist
cp api/build/geminiapi-darwin-x64 dist/geminiapi

# Step 5: Zip the contents of the dist folder
echo "🗜️ Creating zip file..."
zip -r gemiwin-darwin-x64.zip dist

echo "✅ Build completed successfully. File: gemiwin-darwin-x64.zip"
