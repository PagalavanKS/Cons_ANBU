const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs-extra");

console.log("Starting build process...");

// Install Playwright browsers
try {
  console.log("Installing Playwright browsers...");
  execSync("npx playwright install chromium", { stdio: "inherit" });
  console.log("Playwright browsers installed successfully");
} catch (error) {
  console.warn(
    "Warning: Could not install Playwright browsers:",
    error.message
  );
  console.log("Will try alternative browser installation methods");
}

// Install Chrome for Playwright in production
if (process.env.NODE_ENV === "production") {
  try {
    console.log("Checking for system Chromium...");

    // Check if chromium is already installed
    let chromiumExists = false;
    try {
      const result = execSync(
        "which chromium-browser || which chromium || which google-chrome"
      )
        .toString()
        .trim();
      if (result) {
        chromiumExists = true;
        console.log(`System browser found at: ${result}`);
      }
    } catch (error) {
      console.log("No system Chromium browser found, will install one");
    }

    if (!chromiumExists) {
      try {
        console.log("Installing Chromium browser...");
        execSync("apt-get update && apt-get install -y chromium-browser", {
          stdio: "inherit",
        });
        console.log("Chromium browser installation completed");
      } catch (installError) {
        console.warn(
          "Warning: Could not install Chromium browser:",
          installError.message
        );
        console.log("Will try to use Playwright bundled Chromium instead");
      }
    }
  } catch (error) {
    console.warn("Warning during browser setup:", error.message);
  }
}

// Create directory for Playwright browsers if needed
const playwrightBrowsersPath = "/tmp/playwright-browsers";
if (!fs.existsSync(playwrightBrowsersPath)) {
  fs.ensureDirSync(playwrightBrowsersPath);
  console.log(
    `Created Playwright browsers directory at ${playwrightBrowsersPath}`
  );
}

// Build client if in the parent directory
const clientDir = path.join(__dirname, "../client");
if (fs.existsSync(clientDir)) {
  try {
    console.log("Building client application...");

    // Install client dependencies
    console.log("Installing client dependencies...");
    execSync("npm install", { cwd: clientDir, stdio: "inherit" });

    // Build client
    console.log("Running client build...");
    execSync("npm run build", { cwd: clientDir, stdio: "inherit" });

    console.log("Client build completed successfully");
  } catch (error) {
    console.error("Error building client:", error.message);
    process.exit(1);
  }
} else {
  console.log("Client directory not found, skipping client build");
}

console.log("Build process completed successfully");
