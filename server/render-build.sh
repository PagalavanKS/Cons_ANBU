#!/bin/bash

# Install server dependencies
npm install

# Check if client directory exists in the project
if [ -d "../client" ]; then
  echo "Building client application..."
  
  # Go to client directory
  cd ../client
  
  # Install client dependencies
  npm install
  
  # Build client
  npm run build
  
  # Create public directory in server if it doesn't exist
  mkdir -p ../server/public
  
  # Copy client build to server public directory
  cp -r dist/* ../server/public/
  
  echo "Client build completed and files copied to server/public"
else
  echo "Client directory not found, skipping client build"
fi

# Return to server directory
cd ../server

echo "Build process completed"
