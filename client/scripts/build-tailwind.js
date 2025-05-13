const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the CSS directory exists
const cssDir = path.join(__dirname, '../src/css');
if (!fs.existsSync(cssDir)) {
  fs.mkdirSync(cssDir, { recursive: true });
}

// Log current directory and files
console.log('Current directory:', process.cwd());
console.log('Tailwind config exists:', fs.existsSync('./tailwind.config.js'));

try {
  // Execute the Tailwind CLI build command
  console.log('Building Tailwind CSS...');
  execSync('npx tailwindcss -i ./src/index.css -o ./src/css/tailwind.css', { stdio: 'inherit' });
  console.log('Tailwind CSS build completed successfully');
} catch (error) {
  console.error('Error building Tailwind CSS:', error);
  process.exit(1);
}
