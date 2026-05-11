import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addPurchase, editPurchase, deletePurchase } from '../redux/slices/purchaseSlice';
import { fetchProducts } from '../redux/slices/productSlice';
import '../styles/responsive.css';

const ManagePurchases = () => {
  const dispatch = useDispatch();
  const purchases = useSelector((state) => state.purchases?.purchases || []);
  const products = useSelector((state) => state.products?.products || []);
  const loading = useSelector((state) => state.products?.loading || false);
  
  const [formData, setFormData] = useState({
    productId: '',
    productName: '',
    quantity: '',
    unitPrice: '',
    supplierName: '',
    invoiceNumber: '',
    paymentStatus: 'pending',
    notes: ''
  });
  
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch products when component mounts
  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Debug log for products
  useEffect(() => {
    console.log('Available products:', products);
  }, [products]);

  // Handle product selection
  const handleProductSelect = (e) => {
    const selectedId = e.target.value;
    console.log('Selected product ID:', selectedId);
    console.log('Available products:', products);
    
    if (!selectedId) {
      setFormData(prev => ({
        ...prev,
        productId: '',
        productName: '',
        unitPrice: ''
      }));
      return;
    }

    const selectedProduct = products.find(p => p.id === selectedId);
    console.log('Found product:', selectedProduct);
    
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        productId: selectedId,
        productName: selectedProduct.name,
        unitPrice: selectedProduct.price ? selectedProduct.price.toString() : '0'
      }));
    }
  };

  // Handle regular input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for numeric inputs
    if (name === 'quantity' || name === 'unitPrice') {
      const numValue = value === '' ? '' : Number(value);
      if (numValue === '' || (!isNaN(numValue) && numValue >= 0)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any error messages when user types
    if (message.type === 'error') {
      setMessage({ text: '', type: '' });
    }
  };

  // Form validation
  const validateForm = () => {
    if (!formData.productId || !formData.productName) {
      setMessage({ text: 'Please select a product', type: 'error' });
      return false;
    }
    if (!formData.supplierName.trim()) {
      setMessage({ text: 'Please enter supplier name', type: 'error' });
      return false;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setMessage({ text: 'Please enter a valid quantity', type: 'error' });
      return false;
    }
    if (!formData.unitPrice || Number(formData.unitPrice) <= 0) {
      setMessage({ text: 'Please enter a valid unit price', type: 'error' });
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    
    if (!validateForm()) {
      return;
    }

    const purchaseData = {
      ...formData,
      id: editingId || Date.now().toString(),
      date: new Date().toISOString(),
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      totalAmount: Number(formData.quantity) * Number(formData.unitPrice)
    };

    try {
      if (editingId) {
        dispatch(editPurchase(purchaseData));
        setMessage({ text: 'Purchase updated successfully!', type: 'success' });
      } else {
        dispatch(addPurchase(purchaseData));
        setMessage({ text: 'Purchase added successfully!', type: 'success' });
      }

      // Reset form
      handleReset();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error handling purchase:', error);
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    }
  };

  // Handle editing existing purchase
  const handleEdit = (purchase) => {
    console.log('Editing purchase:', purchase);
    setFormData({
      productId: purchase.productId,
      productName: purchase.productName,
      quantity: purchase.quantity.toString(),
      unitPrice: purchase.unitPrice.toString(),
      supplierName: purchase.supplierName,
      invoiceNumber: purchase.invoiceNumber || '',
      paymentStatus: purchase.paymentStatus || 'pending',
      notes: purchase.notes || ''
    });
    setEditingId(purchase.id);
    setMessage({ text: '', type: '' });
    // Scroll to form
    document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
  };

  // Handle deleting purchase
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        dispatch(deletePurchase(id));
        setMessage({ text: 'Purchase deleted successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } catch (error) {
        console.error('Error deleting purchase:', error);
        setMessage({ text: 'Error deleting purchase', type: 'error' });
      }
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      productId: '',
      productName: '',
      quantity: '',
      unitPrice: '',
      supplierName: '',
      invoiceNumber: '',
      paymentStatus: 'pending',
      notes: ''
    });
    setEditingId(null);
    setMessage({ text: '', type: '' });
  };

  // Filter purchases for search
  const filteredPurchases = purchases.filter(purchase =>
    purchase.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    purchase.supplierName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    purchase.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Manage Purchases</h2>

      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'} mb-4`}>
          {message.text}
        </div>
      )}

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="needs-validation" noValidate>
            <div className="row g-4">
              {/* Product Selection */}
              <div className="col-md-6">
                <label htmlFor="productId" className="form-label fw-bold">Select Product *</label>
                <select
                  id="productId"
                  name="productId"
                  className="form-select form-select-lg"
                  value={formData.productId}
                  onChange={handleProductSelect}
                  required
                  disabled={loading}
                >
                  <option value="">Choose a product...</option>
                  {products && products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₹{product.price?.toFixed(2)} (Stock: {product.quantity})
                    </option>
                  ))}
                </select>
                <div className="form-text">
                  {loading ? 'Loading products...' : 'Select a product from your inventory'}
                </div>
              </div>

              {/* Supplier Name */}
              <div className="col-md-6">
                <label htmlFor="supplierName" className="form-label fw-bold">Supplier Name *</label>
                <input
                  type="text"
                  id="supplierName"
                  name="supplierName"
                  className="form-control form-control-lg"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  required
                  minLength="2"
                />
                <div className="form-text">Enter the name of your supplier</div>
              </div>

              {/* Quantity */}
              <div className="col-md-4">
                <label htmlFor="quantity" className="form-label fw-bold">Quantity *</label>
                <div className="input-group">
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className="form-control form-control-lg"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    step="1"
                    placeholder="0"
                    required
                  />
                  <span className="input-group-text">units</span>
                </div>
                <div className="form-text">Enter the quantity of items purchased</div>
              </div>

              {/* Unit Price */}
              <div className="col-md-4">
                <label htmlFor="unitPrice" className="form-label fw-bold">Unit Price (₹) *</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    id="unitPrice"
                    name="unitPrice"
                    className="form-control form-control-lg"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-text">Enter the price per unit</div>
              </div>

              {/* Invoice Number */}
              <div className="col-md-4">
                <label htmlFor="invoiceNumber" className="form-label fw-bold">Invoice Number</label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  className="form-control form-control-lg"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  placeholder="Enter invoice number"
                />
                <div className="form-text">Optional: Enter the invoice number</div>
              </div>

              {/* Payment Status */}
              <div className="col-md-6">
                <label htmlFor="paymentStatus" className="form-label fw-bold">Payment Status</label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  className="form-select form-select-lg"
                  value={formData.paymentStatus}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="form-text">Select the payment status</div>
              </div>

              {/* Notes */}
              <div className="col-12">
                <label htmlFor="notes" className="form-label fw-bold">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-control"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter any additional notes about this purchase..."
                />
                <div className="form-text">Optional: Add any relevant notes</div>
              </div>

              {/* Total Amount Preview */}
              <div className="col-12">
                <div className="alert alert-info">
                  <strong>Total Amount:</strong> ₹{(Number(formData.quantity) * Number(formData.unitPrice)).toFixed(2)}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="col-12">
                <div className="d-flex gap-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg px-4"
                  >
                    {editingId ? 'Update Purchase' : 'Add Purchase'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary btn-lg px-4"
                    onClick={handleReset}
                  >
                    Reset Form
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control"
            placeholder="Search purchases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Purchases Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Supplier</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">No purchases found</td>
                  </tr>
                ) : (
                  filteredPurchases.map(purchase => (
                    <tr key={purchase.id}>
                      <td>{purchase.productName}</td>
                      <td>{purchase.supplierName}</td>
                      <td>{purchase.quantity}</td>
                      <td>₹{purchase.unitPrice.toFixed(2)}</td>
                      <td>₹{purchase.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className={`badge bg-${
                          purchase.paymentStatus === 'paid' ? 'success' :
                          purchase.paymentStatus === 'pending' ? 'warning' : 'danger'
                        }`}>
                          {purchase.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(purchase.date).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEdit(purchase)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(purchase.id)}
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
        </div>
      </div>
    </div>
  );
};

export default ManagePurchases;