import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { getProducts, addProduct, updateProduct, deleteProduct } from "../services/api";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    gstpercent: '0',
    availablestock: '',
    unit: 'G'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please try again.');
      setProducts([]);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Convert numerical values from strings
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      gstpercent: formData.gstpercent ? parseFloat(formData.gstpercent) : 0,
      availablestock: parseInt(formData.availablestock)
    };

    try {
      if (editMode) {
        // Update existing product
        await updateProduct(currentProductId, productData);
        alert('Product updated successfully');
      } else {
        // Create new product
        await addProduct(productData);
        alert('Product added successfully');
      }
      
      // Reset form and fetch updated product list
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      gstpercent: '0',
      availablestock: '',
      unit: 'KG'
    });
    setEditMode(false);
    setCurrentProductId(null);
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      gstpercent: product.gstpercent.toString(),
      availablestock: product.availablestock.toString(),
      unit: product.unit
    });
    setEditMode(true);
    setCurrentProductId(product._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
        alert('Product deleted successfully');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  return (
    <div className="product-management-container">
      <Sidebar />
      
      <div className="product-management-content">
        <h1 className="product-management-title">Product Management</h1>
        
        {/* Error Message */}
        {error && (
          <div className="form-error-container">
            <p>{error}</p>
          </div>
        )}
        
        {/* Product Form */}
        <div className="product-form-container">
          <h2 className="product-form-title">
            {editMode ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="product-form-grid">
              <div className="product-form-field">
                <label className="product-form-label">Product Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="product-form-input"
                  required
                />
              </div>
              
              <div className="product-form-field">
                <label className="product-form-label">Price*</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="product-form-input"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="product-form-field">
                <label className="product-form-label">GST Percentage</label>
                <input
                  type="number"
                  name="gstpercent"
                  value={formData.gstpercent}
                  onChange={handleInputChange}
                  className="product-form-input"
                  step="0.01"
                />
              </div>
              
              <div className="product-form-field">
                <label className="product-form-label">Available Stock*</label>
                <input
                  type="number"
                  name="availablestock"
                  value={formData.availablestock}
                  onChange={handleInputChange}
                  className="product-form-input"
                  required
                />
              </div>
              
              <div className="product-form-field">
                <label className="product-form-label">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="product-form-input"
                >
                  <option value="G">Count</option>
                  <option value="KG">KG</option>
                </select>
              </div>
              
              <div className="product-form-field product-form-grid-full">
                <label className="product-form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="product-form-input"
                  rows="3"
                ></textarea>
              </div>
            </div>
            
            <div className="product-form-actions">
              <button
                type="submit"
                className="btn btn-primary"
              >
                {editMode ? 'Update Product' : 'Add Product'}
              </button>
              
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* Product List */}
        <div className="product-table-container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading products...</p>
            </div>
          ) : (
            <table className="product-table">
              <thead className="product-table-header">
                <tr>
                  <th className="product-table-cell">#</th>
                  <th className="product-table-cell">Product Name</th>
                  <th className="product-table-cell">Price</th>
                  <th className="product-table-cell">GST %</th>
                  <th className="product-table-cell">Stock</th>
                  <th className="product-table-cell">Unit</th>
                  <th className="product-table-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product, index) => (
                    <tr key={product._id} className="product-row">
                      <td className="product-table-cell">{index + 1}</td>
                      <td className="product-table-cell">{product.name}</td>
                      <td className="product-table-cell invoice-amount">₹{product.price.toFixed(2)}</td>
                      <td className="product-table-cell">{product.gstpercent}%</td>
                      <td className="product-table-cell">{product.availablestock}</td>
                      <td className="product-table-cell">{product.unit}</td>
                      <td className="product-table-cell">
                        <div className="product-actions">
                          <button
                            onClick={() => handleEdit(product)}
                            className="btn btn-primary"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="btn btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="product-table-cell empty-message">
                      No products found. Add some products to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;