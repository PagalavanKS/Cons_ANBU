const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  customername: {
    type: String,
    required: [true, 'Customer name is required']
  },
  customerphone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  customeremail: {
    type: String
  },
  customeraddress: {
    type: String,
    required: [true, 'Address is required']
  },
  customercity: {
    type: String,
    required: [true, 'City is required']
  },
  customerstate: {
    type: String,
    required: [true, 'State is required']
  },
  customerpincode: {
    type: String,
    required: [true, 'Pincode is required']
  },
  customergst: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  items: [{
    productid: String,
    productname: String,
    unitprice: Number,
    unit: {
      type: String,
      default: 'KG'
    },
    quantity: Number,
    totalprice: Number,
    gstpercent: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    netamount: Number
  }],
  subtotal: {
    type: Number,
    required: true
  },
  totalgst: {
    type: Number,
    default: 0
  },
  totaldiscount: {
    type: Number,
    default: 0
  },
  grandtotal: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
