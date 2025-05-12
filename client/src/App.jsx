import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Invoicelist from "./components/Invoicelist";
import Stocks from "./components/Stocks";
import Invoiceform from "./components/Invoiceform";
import ProductManagement from "./components/Productsform";
import LoadingScreen from "./components/LoadingScreen";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/list" element={<Invoicelist/>}/>
          <Route path="/stock" element={<Stocks/>}/>
          <Route path='/form' element={<Invoiceform/>}/>
          <Route path="/form/:id" element={<Invoiceform/>} />
          <Route path="/products" element={<ProductManagement/>}/>
          <Route path="/products/:id" element={<ProductManagement/>}/>
        </Routes>
      </Router>
    </div>
  );
};

export default App;