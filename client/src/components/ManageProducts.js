import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addProduct, editProduct, deleteProduct } from '../redux/slices/productSlice';
import { addSale } from '../redux/slices/salesSlice';
import '../styles/responsive.css';
import '../styles/custom.css';

const ManageProducts = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products?.products || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showSellModal, setShowSellModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    description: ''
  });

  const [sellForm, setSellForm] = useState({
    buyerName: '',
    quantity: 1
  });

  const [editingId, setEditingId] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSellInputChange = (e) => {
    const { name, value } = e.target;
    setSellForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateProductForm = () => {
    if (!productForm.name.trim()) {
      setMessage({ text: 'Product name is required', type: 'error' });
      return false;
    }
    if (!productForm.category.trim()) {
      setMessage({ text: 'Category is required', type: 'error' });
      return false;
    }
    if (!productForm.price || isNaN(productForm.price) || Number(productForm.price) <= 0) {
      setMessage({ text: 'Valid price is required', type: 'error' });
      return false;
    }
    if (!productForm.quantity || isNaN(productForm.quantity) || Number(productForm.quantity) < 0) {
      setMessage({ text: 'Valid quantity is required', type: 'error' });
      return false;
    }
    return true;
  };

  const validateSellForm = () => {
    if (!sellForm.buyerName.trim()) {
      setMessage({ text: 'Buyer name is required', type: 'error' });
      return false;
    }
    if (!sellForm.quantity || isNaN(sellForm.quantity) || Number(sellForm.quantity) <= 0) {
      setMessage({ text: 'Valid quantity is required', type: 'error' });
      return false;
    }
    if (selectedProduct && Number(sellForm.quantity) > selectedProduct.quantity) {
      setMessage({ text: 'Insufficient stock', type: 'error' });
      return false;
    }
    return true;
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    if (!validateProductForm()) return;

    const productData = {
      ...productForm,
      price: Number(productForm.price),
      quantity: Number(productForm.quantity)
    };

    try {
      if (editingId) {
        dispatch(editProduct({ ...productData, id: editingId }));
        setMessage({ text: 'Product updated successfully!', type: 'success' });
      } else {
        dispatch(addProduct(productData));
        setMessage({ text: 'Product added successfully!', type: 'success' });
      }
      
      setProductForm({
        name: '',
        category: '',
        price: '',
        quantity: '',
        description: ''
      });
      setEditingId(null);

      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      setMessage({ text: 'An error occurred. Please try again.', type: 'error' });
    }
  };

  const handleSell = (product) => {
    setSelectedProduct(product);
    setShowSellModal(true);
    setSellForm({
      buyerName: '',
      quantity: 1
    });
    setMessage({ text: '', type: '' });
  };

  const handleSellSubmit = (e) => {
    e.preventDefault();
    
    if (!sellForm.buyerName.trim()) {
      setMessage({ text: 'Buyer name is required', type: 'error' });
      return;
    }

    const quantity = Number(sellForm.quantity);
    if (!quantity || quantity <= 0) {
      setMessage({ text: 'Please enter a valid quantity', type: 'error' });
      return;
    }

    if (quantity > selectedProduct.quantity) {
      setMessage({ text: 'Insufficient stock available', type: 'error' });
      return;
    }

    try {
      // Create the sale
      const saleData = {
        id: Date.now().toString(),
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        buyerName: sellForm.buyerName,
        quantity: quantity,
        productPrice: selectedProduct.price,
        totalPrice: selectedProduct.price * quantity,
        date: new Date().toISOString(),
        status: 'completed'
      };

      // Update product quantity
      const updatedProduct = {
        ...selectedProduct,
        quantity: selectedProduct.quantity - quantity
      };

      // Dispatch both actions
      dispatch(addSale(saleData));
      dispatch(editProduct(updatedProduct));

      // Show success message
      setMessage({ text: 'Sale completed successfully!', type: 'success' });
      
      // Reset form and close modal
      setShowSellModal(false);
      setSelectedProduct(null);
      setSellForm({
        buyerName: '',
        quantity: 1
      });

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      setMessage({ text: 'Error completing sale. Please try again.', type: 'error' });
    }
  };

  const handleEdit = (product) => {
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      description: product.description || ''
    });
    setEditingId(product.id);
    setMessage({ text: '', type: '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        dispatch(deleteProduct(id));
        setMessage({ text: 'Product deleted successfully!', type: 'success' });
        setTimeout(() => {
          setMessage({ text: '', type: '' });
        }, 3000);
      } catch (error) {
        setMessage({ text: 'Error deleting product. Please try again.', type: 'error' });
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid">
      <h1 className="mb-4">Manage Products</h1>

      {/* Message Display */}
      {message.text && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'} mb-4 fade-in`}>
          {message.text}
        </div>
      )}

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <input
            type="text"
            className="form-control"
            placeholder="Search by product name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Add/Edit Product Form */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleProductSubmit} className="product-form">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={productForm.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-select"
                    name="category"
                    value={productForm.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food">Food</option>
                    <option value="Books">Books</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={productForm.price}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    value={productForm.quantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="col-12">
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={productForm.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows="3"
                  />
                </div>
              </div>

              <div className="col-12">
                <div className="form-group d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingId ? 'Update Product' : 'Add Product'}
                  </button>
                  {(editingId || Object.values(productForm).some(val => val)) && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setProductForm({
                          name: '',
                          category: '',
                          price: '',
                          quantity: '',
                          description: ''
                        });
                        setEditingId(null);
                        setMessage({ text: '', type: '' });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>CATEGORY</th>
              <th>PRICE</th>
              <th>QUANTITY</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>₹{product.price.toFixed(2)}</td>
                <td>{product.quantity}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm me-2"
                    onClick={() => handleSell(product)}
                    disabled={product.quantity === 0}
                  >
                    Sell
                  </button>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sell Modal */}
      {showSellModal && selectedProduct && (
        <div className="modal-container">
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Sell {selectedProduct.name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowSellModal(false);
                      setSelectedProduct(null);
                      setSellForm({ buyerName: '', quantity: 1 });
                      setMessage({ text: '', type: '' });
                    }}
                  />
                </div>
                <form onSubmit={handleSellSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Product</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedProduct.name}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Current Stock</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedProduct.quantity}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Buyer Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        name="buyerName"
                        value={sellForm.buyerName}
                        onChange={handleSellInputChange}
                        placeholder="Enter buyer name"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Quantity *</label>
                      <input
                        type="number"
                        className="form-control"
                        name="quantity"
                        value={sellForm.quantity}
                        onChange={handleSellInputChange}
                        min="1"
                        max={selectedProduct.quantity}
                        required
                      />
                      <small className="text-muted">
                        Available: {selectedProduct.quantity}
                      </small>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Unit Price</label>
                      <input
                        type="text"
                        className="form-control"
                        value={`₹${selectedProduct.price.toFixed(2)}`}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Total Amount</label>
                      <input
                        type="text"
                        className="form-control"
                        value={`₹${(selectedProduct.price * sellForm.quantity).toFixed(2)}`}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowSellModal(false);
                        setSelectedProduct(null);
                        setSellForm({ buyerName: '', quantity: 1 });
                        setMessage({ text: '', type: '' });
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={!sellForm.buyerName.trim() || !sellForm.quantity || sellForm.quantity <= 0 || sellForm.quantity > selectedProduct.quantity}
                    >
                      Complete Sale
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .modal-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        .modal {
          position: relative;
          z-index: 1055;
        }
        .product-form .form-group {
          margin-bottom: 1rem;
        }
        .product-form .form-label {
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .product-form .form-control,
        .product-form .form-select {
          padding: 0.5rem 0.75rem;
        }
        .product-form .input-group-text {
          background-color: #f8f9fa;
        }
      `}</style>
    </div>
  );
};

export default ManageProducts;