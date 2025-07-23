@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: Paso 1: Construir la interfaz con Electron Forge
echo Building UI with Electron Forge...
cd ui
call npm run make
if errorlevel 1 (
    echo Error: UI build failed.
    pause
    exit /b 1
)

:: Paso 2: Copiar archivos de salida al directorio 'dist'
echo Copying UI files to the dist folder...
cd ..
if exist dist rmdir /s /q dist
mkdir dist
xcopy /E /I /H /Y "ui\out\gemiwin-win32-x64\*" "dist\"

:: Paso 3: Compilar API en Go
echo Building API for Windows...
cd api
set GOOS=windows
set GOARCH=amd64
go build -o build\geminiapi-windows-amd64.exe ./cmd/app
if errorlevel 1 (
    echo Error: API build failed.
    pause
    exit /b 1
)

:: Paso 4: Copiar binario a la carpeta 'dist'
echo Copying the API binary...
cd ..
copy /Y "api\build\geminiapi-windows-amd64.exe" "dist\geminiapi.exe"

:: Paso 5: Comprimir carpeta 'dist'
echo Creating zip file...
powershell -Command "Compress-Archive -Path 'dist\*' -DestinationPath 'gemiwin-win32-x64.zip' -Force"

echo Build completed successfully: gemiwin-win32-x64.zip
pause
