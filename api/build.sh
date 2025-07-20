#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

# Build output directory
echo "Creating build directory..."
mkdir -p build

echo "Starting cross-compilation for geminiapi..."

# Supported OS and architectures
OS_LIST=("linux" "darwin" "windows")
ARCH_LIST=("386" "amd64")

for OS in "${OS_LIST[@]}"; do
  for ARCH in "${ARCH_LIST[@]}"; do
    # Skip unsupported darwin/386 combination
    if [ "$OS" = "darwin" ] && [ "$ARCH" = "386" ]; then
      echo "Skipping unsupported build for darwin/386"
      continue
    fi

    # Determine executable extension for Windows
    EXT=""
    if [ "$OS" = "windows" ]; then
      EXT=".exe"
    fi

    # Output file name
    OUTPUT="build/geminiapi-${OS}-${ARCH}${EXT}"

    echo "Building for $OS/$ARCH -> $OUTPUT"

    # Set environment variables and build
    GOOS=$OS GOARCH=$ARCH \
      go build -o "$OUTPUT" ./cmd/app

    echo "Built $OUTPUT"
  done
 done

echo "All builds completed!"