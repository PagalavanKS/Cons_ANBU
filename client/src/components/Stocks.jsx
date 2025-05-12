import React from 'react';
import Sidebar from './Sidebar';

const Stocks = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-10">
            <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">📦 Stocks Management</h2>
                <p className="text-gray-600 text-lg">This section is currently under development. Stay tuned!</p>
                <div className="mt-6">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition duration-300">
                        View Inventory
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Stocks;
