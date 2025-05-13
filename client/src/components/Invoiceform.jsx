import React, { useEffect, useState } from 'react';
import { addinvoice, editinvoice } from '../services/api';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from '../utils/config.js';
import Sidebar from './Sidebar';

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
      <div className="loading-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading invoice data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="invoice-form-container">
      <Sidebar />
      
      <div className="invoice-form-content">
        {/* Header with back button */}
        <div className="invoice-form-header-container">
          <button onClick={handleback} className="back-button">
            <svg className="back-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to List
          </button>
          <h1 className="invoice-form-title">
            {isEdit ? 'Update Invoice' : 'Create New Invoice'}
          </h1>
        </div>
        
        {/* Main Form Content */}
        <div className="invoice-form-panel">
          {/* Form Header */}
          <div className="invoice-panel-header">
            <h2 className="invoice-panel-header-title">
              {isEdit ? 'Edit Existing Invoice' : 'New Invoice Details'}
            </h2>
            <p className="invoice-panel-header-subtitle">
              Fill in all required fields marked with an asterisk (*)
            </p>
          </div>
          
          {/* Customer Details */}
          <div className="invoice-section">
            <h3 className="invoice-section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Customer Information
            </h3>
            
            <div className="invoice-form-grid">
              <div className="invoice-form-group">
                <label className="invoice-label">Customer Name*</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={invoiceDetails.customername}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customername: e.target.value })}
                  className={`invoice-input ${formErrors.customername ? 'invoice-input-error' : ''}`}
                  required
                />
                {formErrors.customername && (
                  <p className="invoice-error-message">{formErrors.customername}</p>
                )}
              </div>
              
              <div className="invoice-form-group">
                <label className="invoice-label">Phone Number*</label>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={invoiceDetails.customerphone}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customerphone: e.target.value })}
                  className={`invoice-input ${formErrors.customerphone ? 'invoice-input-error' : ''}`}
                  required
                />
                {formErrors.customerphone && (
                  <p className="invoice-error-message">{formErrors.customerphone}</p>
                )}
              </div>
              
              <div className="invoice-form-group">
                <label className="invoice-label">Email</label>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={invoiceDetails.customeremail}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customeremail: e.target.value })}
                  className="invoice-input"
                />
              </div>
              
              <div className="invoice-form-group">
                <label className="invoice-label">GST Number</label>
                <input
                  type="text"
                  placeholder="GST Number (if applicable)"
                  value={invoiceDetails.customergst}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customergst: e.target.value })}
                  className="invoice-input"
                />
              </div>
              
              <div className="invoice-form-group full-width">
                <label className="invoice-label">Address*</label>
                <input
                  type="text"
                  placeholder="Street Address"
                  value={invoiceDetails.customeraddress}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customeraddress: e.target.value })}
                  className={`invoice-input ${formErrors.customeraddress ? 'invoice-input-error' : ''}`}
                  required
                />
                {formErrors.customeraddress && (
                  <p className="invoice-error-message">{formErrors.customeraddress}</p>
                )}
              </div>
              
              <div className="invoice-form-group">
                <label className="invoice-label">City*</label>
                <input
                  type="text"
                  placeholder="City"
                  value={invoiceDetails.customercity}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customercity: e.target.value })}
                  className={`invoice-input ${formErrors.customercity ? 'invoice-input-error' : ''}`}
                  required
                />
                {formErrors.customercity && (
                  <p className="invoice-error-message">{formErrors.customercity}</p>
                )}
              </div>
              
              <div className="invoice-form-group">
                <label className="invoice-label">State*</label>
                <input
                  type="text"
                  placeholder="State"
                  value={invoiceDetails.customerstate}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customerstate: e.target.value })}
                  className={`invoice-input ${formErrors.customerstate ? 'invoice-input-error' : ''}`}
                  required
                />
                {formErrors.customerstate && (
                  <p className="invoice-error-message">{formErrors.customerstate}</p>
                )}
              </div>
              
              <div className="invoice-form-group">
                <label className="invoice-label">Pincode*</label>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={invoiceDetails.customerpincode}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, customerpincode: e.target.value })}
                  className={`invoice-input ${formErrors.customerpincode ? 'invoice-input-error' : ''}`}
                  required
                />
                {formErrors.customerpincode && (
                  <p className="invoice-error-message">{formErrors.customerpincode}</p>
                )}
              </div>
              
              <div className="invoice-form-group">
                <label className="invoice-label">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDetails.date}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, date: e.target.value })}
                  className="invoice-input date-input"
                />
              </div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="invoice-section">
            <h3 className="invoice-section-title">
              <svg className="section-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Product Details
            </h3>
            
            {formErrors.items && (
              <div className="invoice-error-banner">
                <p>{formErrors.items}</p>
              </div>
            )}
            
            {formErrors.stock && (
              <div className="invoice-error-banner">
                <p>{formErrors.stock}</p>
              </div>
            )}
            
            <div className="invoice-table-wrapper">
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Discount (%)</th>
                    <th>GST (%)</th>
                    <th>Net Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                      <td>
                        <select
                          value={item.productid || ''}
                          onChange={(e) => handleProductChange(index, e.target.value)}
                          className="invoice-select"
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
                      <td>
                        <div className="quantity-container">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className={`invoice-input ${stockErrors[index] ? 'invoice-input-error' : ''}`}
                          />
                          {stockErrors[index] && (
                            <p className="invoice-error-message stock-error">{stockErrors[index]}</p>
                          )}
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitprice}
                          onChange={(e) => handleItemChange(index, 'unitprice', e.target.value)}
                          className={`invoice-input ${item.productid ? 'readonly-input' : ''}`}
                          readOnly={!!item.productid}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                          className="invoice-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={item.gstpercent}
                          onChange={(e) => handleItemChange(index, 'gstpercent', e.target.value)}
                          className={`invoice-input ${item.productid ? 'readonly-input' : ''}`}
                          readOnly={!!item.productid}
                        />
                      </td>
                      <td className="net-amount-cell">
                        ₹{parseFloat(item.netamount).toFixed(2)}
                      </td>
                      <td>
                        <button
                          onClick={() => removeRow(index)}
                          className="remove-item-btn"
                          disabled={items.length === 1}
                          title="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"></path>
                          </svg>
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="add-item-container">
              <button onClick={addRow} className="add-item-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                Add More Items
              </button>
            </div>
          </div>
          
          {/* Invoice Totals */}
          <div className="invoice-section totals-section">
            <div className="invoice-totals-panel">
              <h3 className="invoice-totals-title">Invoice Summary</h3>
              <div className="invoice-totals-content">
                <div className="invoice-totals-row">
                  <span className="totals-label">Subtotal:</span>
                  <span className="totals-value">₹{parseFloat(invoiceDetails.subtotal).toFixed(2)}</span>
                </div>
                <div className="invoice-totals-row">
                  <span className="totals-label">Discount:</span>
                  <span className="totals-value discount-value">-₹{parseFloat(invoiceDetails.totaldiscount).toFixed(2)}</span>
                </div>
                <div className="invoice-totals-row">
                  <span className="totals-label">GST:</span>
                  <span className="totals-value">₹{parseFloat(invoiceDetails.totalgst).toFixed(2)}</span>
                </div>
                <div className="invoice-totals-row grand-total-row">
                  <span className="grand-total-label">Grand Total:</span>
                  <span className="grand-total-value">₹{parseFloat(invoiceDetails.grandtotal).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="invoice-actions-footer">
            <button onClick={handleback} className="cancel-btn">
              Cancel
            </button>
            <button onClick={handleSubmit} className="save-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
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