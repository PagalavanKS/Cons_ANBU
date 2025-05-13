import React from 'react';
import Sidebar from './Sidebar';

const Stocks = () => {
  return (
    <div className="page-container">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="main-content center-content">
            <div className="stock-card">
                <h2 className="stock-title">📦 Stocks Management</h2>
                <p className="stock-description">This section is currently under development. Stay tuned!</p>
                <div className="stock-action">
                    <button className="btn btn-primary">
                        View Inventory
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Stocks;
