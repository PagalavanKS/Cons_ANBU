const path = require('path');

/**
 * Helper function to set correct content types for static files
 * @param {Response} res - Express response object
 * @param {string} filePath - Path to the file being served
 */
function setContentType(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  // Map file extensions to MIME types
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.txt': 'text/plain'
  };
  
  // Set the content type header if we know this extension
  if (mimeTypes[ext]) {
    res.setHeader('Content-Type', mimeTypes[ext]);
  }
  
  // Set caching headers for better performance
  if (ext === '.html') {
    // Don't cache HTML files
    res.setHeader('Cache-Control', 'no-cache');
  } else if (['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
    // Cache static assets for 1 day
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}

module.exports = { setContentType };
