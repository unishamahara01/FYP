import React, { useState, useEffect } from 'react';
import './CustomersPage.css';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: { city: '' },
    gender: 'Male',
    dateOfBirth: '',
    allergies: '',
    chronicConditions: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3001/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCustomers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const customerData = {
      ...formData
    };

    try {
      const token = localStorage.getItem('authToken');
      const url = editingCustomer 
        ? `http://localhost:3001/api/customers/${editingCustomer._id}`
        : 'http://localhost:3001/api/customers';
      
      const res = await fetch(url, {
        method: editingCustomer ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(customerData)
      });

      if (res.ok) {
        alert(editingCustomer ? 'Customer updated successfully!' : 'Customer added successfully!');
        setShowModal(false);
        setEditingCustomer(null);
        resetForm();
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      fullName: customer.fullName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: { city: customer.address?.city || '' },
      gender: customer.gender || 'Male',
      dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.split('T')[0] : '',
      allergies: customer.allergies || '',
      chronicConditions: customer.chronicConditions || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:3001/api/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        alert('Customer deleted successfully!');
        fetchCustomers();
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: { city: '' },
      gender: 'Male',
      dateOfBirth: '',
      allergies: '',
      chronicConditions: ''
    });
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h2>Customers Management</h2>
          <p className="page-subtitle">Manage customer information and records</p>
        </div>
        <button className="add-btn" onClick={handleAddNew}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Customer
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading customers...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Gender</th>
                <th>Allergies</th>
                <th>Last Visit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{textAlign: 'center', padding: '40px'}}>
                    No customers found. Click "Add Customer" to get started.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer._id}>
                    <td><strong>{customer.fullName}</strong></td>
                    <td>{customer.phone}</td>
                    <td>{customer.email || 'N/A'}</td>
                    <td>{customer.address?.city || 'N/A'}</td>
                    <td>{customer.gender}</td>
                    <td>{customer.allergies || 'None'}</td>
                    <td>{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="edit-btn" onClick={() => handleEdit(customer)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(customer._id)}>Delete</button>
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
              <h3>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
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
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  />
                </div>
              </div>

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
                <label>Allergies</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Type allergies or select from dropdown"
                    value={formData.allergies}
                    onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                    style={{ flex: 1 }}
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const current = formData.allergies ? formData.allergies + ', ' : '';
                        setFormData({...formData, allergies: current + e.target.value});
                        e.target.value = '';
                      }
                    }}
                    style={{ width: '150px' }}
                  >
                    <option value="">Quick Select</option>
                    <option value="Penicillin">Penicillin</option>
                    <option value="Aspirin">Aspirin</option>
                    <option value="Ibuprofen">Ibuprofen</option>
                    <option value="Sulfa drugs">Sulfa drugs</option>
                    <option value="Codeine">Codeine</option>
                    <option value="Morphine">Morphine</option>
                    <option value="Latex">Latex</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Chronic Conditions</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Type conditions or select from dropdown"
                    value={formData.chronicConditions}
                    onChange={(e) => setFormData({...formData, chronicConditions: e.target.value})}
                    style={{ flex: 1 }}
                  />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const current = formData.chronicConditions ? formData.chronicConditions + ', ' : '';
                        setFormData({...formData, chronicConditions: current + e.target.value});
                        e.target.value = '';
                      }
                    }}
                    style={{ width: '150px' }}
                  >
                    <option value="">Quick Select</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Hypertension">Hypertension</option>
                    <option value="Asthma">Asthma</option>
                    <option value="Heart Disease">Heart Disease</option>
                    <option value="Arthritis">Arthritis</option>
                    <option value="Kidney Disease">Kidney Disease</option>
                    <option value="Liver Disease">Liver Disease</option>
                    <option value="Thyroid Disorder">Thyroid Disorder</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
