const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const connectdb = require("./config/db.js");
const route = require("./routes/invoiceRoute.js");
const proroute = require("./routes/productRoute.js");
const fs = require('fs');

// ✅ Direct MongoDB URL (move to .env in production!)
const mongoUrl = "mongodb+srv://pagalavanks22cse:djbdqVHcJjc1fArv@cluster0.fczosvo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['*']
}));

app.use(express.json());

// API routes - make sure these come before static file handling
app.use('/api', route);
app.use('/api/products', proroute);

// Serve PDFs
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Serve assets from dist folder inside server with proper MIME types
const distPath = path.join(__dirname, 'dist');
console.log(`Looking for static files in: ${distPath}`);

// Check if dist directory exists in server folder
if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
  console.log('Found client files in server/dist directory');
  
  // Set proper MIME types for common web files
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html');
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (filePath.endsWith('.ico')) {
        res.setHeader('Content-Type', 'image/x-icon');
      }
    }
  }));
  
  // Explicitly serve the assets directory with proper MIME types
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    app.use('/assets', express.static(assetsPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        }
      }
    }));
  }
  
  // Serve index.html for any paths that don't match API routes
  // This must be the LAST route handler
  app.get('*', (req, res) => {
    console.log(`Serving index.html for path: ${req.path}`);
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  console.log('No client build found in server/dist, running in API-only mode');
  
  // If no client build found, serve a simple response
  app.get('/', (req, res) => {
    res.json({
      message: "Anbu Printing Press API",
      status: "Running (API Only Mode)",
      endpoints: [
        "/api/invoices",
        "/api/products"
      ]
    });
  });
}

// Start server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await connectdb(mongoUrl);
});
