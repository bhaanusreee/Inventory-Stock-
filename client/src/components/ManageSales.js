import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteSale, updateSaleStatus } from '../redux/slices/salesSlice';
import '../styles/responsive.css';
import '../styles/custom.css';

const ManageSales = () => {
  const dispatch = useDispatch();
  const sales = useSelector((state) => state.sales?.sales || []);
  const products = useSelector((state) => state.products?.products || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.buyerName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && sale.status === filterStatus;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this sale record? This action cannot be undone.')) {
      try {
        dispatch(deleteSale(id));
        setMessage({ text: 'Sale record deleted successfully!', type: 'success' });
        
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } catch (error) {
        setMessage({ text: 'Error deleting sale record. Please try again.', type: 'error' });
      }
    }
  };

  const handleStatusChange = (id, status) => {
    try {
      dispatch(updateSaleStatus({ id, status }));
      setMessage({ text: 'Sale status updated successfully!', type: 'success' });
      
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      setMessage({ text: 'Error updating sale status. Please try again.', type: 'error' });
    }
  };

  const calculateTotalRevenue = () => {
    return filteredSales.reduce((total, sale) => total + (sale.totalPrice || 0), 0);
  };

  return (
    <div className="container-fluid">
      <h1 className="mb-4">Manage Sales</h1>

      {/* Message Display */}
      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'} mb-4 fade-in`}>
          {message.text}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="custom-card search-section">
        <div className="card-body">
          <div className="row g-4">
            <div className="col-md-8">
              <div className="search-bar">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by product name or buyer name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="filter-select form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Summary */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="summary-card">
            <h5>Total Sales</h5>
            <p className="h3">{filteredSales.length}</p>
          </div>
        </div>
        <div className="col-md-6">
          <div className="summary-card">
            <h5>Total Revenue</h5>
            <p className="h3">₹{calculateTotalRevenue().toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Sales List - Desktop View */}
      <div className="responsive-table d-none d-md-block">
        <table className="table modern-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Product Price</th>
              <th>Buyer Name</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4">No sales records found.</td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="fade-in">
                  <td>{sale.productName}</td>
                  <td><span className="price-tag">₹{sale.productPrice?.toFixed(2)}</span></td>
                  <td>{sale.buyerName}</td>
                  <td>{sale.quantity}</td>
                  <td><span className="price-tag">₹{sale.totalPrice?.toFixed(2)}</span></td>
                  <td>
                    <select
                      className={`form-select status-badge ${sale.status || 'pending'}`}
                      value={sale.status || 'pending'}
                      onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{formatDate(sale.date)}</td>
                  <td>
                    <button
                      className="btn btn-modern btn-danger"
                      onClick={() => handleDelete(sale.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Sales List - Mobile View */}
      <div className="d-md-none">
        {filteredSales.length === 0 ? (
          <div className="alert alert-info fade-in">
            No sales records found.
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div key={sale.id} className="custom-card mobile-card fade-in">
              <div className="card-body">
                <h5 className="card-title">{sale.productName}</h5>
                <p className="card-text">
                  <strong>Price:</strong> <span className="price-tag">₹{sale.productPrice?.toFixed(2)}</span><br />
                  <strong>Buyer:</strong> {sale.buyerName}<br />
                  <strong>Quantity:</strong> {sale.quantity}<br />
                  <strong>Total:</strong> <span className="price-tag">₹{sale.totalPrice?.toFixed(2)}</span><br />
                  <strong>Status:</strong>
                  <select
                    className={`form-select status-badge ${sale.status || 'pending'}`}
                    value={sale.status || 'pending'}
                    onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <strong>Date:</strong> {formatDate(sale.date)}
                </p>
                <button
                  className="btn btn-modern btn-danger w-100"
                  onClick={() => handleDelete(sale.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageSales; 