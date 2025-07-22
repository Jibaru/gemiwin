#!/bin/bash
set -e  # Exit on first error

# Step 0 (optional): Install system dependencies if they are not already installed
echo "🔧 Checking for system dependencies..."
dependencies=(rpm dpkg fakeroot binutils)

for dep in "${dependencies[@]}"; do
  if ! dpkg -l | grep -q $dep; then
    echo "Installing missing dependency: $dep"
    sudo apt install -y $dep
  else
    echo "$dep is already installed."
  fi
done

# Step 1: Go to the 'ui' folder and run npm run make
echo "🚀 Building UI with Electron Forge..."
cd ui
npm run make

# Step 2: Go back to the root, and copy the out folder to dist
echo "📦 Copying UI files to the dist folder..."
cd ..
rm -rf dist
mkdir -p dist
cp -r ui/out/gemiwin-linux-x64/* dist/

# Step 3: Go to the 'api' folder and run build.sh
echo "🔨 Building API..."
cd api
chmod +x build.sh
./build.sh

# Step 4: Go back to the root, copy the binary to dist as 'geminiapi'
cd ..
cp api/build/geminiapi-linux-amd64 dist/geminiapi

# Step 5: Zip the contents of the dist folder into gemiwin-linux-x64.zip
echo "🗜️ Creating zip file..."
zip -r gemiwin-linux-x64.zip dist

echo "✅ Build completed successfully. File: gemiwin-linux-x64.zip"
