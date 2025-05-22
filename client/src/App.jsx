import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'; // Import base CSS with variables and utility classes
import './App.css';    // Import component-specific styling
import Home from './pages/Home';
import Invoicelist from './components/Invoicelist';
import Invoiceform from './components/Invoiceform';
import ProductManagement from './components/Productsform';
import LoadingScreen from './components/LoadingScreen';
import Stocks from './components/Stocks'; // Add this import statement

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return <LoadingScreen />;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list" element={<Invoicelist />} />
        <Route path="/form" element={<Invoiceform />} />
        <Route path="/form/:id" element={<Invoiceform />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/stock" element={<Stocks />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;