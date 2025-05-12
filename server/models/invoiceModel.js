const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
    {
        // Enhanced customer details
        customername: { type: String, required: true },
        customerphone: { type: String, required: true },
        customeremail: { type: String, required: false },
        customeraddress: { type: String, required: true },
        customercity: { type: String, required: true },
        customerstate: { type: String, required: true },
        customerpincode: { type: String, required: true },
        customergst: { type: String, required: false },
        
        date: { type: Date, default: Date.now },
        items: [
            {
                productid: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
                productname: { type: String, required: true },
                unitprice: { type: Number, required: true },
                // Modified for KG only sales
                unit: { type: String, default: 'KG' },
                quantity: { type: Number, required: true },
                totalprice: { type: Number, required: true },
                gstpercent: { type: Number, required: false },
                discount: { type: Number, required: false },
                netamount: { type: Number, required: true }
            }
        ],
        subtotal: { type: Number, required: true },
        totalgst: { type: Number, required: false },
        totaldiscount: { type: Number, required: false },
        grandtotal: { type: Number, required: true }
    }
);

const invoice = mongoose.model('invoice', invoiceSchema);
module.exports = invoice;