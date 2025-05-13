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

    // Configure browser launch options
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`Environment is ${isProduction ? 'production' : 'development'}`);
    
    const options = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--window-size=1920x1080',
      ]
    };
    
    // In Render, we need to use a specific executable path if available
    if (isProduction) {
      try {
        // Use chromium installed by the system if available (usually in Render)
        if (fs.existsSync('/usr/bin/chromium-browser')) {
          options.executablePath = '/usr/bin/chromium-browser';
          console.log("Using system chromium at /usr/bin/chromium-browser");
        } else if (fs.existsSync('/usr/bin/chromium')) {
          options.executablePath = '/usr/bin/chromium';
          console.log("Using system chromium at /usr/bin/chromium");
        } else if (fs.existsSync('/usr/bin/chrome')) {
          options.executablePath = '/usr/bin/chrome';
          console.log("Using system chrome at /usr/bin/chrome");
        } else {
          console.log("No system chrome found, using bundled browser");
        }
      } catch (error) {
        console.warn("Error checking for browser executable:", error.message);
      }
    }

    console.log("Launching browser with options:", JSON.stringify(options));
    
    // Launch browser with correctly passed options
    browser = await puppeteer.launch(options);
    console.log("Browser launched successfully");
    
    // Create a new page
    const page = await browser.newPage();
    console.log("Browser page created");
    
    // Set content to our HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });
    console.log("Content set to page");
    
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
    
    console.log("PDF generated successfully at:", pdfPath);
    
    // Close the browser
    await browser.close();
    browser = null;
    
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

module.exports = { generatePdf };
