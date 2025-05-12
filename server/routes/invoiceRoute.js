const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');
const Invoice = require('../models/invoiceModel');
const Product = require('../models/productmodel'); // Import Product model
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const template = require('../templates/invoicetemplate');
const { error } = require('console');

function calculateInvoiceData(invoiceData) {
    let subtotal = 0;
    let totalGst = 0;
    let totalDiscount = 0;

    invoiceData.items.forEach(item => {
        item.totalprice = item.unitprice * item.quantity;
        item.netamount = item.totalprice;

        if (item.gstpercent) {
            const gstAmount = (item.gstpercent / 100) * item.totalprice;
            totalGst += gstAmount;
            item.netamount += gstAmount;
        }

        if (item.discount) {
            const discountAmount = (item.discount / 100) * item.totalprice;
            totalDiscount += discountAmount;
            item.netamount -= discountAmount;
        }

        subtotal += item.totalprice;
    });

    const grandTotal = subtotal + totalGst - totalDiscount;

    return { subtotal, totalGst, totalDiscount, grandTotal };
}

router.post('/invoices', async (req, res) => {
    try {
        console.log("Incoming Invoice Data:", req.body);

        const invoiceData = req.body;
        console.log(invoiceData)
        // Process each item to ensure product information is complete
        for(let i = 0; i < invoiceData.items.length; i++) {
            const item = invoiceData.items[i];
            
            // If productid is provided, fetch product details
            if(item.productid) {
                const product = await Product.findById(item.productid);
                if(product) {
                    // Set or update product information from database
                    item.productname = product.name;
                    if(!item.unitprice) item.unitprice = product.price;
                    if(!item.gstpercent) item.gstpercent = product.gstpercent;
                    item.unit = 'KG'; // Always KG as per requirement
                }
            }
        }
        
        const { subtotal, totalGst, totalDiscount, grandTotal } = calculateInvoiceData(invoiceData);

        invoiceData.subtotal = subtotal;
        invoiceData.totalgst = totalGst;
        invoiceData.totaldiscount = totalDiscount;
        invoiceData.grandtotal = grandTotal;

        console.log("Calculated Invoice Data:", invoiceData);

        const newinvoice = new Invoice(invoiceData);
        await newinvoice.save();
        
        // Optionally update product stock
        for(const item of invoiceData.items) {
            if(item.productid) {
                await Product.findByIdAndUpdate(
                    item.productid,
                    { $inc: { availablestock: -item.quantity } }
                );
            }
        }
        
        res.status(201).json(newinvoice);
    } catch (error) {
        console.error("Error Saving Invoice:", error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/invoices', async (req, res) => {
    try {
        const fetcheddata = await Invoice.find();
        res.status(200).json(fetcheddata);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/invoices/:id', async (req, res) => {
    try {
        const invoiceData = req.body;
        
        // Process each item to ensure product information is complete
        for(let i = 0; i < invoiceData.items.length; i++) {
            const item = invoiceData.items[i];
            
            // If productid is provided, fetch product details
            if(item.productid) {
                const product = await Product.findById(item.productid);
                if(product) {
                    // Set or update product information from database
                    item.productname = product.name;
                    if(!item.unitprice) item.unitprice = product.price;
                    if(!item.gstpercent) item.gstpercent = product.gstpercent;
                    item.unit = 'KG'; // Always KG as per requirement
                }
            }
        }
        
        const { subtotal, totalGst, totalDiscount, grandTotal } = calculateInvoiceData(invoiceData);

        invoiceData.subtotal = subtotal;
        invoiceData.totalgst = totalGst;
        invoiceData.totaldiscount = totalDiscount;
        invoiceData.grandtotal = grandTotal;

        const updatedinvoice = await Invoice.findByIdAndUpdate(req.params.id, invoiceData, { new: true });
        if (!updatedinvoice) return res.status(404).json({ message: 'Invoice not found' });
        res.status(200).json(updatedinvoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/invoices/:id', async (req, res) => {
    try {
        const deleteddata = await Invoice.findByIdAndDelete(req.params.id);
        if (!deleteddata) return res.status(404).json({ message: 'Invoice not found' });
        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/invoices/:id', async (req, res) => {
    try {
        const specificdata = await Invoice.findById(req.params.id);
        if (!specificdata) return res.status(404).json({ message: 'Invoice not found' });
        res.status(200).json(specificdata);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/invoices/:id/pdf', async (req, res) => {
    try {
        const invoicepdf = await Invoice.findById(req.params.id);
        if (!invoicepdf) return res.status(404).json({ message: 'Invoice not found' });

        const invoiceHTML = template(invoicepdf);
        const browser = await puppeteer.launch({
            headless: true,  
            args: ['--no-sandbox', '--disable-setuid-sandbox']  
        });
        const page = await browser.newPage();
        await page.setContent(invoiceHTML);
        const filename = `invoice-${invoicepdf._id}.pdf`;
        const pdfPath = path.join(__dirname, `../pdfs/${filename}`);
        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
        });
        await browser.close();

        // Return the file path relative to the frontend
        const publicPath = `/pdfs/${filename}`;
        res.status(200).json({ message: 'PDF generated successfully', pdfPath: publicPath });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;