import React, { useEffect, useState } from 'react';
import { addinvoice, editinvoice } from '../services/api';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from '../utils/config.js';

const Invoiceform = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isEdit, setIsEdit] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [stockErrors, setStockErrors] = useState([]);
  
  const handleback = () => {
    navigate('/list');
  };
  
  const [items, setItems] = useState([
    {
      productid: '',
      productname: '',
      unitprice: 0,
      unit: 'KG',
      quantity: 1,
      totalprice: 0,
      gstpercent: 0,
      discount: 0,
      netamount: 0,
    },
  ]);
  
  const [invoiceDetails, setInvoiceDetails] = useState({
    customername: '',
    customerphone: '',
    customeremail: '',
    customeraddress: '',
    customercity: '',
    customerstate: '',
    customerpincode: '',
    customergst: '',
    date: new Date().toISOString().split('T')[0],
    subtotal: 0,
    totalgst: 0,
    totaldiscount: 0,
    grandtotal: 0,
  });
  
  // Fetch products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/products');
        if (Array.isArray(response.data)) {
          setProducts(response.data);
        } else if (response.data && Array.isArray(response.data.products)) {
          setProducts(response.data.products);
        } else {
          console.error('Products data is not in expected format:', response.data);
          setProducts([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  
  // Populate form if editing an invoice
  useEffect(() => {
    if (id && location.state) {
      const {
         customername,
         customerphone,
         customeremail,
         customeraddress,
         customercity,
         customerstate,
         customerpincode,
         customergst,
         date,
         items: stateItems,
         ...totals
       } = location.state;
      
      setInvoiceDetails({
         customername,
         customerphone: customerphone || '',
         customeremail: customeremail || '',
         customeraddress: customeraddress || '',
         customercity: customercity || '',
         customerstate: customerstate || '',
         customerpincode: customerpincode || '',
         customergst: customergst || '',
         date: date || new Date().toISOString().split('T')[0],
         ...totals
       });
      
      // Make sure we have valid items array
      if (stateItems && Array.isArray(stateItems) && stateItems.length > 0) {
        // Convert string values to appropriate types for calculation
        const processedItems = stateItems.map(item => ({
          ...item,
          unitprice: typeof item.unitprice === 'string' ? parseFloat(item.unitprice) : item.unitprice,
          quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity,
          gstpercent: typeof item.gstpercent === 'string' ? parseFloat(item.gstpercent) : item.gstpercent,
          discount: typeof item.discount === 'string' ? parseFloat(item.discount) : item.discount
        }));
         
        setItems(processedItems);
      }
      
      setIsEdit(true);
    }
  }, [id, location.state]);
  
  // Check stock availability when quantity is changed
  const checkStockAvailability = (productId, requestedQuantity, index) => {
    const selectedProduct = products.find(p => p._id === productId);
    if (selectedProduct && selectedProduct.stock !== undefined) {
      const available = parseFloat(selectedProduct.stock);
      const requested = parseFloat(requestedQuantity);
      
      if (requested > available) {
        // Create a new array to avoid mutating the previous state directly
        const newStockErrors = [...stockErrors];
        newStockErrors[index] = `Only ${available} ${selectedProduct.unit || 'KG'} available for ${selectedProduct.name}`;
        setStockErrors(newStockErrors);
        return false;
      } else {
        // Clear error for this index if everything is fine
        const newStockErrors = [...stockErrors];
        newStockErrors[index] = null;
        setStockErrors(newStockErrors);
        return true;
      }
    }
    return true; // If we can't check stock (e.g., stock info not available), assume it's okay
  };
  
  const handleProductChange = (index, productId) => {
    const selectedProduct = products.find(p => p._id === productId);
    
    if (selectedProduct) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        productid: selectedProduct._id,
        productname: selectedProduct.name,
        unitprice: selectedProduct.price,
        gstpercent: selectedProduct.gstpercent || 0,
        unit: selectedProduct.unit || 'KG',
      };
      
      // Convert values to numbers to ensure proper calculation
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitprice = parseFloat(newItems[index].unitprice) || 0;
      const discount = parseFloat(newItems[index].discount) || 0;
      const gstpercent = parseFloat(newItems[index].gstpercent) || 0;
      
      const totalprice = quantity * unitprice;
      const discountAmount = (totalprice * discount) / 100;
      const taxableAmount = totalprice - discountAmount;
      const gstAmount = (taxableAmount * gstpercent) / 100;
      
      newItems[index].totalprice = totalprice;
      newItems[index].netamount = taxableAmount + gstAmount;
      
      setItems(newItems);
      calculateTotals(newItems);
      
      // Check stock availability after product change
      checkStockAvailability(selectedProduct._id, quantity, index);
    }
  };
  
  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    
    // Store the original value
    newItems[index][field] = value;
    
    if (['quantity', 'unitprice', 'discount', 'gstpercent'].includes(field)) {
      // Convert string inputs to numbers for calculation
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitprice = parseFloat(newItems[index].unitprice) || 0;
      const discount = parseFloat(newItems[index].discount) || 0;
      const gstpercent = parseFloat(newItems[index].gstpercent) || 0;
      
      const totalprice = quantity * unitprice;
      const discountAmount = (totalprice * discount) / 100;
      const taxableAmount = totalprice - discountAmount;
      const gstAmount = (taxableAmount * gstpercent) / 100;
      
      newItems[index].totalprice = totalprice;
      newItems[index].netamount = taxableAmount + gstAmount;
      
      // Check stock availability if quantity is changed
      if (field === 'quantity' && newItems[index].productid) {
        checkStockAvailability(newItems[index].productid, value, index);
      }
    }
    
    setItems(newItems);
    calculateTotals(newItems);
  };
  
  const addRow = () => {
    setItems([
      ...items,
      {
        productid: '',
        productname: '',
        unitprice: 0,
        unit: 'KG',
        quantity: 1,
        totalprice: 0,
        gstpercent: 0,
        discount: 0,
        netamount: 0,
      },
    ]);
    
    // Add a null entry to stockErrors array to maintain alignment
    setStockErrors([...stockErrors, null]);
  };
  
  const removeRow = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    
    // Remove the corresponding stock error
    const newStockErrors = stockErrors.filter((_, i) => i !== index);
    setStockErrors(newStockErrors);
    
    calculateTotals(newItems);
  };
  
  const calculateTotals = (updatedItems = items) => {
    // Ensure all values are treated as numbers
    const subtotal = updatedItems.reduce((acc, item) => acc + (parseFloat(item.totalprice) || 0), 0);
    
    const totalgst = updatedItems.reduce(
      (acc, item) => {
        const itemTotal = parseFloat(item.totalprice) || 0;
        const discount = parseFloat(item.discount) || 0;
        const gstpercent = parseFloat(item.gstpercent) || 0;
        
        const afterDiscount = itemTotal - (itemTotal * discount) / 100;
        return acc + (afterDiscount * gstpercent) / 100;
      },
      0
    );
    
    const totaldiscount = updatedItems.reduce((acc, item) => {
      const itemTotal = parseFloat(item.totalprice) || 0;
      const discount = parseFloat(item.discount) || 0;
      return acc + (itemTotal * discount) / 100;
    }, 0);
    
    const grandtotal = subtotal - totaldiscount + totalgst;
    
    setInvoiceDetails((prev) => ({
      ...prev,
      subtotal,
      totalgst,
      totaldiscount,
      grandtotal,
    }));
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    // Check required customer fields
    if (!invoiceDetails.customername.trim()) errors.customername = "Customer name is required";
    if (!invoiceDetails.customerphone.trim()) errors.customerphone = "Phone number is required";
    if (!invoiceDetails.customeraddress.trim()) errors.customeraddress = "Address is required";
    if (!invoiceDetails.customercity.trim()) errors.customercity = "City is required";
    if (!invoiceDetails.customerstate.trim()) errors.customerstate = "State is required";
    if (!invoiceDetails.customerpincode.trim()) errors.customerpincode = "Pincode is required";
    
    // Check if at least one item has a valid product
    const invalidItems = items.filter(item => !item.productid || !item.productname);
    if (invalidItems.length > 0) {
      errors.items = "All items must have a selected product";
    }
    
    // Check for any stock errors
    const hasStockErrors = stockErrors.some(error => error !== null && error !== undefined);
    if (hasStockErrors) {
      errors.stock = "Some products have insufficient stock";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) {
      // Check specifically for stock errors
      if (formErrors.stock) {
        alert("Cannot save invoice: Some products have insufficient stock available.");
      } else {
        alert("Please fill in all required fields and select products for all items.");
      }
      return;
    }
    
    // Final stock check before submission
    let allStockValid = true;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.productid) {
        const isValid = checkStockAvailability(item.productid, item.quantity, i);
        if (!isValid) {
          allStockValid = false;
        }
      }
    }
    
    if (!allStockValid) {
      alert("Cannot save invoice: Stock quantities have changed. Please review your order quantities.");
      return;
    }
    
    // Convert string values to numbers for proper JSON serialization
    const processedItems = items.map(item => ({
      ...item,
      quantity: parseFloat(item.quantity) || 0,
      unitprice: parseFloat(item.unitprice) || 0,
      discount: parseFloat(item.discount) || 0,
      gstpercent: parseFloat(item.gstpercent) || 0,
      totalprice: parseFloat(item.totalprice) || 0,
      netamount: parseFloat(item.netamount) || 0
    }));
    
    const data = {
      ...invoiceDetails,
      items: processedItems,
    };
    
    try {
      console.log("Submitting invoice data:", data);
      
      if (isEdit && id) {
        await editinvoice(id, data);
        alert('Invoice updated successfully!');
      } else {
        await addinvoice(data);
        alert('Invoice saved successfully!');
      }
      navigate('/list');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please ensure all required fields are filled.');
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-75 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading invoice data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleback}
            className="bg-white text-blue-600 px-5 py-2 rounded-lg shadow-md hover:bg-blue-50 border border-blue-200 transition duration-200 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to List
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? 'Update Invoice' : 'Create New Invoice'}
          </h1>
        </div>
        {/* Main Form Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-4 px-6">
            <h2 className="text-xl font-semibold text-white">
              {isEdit ? 'Edit Existing Invoice' : 'New Invoice Details'}
            </h2>
            <p className="text-blue-100 text-sm">
              Fill in all required fields marked with an asterisk (*)
            </p>
          </div>
          {/* Customer Details */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name*
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={invoiceDetails.customername}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customername: e.target.value })}
                  className={`border ${formErrors.customername ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                  required
                />
                {formErrors.customername && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.customername}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={invoiceDetails.customerphone}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customerphone: e.target.value })}
                  className={`border ${formErrors.customerphone ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                  required
                />
                {formErrors.customerphone && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.customerphone}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={invoiceDetails.customeremail}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customeremail: e.target.value })}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  placeholder="GST Number (if applicable)"
                  value={invoiceDetails.customergst}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customergst: e.target.value })}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address*
              </label>
              <input
                type="text"
                placeholder="Street Address"
                value={invoiceDetails.customeraddress}
                onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customeraddress: e.target.value })}
                className={`border ${formErrors.customeraddress ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                required
              />
              {formErrors.customeraddress && (
                <p className="text-red-500 text-xs mt-1">{formErrors.customeraddress}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City*
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={invoiceDetails.customercity}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customercity: e.target.value })}
                  className={`border ${formErrors.customercity ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                  required
                />
                {formErrors.customercity && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.customercity}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State*
                </label>
                <input
                  type="text"
                  placeholder="State"
                  value={invoiceDetails.customerstate}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customerstate: e.target.value })}
                  className={`border ${formErrors.customerstate ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                  required
                />
                {formErrors.customerstate && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.customerstate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode*
                </label>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={invoiceDetails.customerpincode}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customerpincode: e.target.value })}
                  className={`border ${formErrors.customerpincode ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200`}
                  required
                />
                {formErrors.customerpincode && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.customerpincode}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={invoiceDetails.date}
                onChange={(e) => setInvoiceDetails({ ...invoiceDetails, date: e.target.value })}
                className="border border-gray-300 p-3 rounded-lg w-full md:w-1/3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
              />
            </div>
          </div>
          {/* Items Table */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Product Details
            </h3>
            
            {formErrors.items && (
              <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-red-600 text-sm">{formErrors.items}</p>
              </div>
            )}
            
            {formErrors.stock && (
              <div className="mb-4 bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-red-600 text-sm">{formErrors.stock}</p>
              </div>
            )}
            
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Discount (%)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">GST (%)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Net Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                      <td className="px-4 py-3 border-t border-gray-200">
                        <select
                          value={item.productid || ''}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                          className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                          required
                        >
                          <option value="">Select Product</option>
                          {Array.isArray(products) && products.map(product => (
                            <option key={product._id} value={product._id}>
                              {product.name} (₹{product.price}/{product.unit || 'KG'}) - Stock: {product.stock || 'N/A'}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 border-t border-gray-200">
                        <div>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className={`border ${stockErrors[index] ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent`}
                          />
                          {stockErrors[index] && (
                            <p className="text-red-500 text-xs mt-1">{stockErrors[index]}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-t border-gray-200">
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitprice}
                          onChange={(e) => handleItemChange(index, 'unitprice', e.target.value)}
                          className={`border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent ${item.productid ? 'bg-gray-100' : ''}`}
                          readOnly={!!item.productid}
                        />
                      </td>
                      <td className="px-4 py-3 border-t border-gray-200">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                          className="border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-3 border-t border-gray-200">
                        <input
                          type="number"
                          min="0"
                          value={item.gstpercent}
                          onChange={(e) => handleItemChange(index, 'gstpercent', e.target.value)}
                          className={`border border-gray-300 p-2 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:border-transparent ${item.productid ? 'bg-gray-100' : ''}`}
                          readOnly={!!item.productid}
                        />
                      </td>
                      <td className="px-4 py-3 border-t border-gray-200 font-medium text-blue-800">
                        ₹{parseFloat(item.netamount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-t border-gray-200">
                        <button
                          onClick={() => removeRow(index)}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition duration-200 flex items-center"
                          disabled={items.length === 1}
                        >
<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                           <span className="ml-1">Remove</span>
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             
             <div className="mt-4">
               <button
                 onClick={addRow}
                 className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition duration-200 flex items-center"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                 </svg>
                 Add More Items
               </button>
             </div>
           </div>
           
           {/* Invoice Totals */}
           <div className="p-6">
             <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 ml-auto md:w-2/5">
               <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-blue-200 pb-2">
                 Invoice Summary
               </h3>
               <div className="space-y-3">
                 <div className="flex justify-between">
                   <span className="text-gray-600">Subtotal:</span>
                   <span className="text-gray-800 font-medium">₹{parseFloat(invoiceDetails.subtotal).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">Discount:</span>
                   <span className="text-green-600 font-medium">-₹{parseFloat(invoiceDetails.totaldiscount).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600">GST:</span>
                   <span className="text-gray-800 font-medium">₹{parseFloat(invoiceDetails.totalgst).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between pt-3 border-t border-blue-200">
                   <span className="text-gray-800 font-bold">Grand Total:</span>
                   <span className="text-blue-700 font-bold text-xl">₹{parseFloat(invoiceDetails.grandtotal).toFixed(2)}</span>
                 </div>
               </div>
             </div>
           </div>
           
           {/* Action Buttons */}
           <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-4">
             <button
               onClick={handleback}
               className="bg-white text-gray-700 px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 border border-gray-300 transition duration-200"
             >
               Cancel
             </button>
             <button
               onClick={handleSubmit}
               className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition duration-200 flex items-center"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               {isEdit ? 'Update Invoice' : 'Save Invoice'}
             </button>
           </div>
         </div>
       </div>
     </div>
  );
};

export default Invoiceform;