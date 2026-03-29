import React from 'react';

export default function PharmacyManagement({ pharmacies, onEdit, onDelete, onAdd, loading }) {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading pharmacies...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Pharmacy Management</h2>
        <button className="btn-primary" onClick={onAdd}>
          + Add Pharmacy
        </button>
      </div>

      <div className="pharmacies-grid">
        {pharmacies.map((pharmacy) => (
          <div key={pharmacy._id} className="pharmacy-card">
            <div className="pharmacy-header">
              <h3>{pharmacy.name}</h3>
              <span className={`status-badge ${pharmacy.status?.toLowerCase()}`}>
                {pharmacy.status}
              </span>
            </div>
            <div className="pharmacy-details">
              <p><strong>License:</strong> {pharmacy.licenseNumber}</p>
              <p><strong>Phone:</strong> {pharmacy.phone}</p>
              <p><strong>Email:</strong> {pharmacy.email}</p>
              <p><strong>Address:</strong> {pharmacy.address?.street}, {pharmacy.address?.city}</p>
            </div>
            <div className="pharmacy-actions">
              <button className="btn-secondary" onClick={() => onEdit(pharmacy)}>
                Edit
              </button>
              <button className="btn-danger" onClick={() => onDelete(pharmacy._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
