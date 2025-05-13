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
        <div className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <span>AP</span>
            </div>

            {/* Navigation Links */}
            <div className="sidebar-nav">
                {navlinks.map((link, index) => (
                    <NavLink 
                        key={index} 
                        to={link.path} 
                        className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
                    >
                        <link.icon className="w-5 h-5" />
                        <span className="sidebar-link-text">{link.title}</span>
                    </NavLink>
                ))}
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-footer-inner">
                    <p className="sidebar-footer-text">
                        Anbu Press
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;