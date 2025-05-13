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

// API routes
app.use('/api', route);
app.use('/api/products', proroute);

// Serve assets from dist folder inside server
const distPath = path.join(__dirname, 'dist');
console.log(`Looking for static files in: ${distPath}`);

// Check if dist directory exists in server folder
if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
  console.log('Found client files in server/dist directory');
  
  // Serve all static files from the dist directory
  app.use(express.static(distPath));
  
  // Serve index.html for any paths that don't match API routes
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
