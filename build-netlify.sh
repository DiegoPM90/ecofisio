#!/bin/bash

# Script de build para Netlify
echo "Installing all dependencies including dev dependencies..."
npm install

echo "Building the application..."
npm run build

echo "Build completed successfully!"