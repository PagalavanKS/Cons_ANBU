const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const cors = require("cors");
const app = express();
const connectdb = require("./config/db.js");
const route = require("./routes/invoiceRoute.js");
const proroute = require("./routes/productRoute.js");
require('dotenv').config();

// Configure Puppeteer environment variables for Render deployment
process.env.PUPPETEER_CACHE_DIR = '/tmp/puppeteer-cache';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = process.env.NODE_ENV === 'production' ? 'true' : 'false';

// Configure Puppeteer environment variables for production
if (process.env.NODE_ENV === 'production') {
  // Check for chromium browser path and set it if exists
  const possibleBrowserPaths = [
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/chrome',
    '/usr/bin/google-chrome'
  ];
  
  for (const browserPath of possibleBrowserPaths) {
    if (fs.existsSync(browserPath)) {
      process.env.PUPPETEER_EXECUTABLE_PATH = browserPath;
      console.log(`Setting PUPPETEER_EXECUTABLE_PATH to ${browserPath}`);
      break;
    }
  }
  
  // Create cache directory for Puppeteer
  const puppeteerCacheDir = '/tmp/puppeteer-cache';
  fs.ensureDirSync(puppeteerCacheDir);
  process.env.PUPPETEER_CACHE_DIR = puppeteerCacheDir;
}

// Use environment variables for MongoDB connection
const mongoUrl = process.env.MONGODB_URI || "mongodb+srv://pagalavanks22cse:djbdqVHcJjc1fArv@cluster0.fczosvo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const port = process.env.PORT || 5000;

// Ensure directories exist
const PDF_DIR = path.join(__dirname, 'pdfs');
fs.ensureDirSync(PDF_DIR);

// Create cache directory for Puppeteer if in production
if (process.env.NODE_ENV === 'production') {
  fs.ensureDirSync('/tmp/puppeteer-cache');
}

// CORS configuration
app.use(cors({
  origin: ['*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes should come before static files
app.use('/api', route);
app.use('/api/products', proroute);

// Serve PDF files
app.use('/pdfs', express.static(PDF_DIR));

// Serve static client files
app.use(express.static(path.join(__dirname, '../client/dist')));

// For any other routes, serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
});

// Start server
app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Puppeteer Cache Dir: ${process.env.PUPPETEER_CACHE_DIR || 'default'}`);
  
  // Log Puppeteer settings
  console.log(`Puppeteer executable path: ${process.env.PUPPETEER_EXECUTABLE_PATH || 'default bundled chromium'}`);
  console.log(`Puppeteer cache directory: ${process.env.PUPPETEER_CACHE_DIR || 'default'}`);
  
  try {
    await connectdb(mongoUrl);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
});
