const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');
const Invoice = require('../models/invoiceModel');
const Product = require('../models/productmodel'); // Ensure correct casing in the import
const { generatePdf } = require('../services/pdfService');

const router = express.Router();

// Ensure PDF directory exists
const PDF_DIR = path.join(__dirname, '../pdfs');
fs.ensureDirSync(PDF_DIR);

// Route to get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ date: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get a single invoice by ID
router.get('/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to create a new invoice
router.post('/invoices', async (req, res) => {
  try {
    const invoiceData = req.body;
    console.log(invoiceData)
    
    // Update product stock when creating invoice
    if (Array.isArray(invoiceData.items) && invoiceData.items.length > 0) {
      try {
        // Use Promise.all to ensure all product updates complete before saving the invoice
        await Promise.all(invoiceData.items.map(async (item) => {
          if (!item.productid) return; // Skip if no product ID
          
          const productId = item.productid;
          const quantity = Number(item.quantity || 0);
          
          // Find the product and update its stock
          const product = await Product.findByIdAndUpdate(
            productId,
            { $inc: { availablestock: -quantity } }, // Decrement the stock by quantity
            { new: true } // Return the updated document
          );
          
          if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
          }
          
          console.log(product);
        }));
      } catch (stockError) {
        return res.status(400).json({ error: stockError.message });
      }
    }
    
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to update an invoice
router.put('/invoices/:id', async (req, res) => {
  try {
    // Get the old invoice to compare items
    const oldInvoice = await Invoice.findById(req.params.id);
    if (!oldInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    const invoiceData = req.body;
    
    // Update product stock if items have changed
    if (Array.isArray(invoiceData.items) && invoiceData.items.length > 0) {
      try {
        // First restore old quantities to products
        if (Array.isArray(oldInvoice.items) && oldInvoice.items.length > 0) {
          await Promise.all(oldInvoice.items.map(async (item) => {
            if (!item.productid) return; // Skip if no product ID
            
            const productId = item.productid;
            const quantity = Number(item.quantity || 0);
            
            // Add back the previously deducted quantity
            await Product.findByIdAndUpdate(
              productId,
              { $inc: { availablestock: quantity } },
              { new: true }
            );
          }));
        }
        
        // Then deduct new quantities
        await Promise.all(invoiceData.items.map(async (item) => {
          if (!item.productid) return; // Skip if no product ID
          
          const productId = item.productid;
          const quantity = Number(item.quantity || 0);
          
          // Find the product and update its stock
          const product = await Product.findByIdAndUpdate(
            productId,
            { $inc: { availablestock: -quantity } }, // Decrement the stock by quantity
            { new: true } // Return the updated document
          );
          
          if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
          }
        }));
      } catch (stockError) {
        return res.status(400).json({ error: stockError.message });
      }
    }
    
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      invoiceData,
      { new: true, runValidators: true }
    );
    
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to delete an invoice
router.delete('/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Restore product stock for deleted invoice
    if (Array.isArray(invoice.items) && invoice.items.length > 0) {
      try {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        for (const item of invoice.items) {
          if (!item.productid) continue; // Changed from productId to productid to match schema
          
          const product = await Product.findById(item.productid).session(session);
          if (product) {
            // Restore the quantity
            product.availablestock += Number(item.quantity || 0);
            await product.save({ session });
          }
        }
        
        await session.commitTransaction();
        session.endSession();
      } catch (stockError) {
        console.error('Error restoring stock:', stockError);
        // Continue with deletion even if stock restoration fails
      }
    }
    
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to generate PDF for an invoice
router.get('/invoices/:id/pdf', async (req, res) => {
  try {
    console.log(`Generating PDF for invoice ID: ${req.params.id}`);
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid invoice ID format' });
    }
    
    // Get invoice data
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Convert mongoose document to plain object
    const invoiceData = invoice.toObject();
    
    // Format currency values
    if (Array.isArray(invoiceData.items)) {
      invoiceData.items.forEach(item => {
        if (typeof item.totalprice === 'number') {
          item.totalprice = parseFloat(item.totalprice.toFixed(2));
        }
        
        if (typeof item.unitprice === 'number') {
          item.unitprice = parseFloat(item.unitprice.toFixed(2));
        }
      });
    } else {
      console.warn("Invoice has no items array:", invoiceData);
    }
    
    // Add a formatted date
    invoiceData.formattedDate = new Date(invoice.date).toLocaleDateString('en-IN');
    
    console.log("Prepared invoice data for PDF generation");
    
    // Generate PDF
    try {
      const pdfPath = await generatePdf(invoiceData);
      console.log(`PDF generated successfully at path: ${pdfPath}`);
      
      // Send response with the PDF path
      res.json({ pdfPath });
    } catch (pdfError) {
      console.error("PDF generation failed:", pdfError);
      
      // Send a more detailed error message to help with debugging
      return res.status(500).json({ 
        error: pdfError.message,
        details: "The PDF generation process failed. Check server logs for more details."
      });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;