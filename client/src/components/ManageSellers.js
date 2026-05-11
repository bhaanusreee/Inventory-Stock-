import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addSeller, editSeller, deleteSeller } from '../redux/slices/sellerSlice';
import '../styles/responsive.css';

const ManageSellers = () => {
  const dispatch = useDispatch();
  const sellers = useSelector((state) => state.sellers.sellers);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ text: 'Name is required', type: 'error' });
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage({ text: 'Valid email is required', type: 'error' });
      return false;
    }
    if (!formData.phone.trim() || !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      setMessage({ text: 'Valid phone number is required (min 10 digits)', type: 'error' });
      return false;
    }
    if (!formData.address.trim()) {
      setMessage({ text: 'Address is required', type: 'error' });
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error message when user starts typing
    if (message.type === 'error') {
      setMessage({ text: '', type: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (editingId) {
        dispatch(editSeller({ ...formData, id: editingId }));
        setMessage({ text: 'Seller updated successfully!', type: 'success' });
      } else {
        dispatch(addSeller(formData));
        setMessage({ text: 'Seller added successfully!', type: 'success' });
      }
      
      // Reset form
      setFormData({ name: '', email: '', phone: '', address: '' });
      setEditingId(null);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    }
  };

  const handleEdit = (seller) => {
    setFormData(seller);
    setEditingId(seller.id);
    setMessage({ text: '', type: '' });
    // Scroll to form
    document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this seller? This action cannot be undone.')) {
      try {
        dispatch(deleteSeller(id));
        setMessage({ text: 'Seller deleted successfully!', type: 'success' });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } catch (error) {
        setMessage({ text: 'Error deleting seller. Please try again.', type: 'error' });
      }
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', phone: '', address: '' });
    setEditingId(null);
    setMessage({ text: '', type: '' });
  };

  return (
    <div className="container-fluid">
      <h1 className="mb-4">Manage Sellers</h1>

      {/* Message Display */}
      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'} mb-4`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <div className="card mb-4">
        <form onSubmit={handleSubmit} className="p-3">
          <div className="grid grid-cols-1 grid-cols-2 gap-3">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter seller name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone *</label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Update Seller' : 'Add Seller'}
            </button>
            {(editingId || formData.name || formData.email || formData.phone || formData.address) && (
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Sellers List */}
      <div className="responsive-table d-none d-md-block">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sellers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No sellers found. Add your first seller above!</td>
              </tr>
            ) : (
              sellers.map((seller) => (
                <tr key={seller.id}>
                  <td>{seller.name}</td>
                  <td>{seller.email}</td>
                  <td>{seller.phone}</td>
                  <td>{seller.address}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(seller)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(seller.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View Cards */}
      <div className="d-md-none">
        {sellers.length === 0 ? (
          <div className="alert alert-info">
            No sellers found. Add your first seller above!
          </div>
        ) : (
          sellers.map((seller) => (
            <div key={seller.id} className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{seller.name}</h5>
                <p className="card-text">
                  <strong>Email:</strong> {seller.email}<br />
                  <strong>Phone:</strong> {seller.phone}<br />
                  <strong>Address:</strong> {seller.address}
                </p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEdit(seller)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(seller.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageSellers; 