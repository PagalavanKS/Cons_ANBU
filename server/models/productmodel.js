const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: false },
        price: { type: Number, required: true },
        gstpercent: { type: Number, required: false, default: 0 },
        availablestock: { type: Number, required: true, default: 0 },
        unit: { type: String, default: 'KG' }
    },
    { timestamps: true }
);

const product = mongoose.model('product', productSchema);
module.exports = product;