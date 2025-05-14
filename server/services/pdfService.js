const { chromium } = require("playwright");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const invoiceTemplate = require("../templates/invoicetemplate");

// Ensure PDF directory exists
const PDF_DIR = path.join(__dirname, "../pdfs");
fs.ensureDirSync(PDF_DIR);

// Function to check and install browsers if needed
async function ensurePlaywrightBrowsers() {
  try {
    console.log("Checking if Playwright browsers are installed...");
    // Try to run a quick check if browsers are installed
    await chromium
      .launch({ headless: true, timeout: 10000 })
      .then((browser) => browser.close());
    console.log("Playwright browsers are already installed");
    return true;
  } catch (error) {
    console.log("Playwright browsers might not be installed:", error.message);
    try {
      console.log("Attempting to install Playwright browsers...");
      execSync("npx playwright install chromium", { stdio: "inherit" });
      console.log("Playwright browsers installed successfully");
      return true;
    } catch (installError) {
      console.error("Failed to install Playwright browsers:", installError);
      return false;
    }
  }
}

/**
 * Generate PDF for an invoice using Playwright
 * @param {Object} invoice - The invoice data
 * @returns {Promise<String>} - Path to the generated PDF
 */
async function generatePdf(invoice) {
  let browser = null;

  try {
    console.log("Starting PDF generation process...");

    // Ensure browsers are installed
    await ensurePlaywrightBrowsers();

    // Create HTML content from the template
    const html = invoiceTemplate(invoice);

    // Generate a unique filename
    const filename = `invoice_${invoice._id}_${Date.now()}.pdf`;
    const pdfPath = path.join(PDF_DIR, filename);

    // Configure browser launch options
    const isProduction = process.env.NODE_ENV === "production";
    console.log(
      `Environment is ${isProduction ? "production" : "development"}`
    );

    const options = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--disable-gpu",
      ],
    };

    // In production, we need to use a specific executable path if available
    if (isProduction && process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
      options.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
      console.log(`Using specified executable path: ${options.executablePath}`);
    }

    console.log("Launching browser with options:", JSON.stringify(options));

    // Launch browser with correctly passed options
    browser = await chromium.launch(options);
    console.log("Browser launched successfully");

    // Create a new page
    const context = await browser.newContext();
    const page = await context.newPage();
    console.log("Browser page created");

    // Set content to our HTML
    await page.setContent(html, { waitUntil: "networkidle" });
    console.log("Content set to page");

    // Generate PDF
    console.log("Generating PDF...");
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        right: "10mm",
        bottom: "10mm",
        left: "10mm",
      },
    });

    console.log("PDF generated successfully at:", pdfPath);

    // Close the browser
    await browser.close();
    browser = null;

    return `/pdfs/${filename}`;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

module.exports = { generatePdf };
