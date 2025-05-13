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

// Serve PDFs
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// API routes - define these BEFORE the static file middleware
app.use('/api', route);
app.use('/api/products', proroute);

// Check for client dist files in the parent directory
const clientDistPath = path.join(__dirname, '../client/dist');
console.log(`Looking for client files at: ${clientDistPath}`);

if (fs.existsSync(clientDistPath) && fs.existsSync(path.join(clientDistPath, 'index.html'))) {
  console.log('Found client files in ../client/dist');
  
  // Correctly serve static files from parent directory's client/dist folder
  app.use(express.static(clientDistPath));
  
  // Serve static files from assets folder with correct MIME types
  app.use('/assets', express.static(path.join(clientDistPath, 'assets'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
  
  // This must be AFTER the API routes and AFTER the static middleware
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  console.log('Client files not found at ../client/dist');
  
  // Check if dist was accidentally put in the server directory itself
  const serverDistPath = path.join(__dirname, 'dist');
  
  if (fs.existsSync(serverDistPath) && fs.existsSync(path.join(serverDistPath, 'index.html'))) {
    console.log('Found client files in server/dist');
    
    // Serve from the server/dist directory instead
    app.use(express.static(serverDistPath));
    
    app.use('/assets', express.static(path.join(serverDistPath, 'assets'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        }
      }
    }));
    
    // This must be AFTER the API routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(serverDistPath, 'index.html'));
    });
  } else {
    console.log('Client files not found in server/dist either');
    
    // Fallback to API-only mode
    app.get('/', (req, res) => {
      res.json({
        message: "API server running. Client files not found.",
        status: "API Only Mode"
      });
    });
  }
}

// Start server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await connectdb(mongoUrl);
});
