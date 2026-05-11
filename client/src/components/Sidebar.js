import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/responsive.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/manage-products', label: 'Manage Products', icon: '📦' },
    { path: '/manage-sellers', label: 'Manage Sellers', icon: '👥' },
    { path: '/manage-purchases', label: 'Manage Purchases', icon: '🛍️' },
    { path: '/manage-sales', label: 'Manage Sales', icon: '💰' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <>
      <button 
        className="navbar-toggler d-md-none" 
        onClick={toggleSidebar}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1000,
          background: '#fff',
          border: 'none',
          padding: '0.5rem',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '1.5rem' }}>☰</span>
      </button>

      <aside className={`sidebar ${isOpen ? 'show' : ''}`} style={{
        width: '250px',
        background: '#fff',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        zIndex: 100,
        transition: 'transform 0.3s ease-in-out'
      }}>
        <div className="sidebar-header" style={{
          padding: '1.5rem',
          borderBottom: '1px solid #eee',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#1976d2' }}>Inventory System</h3>
        </div>

        <nav className="sidebar-nav" style={{ padding: '1rem 0' }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                color: location.pathname === item.path ? '#1976d2' : '#333',
                textDecoration: 'none',
                transition: 'all 0.2s',
                backgroundColor: location.pathname === item.path ? '#f8f9fa' : 'transparent',
                borderLeft: location.pathname === item.path ? '4px solid #1976d2' : '4px solid transparent',
              }}
            >
              <span style={{ marginRight: '0.75rem', fontSize: '1.2rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99
          }}
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar; 