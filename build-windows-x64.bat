@echo off
setlocal enabledelayedexpansion

:: Step 1: Navigate to the 'ui' folder and run npm run make
echo 🚀 Building UI with Electron Forge...
cd ui
npm run make

:: Step 2: Return to the root, copy the UI files to the 'dist' folder
echo 📦 Copying UI files to the dist folder...
cd ..
rmdir /s /q dist
mkdir dist
xcopy /E /I /H /Y ui\out\gemiwin-windows-x64\* dist\

:: Step 3: Navigate to the 'api' folder and run the GO command for Windows build
echo 🔨 Building API for Windows...
cd api

:: Only compile for Windows
echo "Building Windows version..."
set GOOS=windows
set GOARCH=amd64
go build -o build\geminiapi-windows-amd64.exe ./cmd/app

:: Step 4: Copy the API binary as 'geminiapi.exe' to the 'dist' folder
echo 🏗️ Copying the API binary...
copy api\build\geminiapi-windows-amd64.exe dist\geminiapi.exe

:: Step 5: Zip the contents of the 'dist' folder into gemiwin-windows-x64.zip
echo 🗜️ Creating zip file...
powershell Compress-Archive -Path dist\* -DestinationPath gemiwin-windows-x64.zip

echo ✅ Build completed successfully. File: gemiwin-windows-x64.zip
pause
