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
  try {
    // Create HTML content from the template
    const html = invoiceTemplate(invoice);
    
    // Generate a unique filename
    const filename = `invoice_${invoice._id}_${Date.now()}.pdf`;
    const pdfPath = path.join(PDF_DIR, filename);
    
    // Launch a headless browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Create a new page
    const page = await browser.newPage();
    
    // Set content to our HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
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
    
    return `/pdfs/${filename}`;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
}

module.exports = { generatePdf };
