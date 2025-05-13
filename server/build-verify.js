const fs = require('fs');
const path = require('path');

// Function to check if a directory exists and list its contents
function checkDirectory(dirPath) {
  console.log(`Checking directory: ${dirPath}`);
  
  if (fs.existsSync(dirPath)) {
    console.log(`✅ Directory exists: ${dirPath}`);
    
    try {
      const files = fs.readdirSync(dirPath);
      console.log(`Files in ${dirPath}:`);
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        console.log(`  - ${file} (${stats.isDirectory() ? 'directory' : 'file'})`);
      });
    } catch (error) {
      console.error(`❌ Error reading directory: ${error.message}`);
    }
  } else {
    console.log(`❌ Directory does not exist: ${dirPath}`);
  }
  console.log('-'.repeat(50));
}

// Check client build directories
const clientSrcDir = path.join(__dirname, '../client/src');
const clientDistDir = path.join(__dirname, '../client/dist');
const clientTailwindConfig = path.join(__dirname, '../client/tailwind.config.js');
const clientPostcssConfig = path.join(__dirname, '../client/postcss.config.js');

console.log('Verifying build directories and files...');
checkDirectory(clientSrcDir);
checkDirectory(clientDistDir);

// Check tailwind config
if (fs.existsSync(clientTailwindConfig)) {
  console.log('✅ Tailwind config exists');
  console.log('Tailwind config content:');
  console.log(fs.readFileSync(clientTailwindConfig, 'utf8'));
} else {
  console.log('❌ Tailwind config does not exist');
}

// Check postcss config
if (fs.existsSync(clientPostcssConfig)) {
  console.log('✅ PostCSS config exists');
  console.log('PostCSS config content:');
  console.log(fs.readFileSync(clientPostcssConfig, 'utf8'));
} else {
  console.log('❌ PostCSS config does not exist');
}

console.log('Verification completed');
