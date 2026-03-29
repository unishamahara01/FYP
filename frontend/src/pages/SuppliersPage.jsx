import React, { useState, useEffect } from 'react';
import './SuppliersPage.css';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: { city: '', country: 'Nepal' },
    productsSupplied: '',
    rating: 5,
    status: 'Active'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3001/api/suppliers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const supplierData = {
      ...formData,
      productsSupplied: formData.productsSupplied ? formData.productsSupplied.split(',').map(p => p.trim()) : []
    };

    try {
      const token = localStorage.getItem('authToken');
      const url = editingSupplier 
        ? `http://localhost:3001/api/suppliers/${editingSupplier._id}`
        : 'http://localhost:3001/api/suppliers';
      
      const res = await fetch(url, {
        method: editingSupplier ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(supplierData)
      });

      if (res.ok) {
        alert(editingSupplier ? 'Supplier updated successfully!' : 'Supplier added successfully!');
        setShowModal(false);
        setEditingSupplier(null);
        resetForm();
        fetchSuppliers();
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      company: supplier.company || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: { 
        city: supplier.address?.city || '', 
        country: supplier.address?.country || 'Nepal' 
      },
      productsSupplied: supplier.productsSupplied ? supplier.productsSupplied.join(', ') : '',
      rating: supplier.rating || 5,
      status: supplier.status || 'Active'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:3001/api/suppliers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert('Supplier deleted successfully!');
        fetchSuppliers();
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Failed to delete supplier');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: { city: '', country: 'Nepal' },
      productsSupplied: '',
      rating: 5,
      status: 'Active'
    });
  };

  const handleAddNew = () => {
    setEditingSupplier(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="suppliers-page">
      <div className="page-header">
        <div>
          <h2>Suppliers Management</h2>
          <p className="page-subtitle">Manage supplier information and relationships</p>
        </div>
        <button className="add-btn" onClick={handleAddNew}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Supplier
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading suppliers...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Rating</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{textAlign: 'center', padding: '40px'}}>
                    No suppliers found. Click "Add Supplier" to get started.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td><strong>{supplier.name}</strong></td>
                    <td>{supplier.company}</td>
                    <td>{supplier.phone}</td>
                    <td>{supplier.email}</td>
                    <td>{supplier.address?.city || 'N/A'}</td>
                    <td>
                      <div className="rating">
                        {'★'.repeat(supplier.rating)}{'☆'.repeat(5 - supplier.rating)}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${supplier.status.toLowerCase()}`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEdit(supplier)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(supplier._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    placeholder="e.g., Kathmandu, Pokhara, Lalitpur"
                    value={formData.address.city}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={formData.address.country}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, country: e.target.value}})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Products Supplied (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Paracetamol, Antibiotics, Vitamins"
                  value={formData.productsSupplied}
                  onChange={(e) => setFormData({...formData, productsSupplied: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rating (1-5)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Below Average</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
