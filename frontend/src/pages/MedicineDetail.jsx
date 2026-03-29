import React, { useState, useEffect } from 'react';

const MedicineDetail = ({ medicineId, onClose }) => {
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (medicineId) {
      fetchMedicineDetails();
    }
  }, [medicineId]);

  const fetchMedicineDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/products/${medicineId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMedicine(data);
      }
    } catch (error) {
      console.error('Error fetching medicine details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading medicine details...
      </div>
    );
  }

  if (!medicine) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Medicine not found
      </div>
    );
  }

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { status: 'Expired', color: '#dc3545', days: Math.abs(daysUntilExpiry) };
    if (daysUntilExpiry <= 30) return { status: 'Expiring Soon', color: '#ffc107', days: daysUntilExpiry };
    if (daysUntilExpiry <= 90) return { status: 'Monitor', color: '#fd7e14', days: daysUntilExpiry };
    return { status: 'Good', color: '#28a745', days: daysUntilExpiry };
  };

  const expiryInfo = getExpiryStatus(medicine.expiryDate);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '20px',
        borderRadius: '12px 12px 0 0',
        textAlign: 'center'
      }}>
        <h1 style={{margin: '0 0 10px 0', fontSize: '28px'}}>
          🏥 MediTrust Pharmacy
        </h1>
        <p style={{margin: 0, fontSize: '16px', opacity: 0.9}}>
          Medicine Information System
        </p>
      </div>

      {/* Medicine Details */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '0 0 12px 12px',
        padding: '30px'
      }}>
        {/* Medicine Name */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #f8f9fa'
        }}>
          <h2 style={{
            color: '#007bff',
            fontSize: '32px',
            margin: '0 0 10px 0'
          }}>
            {medicine.name}
          </h2>
          <p style={{
            color: '#666',
            fontSize: '18px',
            margin: 0
          }}>
            {medicine.genericName}
          </p>
        </div>

        {/* Medicine Information Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Price & Stock */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{color: '#495057', marginBottom: '15px', fontSize: '18px'}}>
              💰 Pricing & Stock
            </h3>
            <div style={{fontSize: '16px', lineHeight: '1.8'}}>
              <div><strong>Price:</strong> <span style={{color: '#28a745', fontSize: '20px'}}>Rs. {(parseFloat(medicine.price) || 0).toFixed(2)}</span></div>
              <div><strong>Stock:</strong> <span style={{color: medicine.quantity > 10 ? '#28a745' : '#dc3545'}}>{medicine.quantity} units</span></div>
              <div><strong>Category:</strong> {medicine.category}</div>
            </div>
          </div>

          {/* Expiry Information */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{color: '#495057', marginBottom: '15px', fontSize: '18px'}}>
              📅 Expiry Information
            </h3>
            <div style={{fontSize: '16px', lineHeight: '1.8'}}>
              <div><strong>Expiry Date:</strong> {medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'}</div>
              <div><strong>Manufacture Date:</strong> {medicine.manufactureDate ? new Date(medicine.manufactureDate).toLocaleDateString() : 'N/A'}</div>
              <div>
                <strong>Status:</strong> 
                <span style={{
                  color: expiryInfo.color,
                  fontWeight: 'bold',
                  marginLeft: '5px'
                }}>
                  {expiryInfo.status}
                </span>
              </div>
              <div><strong>Days Remaining:</strong> {expiryInfo.days} days</div>
            </div>
          </div>

          {/* Manufacturer Info */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{color: '#495057', marginBottom: '15px', fontSize: '18px'}}>
              🏭 Manufacturer Details
            </h3>
            <div style={{fontSize: '16px', lineHeight: '1.8'}}>
              <div><strong>Company:</strong> {medicine.manufacturer}</div>
              <div><strong>Batch Number:</strong> {medicine.batchNumber}</div>
              <div><strong>Medicine ID:</strong> {medicine._id}</div>
            </div>
          </div>

          {/* QR Code Info */}
          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #2196f3'
          }}>
            <h3 style={{color: '#1976d2', marginBottom: '15px', fontSize: '18px'}}>
              📱 QR Code Access
            </h3>
            <div style={{fontSize: '14px', lineHeight: '1.6', color: '#333'}}>
              <div>✅ <strong>Scanned Successfully!</strong></div>
              <div>📱 QR Code URL: <code style={{fontSize: '12px'}}>medicine/{medicine._id}</code></div>
              <div>🕒 Accessed: {new Date().toLocaleString()}</div>
              <div>🏥 Source: MediTrust Pharmacy</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '15px',
          marginTop: '30px'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            🖨️ Print Details
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        color: '#666'
      }}>
        <p style={{margin: 0, fontSize: '14px'}}>
          🏥 <strong>MediTrust Pharmacy Management System</strong><br/>
          Advanced Medicine Information & QR Code Technology<br/>
          📍 Kathmandu, Nepal | 📞 +977-1-4123456
        </p>
      </div>
    </div>
  );
};

export default MedicineDetail;