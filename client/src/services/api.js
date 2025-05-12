import axiosInstance from '../utils/config.js'

// Invoice API functions
const getinvoice = () => axiosInstance.get('/invoices')
const getinvoicebyid = (id) => axiosInstance.get(`/invoices/${id}`) // Fixed: added id parameter
const addinvoice = (invoicedata) => axiosInstance.post('/invoices', invoicedata)
const editinvoice = (id, editedinvoice) => axiosInstance.put(`/invoices/${id}`, editedinvoice)
const deletedinvoice = (id) => axiosInstance.delete(`/invoices/${id}`)
const genpdf = (id) => axiosInstance.get(`/invoices/${id}/pdf`);

// Product API functions
const getProducts = () => axiosInstance.get('/products')
const getProductById = (id) => axiosInstance.get(`/products/${id}`)
const addProduct = (productData) => axiosInstance.post('/products', productData)
const updateProduct = (id, productData) => axiosInstance.put(`/products/${id}`, productData)
const deleteProduct = (id) => axiosInstance.delete(`/products/${id}`)

export  { 
  // Invoice exports
  getinvoice, addinvoice, editinvoice, deletedinvoice, getinvoicebyid, genpdf,
  // Product exports
  getProducts, getProductById, addProduct, updateProduct, deleteProduct 
};