import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home as HomeIcon, FileText, Package, BarChart2 } from 'lucide-react';

const Sidebar = () => {
    const navlinks = [
        { path: '/', title: 'Dashboard', icon: HomeIcon },
        { path: '/list', title: 'Sales Invoice', icon: FileText },
        { path: '/products', title: 'Products', icon: Package },
        { path: '/stock', title: 'Stocks', icon: BarChart2 }
    ];

    return (
        <div className="w-[18vw] bg-gradient-to-b from-gray-900 via-indigo-900 to-blue-900 shadow-xl flex flex-col items-center py-10">
            {/* Logo */}
            <div className="w-24 h-24 bg-gradient-to-br from-white to-indigo-50 rounded-full shadow-lg flex items-center justify-center mb-8 transform transition-transform duration-300 hover:scale-110">
                <span className="text-3xl font-bold bg-gradient-to-br from-indigo-600 to-blue-600 bg-clip-text text-transparent">AP</span>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col gap-4 w-full px-4">
                {navlinks.map((link, index) => (
                    <NavLink 
                        key={index} 
                        to={link.path} 
                        className={({ isActive }) => `
                            flex items-center gap-3 px-6 py-3.5 rounded-xl transition-all duration-300
                            ${isActive 
                                ? 'bg-white text-indigo-900 shadow-lg font-semibold scale-105' 
                                : 'text-white/80 hover:bg-white/10 hover:scale-102'
                            }
                        `}
                    >
                        <link.icon className="w-5 h-5" />
                        <span className="font-medium">{link.title}</span>
                    </NavLink>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-auto px-6 py-4 w-full">
                <div className="border-t border-white/10 pt-4">
                    <p className="text-white/60 text-sm text-center">
                        Anbu Press
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;