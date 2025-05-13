const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const invoiceTemplate = require('../templates/invoicetemplate');

// Ensure PDF directory exists
const PDF_DIR = path.join(__dirname, '../pdfs');
fs.ensureDirSync(PDF_DIR);

/**
 * Generate PDF for an invoice using Puppeteer
 * @param {Object} invoice - The invoice data
 * @returns {Promise<String>} - Path to the generated PDF
 */
async function generatePdf(invoice) {
  let browser = null;
  
  try {
    console.log("Starting PDF generation process...");
    
    // Create HTML content from the template
    const html = invoiceTemplate(invoice);
    
    // Generate a unique filename
    const filename = `invoice_${invoice._id}_${Date.now()}.pdf`;
    const pdfPath = path.join(PDF_DIR, filename);

    // Configure browser launch options for different environments
    const isProduction = process.env.NODE_ENV === 'production';
    const options = {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ]
    };
    
    // In production (Render), we need specific configurations
    if (isProduction) {
      // Use the bundled Chromium executable if available
      console.log("Using production Puppeteer configuration");
      
      // Log the puppeteer version and executable path for debugging
      const puppeteerInfo = await getPuppeteerInfo();
      console.log("Puppeteer info:", puppeteerInfo);
    }
    
    // Launch browser
    console.log("Launching browser with options:", JSON.stringify(options));
    browser = await puppeteer.launch(options);
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set content to our HTML
    console.log("Setting page content...");
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    console.log("Generating PDF...");
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm'
      }
    });
    
    // Close the browser
    await browser.close();
    browser = null;
    
    console.log("PDF generation completed successfully:", pdfPath);
    return `/pdfs/${filename}`;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

/**
 * Get information about Puppeteer installation for debugging
 */
async function getPuppeteerInfo() {
  try {
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revInfo = await browserFetcher.download(puppeteer.browserRevision);
    
    return {
      version: puppeteer.version,
      revision: puppeteer.browserRevision,
      executablePath: revInfo?.executablePath || "Unknown",
      exists: revInfo ? fs.existsSync(revInfo.executablePath) : false
    };
  } catch (error) {
    return {
      error: error.message,
      version: puppeteer.version
    };
  }
}

module.exports = { generatePdf };
