const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

console.log('Starting client build process...');

try {
  // Check if client directory exists
  if (fs.existsSync(path.join(__dirname, '../client'))) {
    console.log('Client directory found, building...');
    
    // Create public directory if it doesn't exist
    fs.ensureDirSync(path.join(__dirname, 'public'));
    
    // Install client dependencies
    console.log('Installing client dependencies...');
    execSync('cd ../client && npm install', { stdio: 'inherit' });
    
    // Build client
    console.log('Building client...');
    execSync('cd ../client && npm run build', { stdio: 'inherit' });
    
    // Copy build to server/public
    console.log('Copying build files to server/public...');
    fs.copySync(
      path.join(__dirname, '../client/dist'),
      path.join(__dirname, 'public')
    );
    
    console.log('Client build completed successfully!');
  } else {
    console.log('Client directory not found, skipping client build');
  }
} catch (error) {
  console.error('Error during build process:', error);
  process.exit(1);
}
