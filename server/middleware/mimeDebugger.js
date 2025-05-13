/**
 * Middleware to log and debug MIME type issues
 */
function mimeDebugger(req, res, next) {
  // Save the original send method
  const originalSend = res.send;
  
  // If this is a JS or CSS file request, log it
  if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
    console.log(`[MIME Debug] Request for: ${req.path}`);
    console.log(`[MIME Debug] Content-Type before: ${res.getHeader('Content-Type') || 'not set'}`);
    
    // Override the send method to check content type
    res.send = function(body) {
      const contentType = res.getHeader('Content-Type');
      console.log(`[MIME Debug] Content-Type after: ${contentType || 'not set'}`);
      
      // If we're sending JS as text/html, fix it
      if (req.path.endsWith('.js') && (!contentType || contentType === 'text/html')) {
        console.log('[MIME Debug] Fixing JS MIME type');
        res.setHeader('Content-Type', 'application/javascript');
      }
      
      // If we're sending CSS as text/html, fix it
      if (req.path.endsWith('.css') && (!contentType || contentType === 'text/html')) {
        console.log('[MIME Debug] Fixing CSS MIME type');
        res.setHeader('Content-Type', 'text/css');
      }
      
      // Call the original send method
      return originalSend.call(this, body);
    };
  }
  
  next();
}

module.exports = mimeDebugger;
