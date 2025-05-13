const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs-extra');
const path = require('path');
const Invoice = require('../models/Invoice');
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
    const invoice = new Invoice(req.body);
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
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to delete an invoice
router.delete('/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to generate PDF for an invoice
router.get('/invoices/:id/pdf', async (req, res) => {
  try {
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
    invoiceData.items.forEach(item => {
      if (typeof item.totalprice === 'number') {
        item.totalprice = parseFloat(item.totalprice.toFixed(2));
      }
      
      if (typeof item.unitprice === 'number') {
        item.unitprice = parseFloat(item.unitprice.toFixed(2));
      }
    });
    
    // Add a formatted date
    invoiceData.formattedDate = new Date(invoice.date).toLocaleDateString('en-IN');
    
    // Generate PDF
    console.log("Starting PDF generation for invoice:", invoiceData._id);
    const pdfPath = await generatePdf(invoiceData);
    
    // Send response with the PDF path
    console.log("Returning PDF path:", pdfPath);
    res.json({ pdfPath });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;