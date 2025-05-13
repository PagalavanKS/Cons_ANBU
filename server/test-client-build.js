const fs = require('fs-extra');
const path = require('path');

console.log('Testing client build process...');

const publicDir = path.join(__dirname, 'public');
const indexFile = path.join(publicDir, 'index.html');
const cssDir = path.join(publicDir, 'assets');

console.log(`Checking if public directory exists: ${publicDir}`);
if (fs.existsSync(publicDir)) {
  console.log('✅ Public directory exists');
  
  console.log(`Checking if index.html exists: ${indexFile}`);
  if (fs.existsSync(indexFile)) {
    console.log('✅ index.html found');
  } else {
    console.error('❌ index.html not found');
  }
  
  console.log(`Checking if assets directory exists: ${cssDir}`);
  if (fs.existsSync(cssDir)) {
    console.log('✅ Assets directory exists');
    
    // List CSS files
    const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
    console.log(`Found ${cssFiles.length} CSS files: ${cssFiles.join(', ')}`);
  } else {
    console.error('❌ Assets directory not found');
  }
} else {
  console.error('❌ Public directory not found');
}

console.log('Test completed');
