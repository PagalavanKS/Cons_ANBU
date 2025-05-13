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

// Define paths to check for client files
const possibleClientPaths = [
  path.join(__dirname, 'public'),          // First priority - copied during build
  path.join(__dirname, '../client/dist')   // Second priority - local development
];

// Find first valid client path
let clientPath = null;
for (const potentialPath of possibleClientPaths) {
  console.log(`Checking for client files in: ${potentialPath}`);
  if (fs.existsSync(potentialPath)) {
    try {
      // Also check if index.html exists in this path
      if (fs.existsSync(path.join(potentialPath, 'index.html'))) {
        clientPath = potentialPath;
        console.log(`Found client files at: ${clientPath}`);
        break;
      }
    } catch (err) {
      console.log(`Error checking path ${potentialPath}:`, err);
    }
  }
}

if (clientPath) {
  console.log(`Serving static files from: ${clientPath}`);
  
  // Serve static files
  app.use(express.static(clientPath));
  
  // Serve index.html for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
} else {
  console.log('No client build found, running in API-only mode');
  
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
