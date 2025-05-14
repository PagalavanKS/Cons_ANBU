const express = require("express");
const path = require("path");
const fs = require("fs-extra");
const cors = require("cors");
const { execSync } = require("child_process");
const app = express();
const connectdb = require("./config/db.js");
const route = require("./routes/invoiceRoute.js");
const proroute = require("./routes/productRoute.js");
require("dotenv").config();

// Configure Playwright environment variables for Render deployment
process.env.PLAYWRIGHT_BROWSERS_PATH = "/tmp/playwright-browsers";
process.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD =
  process.env.NODE_ENV === "production" ? "true" : "false";

// Attempt to install Playwright browsers if not found
try {
  // Check if we're in production and if browsers are needed
  if (process.env.NODE_ENV === "production") {
    console.log("Checking for Playwright browsers in production environment");

    // Create cache directory for Playwright
    const playwrightCacheDir = "/tmp/playwright-browsers";
    fs.ensureDirSync(playwrightCacheDir);
    process.env.PLAYWRIGHT_BROWSERS_PATH = playwrightCacheDir;

    // Check for chromium browser path and set it if exists
    const possibleBrowserPaths = [
      "/usr/bin/chromium-browser",
      "/usr/bin/chromium",
      "/usr/bin/chrome",
      "/usr/bin/google-chrome",
    ];

    for (const browserPath of possibleBrowserPaths) {
      if (fs.existsSync(browserPath)) {
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = browserPath;
        console.log(
          `Setting PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to ${browserPath}`
        );
        break;
      }
    }

    // If no system browser was found, try to install Playwright's browser
    if (!process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
      console.log("No system browser found, installing Playwright browser");
      execSync("npx playwright install chromium", { stdio: "inherit" });
    }
  }
} catch (error) {
  console.warn("Warning during Playwright browser setup:", error.message);
}

// Use environment variables for MongoDB connection
const mongoUrl =
  process.env.MONGODB_URI ||
  "mongodb+srv://pagalavanks22cse:djbdqVHcJjc1fArv@cluster0.fczosvo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const port = process.env.PORT || 5000;

// Ensure directories exist
const PDF_DIR = path.join(__dirname, "pdfs");
fs.ensureDirSync(PDF_DIR);

// Create cache directory for Playwright if in production
if (process.env.NODE_ENV === "production") {
  fs.ensureDirSync("/tmp/playwright-browsers");
}

// CORS configuration
app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes should come before static files
app.use("/api", route);
app.use("/api/products", proroute);

// Serve PDF files
app.use("/pdfs", express.static(PDF_DIR));

// Serve static client files
app.use(express.static(path.join(__dirname, "../client/dist")));

// For any other routes, serve the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
});

// Start server
app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `Playwright Browsers Path: ${
      process.env.PLAYWRIGHT_BROWSERS_PATH || "default"
    }`
  );

  // Log Playwright settings
  console.log(
    `Playwright chromium executable path: ${
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
      "default bundled chromium"
    }`
  );
  console.log(
    `Playwright browsers path: ${
      process.env.PLAYWRIGHT_BROWSERS_PATH || "default"
    }`
  );

  try {
    await connectdb(mongoUrl);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
});
