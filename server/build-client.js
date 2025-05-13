const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

console.log('Starting build process...');

// Install Chrome for Puppeteer in production
if (process.env.NODE_ENV === 'production') {
  try {
    console.log('Checking for Chromium...');
    
    // Check if chromium is already installed
    try {
      execSync('which chromium-browser || which chromium || which chrome', { stdio: 'inherit' });
      console.log('Chromium is already installed');
    } catch (error) {
      console.log('Installing Chromium...');
      execSync('apt-get update && apt-get install -y chromium-browser', { stdio: 'inherit' });
      console.log('Chromium browser installation completed');
    }
  } catch (error) {
    console.warn('Warning: Could not install Chrome. Will use Puppeteer bundled Chromium:', error.message);
  }
}

// Build client if in the parent directory
const clientDir = path.join(__dirname, '../client');
if (fs.existsSync(clientDir)) {
  try {
    console.log('Building client application...');
    
    // Install client dependencies
    console.log('Installing client dependencies...');
    execSync('npm install', { cwd: clientDir, stdio: 'inherit' });
    
    // Build client
    console.log('Running client build...');
    execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });
    
    console.log('Client build completed successfully');
  } catch (error) {
    console.error('Error building client:', error.message);
    process.exit(1);
  }
} else {
  console.log('Client directory not found, skipping client build');
}

console.log('Build process completed successfully');
