import React from 'react';

const PaymentDisplay = ({ amount, orderId, customerName }) => {
  return (
    <div className="payment-display-section" style={{
      padding: '20px',
      border: '2px solid #007bff',
      borderRadius: '8px',
      backgroundColor: '#f8f9fa',
      textAlign: 'center',
      margin: '15px 0'
    }}>
      <h4 style={{color: '#007bff', marginBottom: '15px'}}>
        🏥 MediTrust QR Payment
      </h4>
      
      {/* Large Payment Info Display */}
      <div style={{
        backgroundColor: 'white',
        border: '2px solid #007bff',
        borderRadius: '8px',
        padding: '20px',
        margin: '15px 0'
      }}>
        <div style={{fontSize: '18px', fontWeight: 'bold', color: '#007bff', marginBottom: '15px'}}>
          💰 Payment Details
        </div>
        
        <div style={{fontSize: '16px', lineHeight: '1.8', textAlign: 'left'}}>
          <div><strong>📞 Pay to:</strong> 9702789464</div>
          <div><strong>👤 Name:</strong> Unisha Mahara</div>
          <div><strong>💵 Amount:</strong> <span style={{color: '#28a745', fontSize: '20px', fontWeight: 'bold'}}>Rs. {amount}</span></div>
          <div><strong>📋 Order:</strong> {orderId || `ORD-${Date.now()}`}</div>
          <div><strong>👥 Customer:</strong> {customerName || 'Customer'}</div>
        </div>
      </div>
      
      {/* Step by Step Instructions */}
      <div style={{
        backgroundColor: '#e8f5e8',
        border: '1px solid #28a745',
        borderRadius: '8px',
        padding: '15px',
        margin: '15px 0'
      }}>
        <div style={{fontSize: '16px', fontWeight: 'bold', color: '#28a745', marginBottom: '10px'}}>
          📱 How to Pay:
        </div>
        <div style={{textAlign: 'left', fontSize: '14px', lineHeight: '1.6'}}>
          <div>1. Open your eSewa or FonePay app</div>
          <div>2. Go to "Send Money" or "Transfer"</div>
          <div>3. Enter mobile number: <strong>9702789464</strong></div>
          <div>4. Enter amount: <strong>Rs. {amount}</strong></div>
          <div>5. Confirm payment to <strong>Unisha Mahara</strong></div>
        </div>
      </div>
      
      {/* Quick Copy Section */}
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '10px',
        margin: '10px 0'
      }}>
        <div style={{fontSize: '14px', fontWeight: 'bold', color: '#856404', marginBottom: '5px'}}>
          📋 Quick Copy:
        </div>
        <div style={{
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#007bff'
        }}>
          9702789464
        </div>
      </div>
      
      <div style={{
        fontSize: '11px',
        color: '#999',
        marginTop: '10px',
        fontStyle: 'italic'
      }}>
        MediTrust Pharmacy - Professional Payment System
      </div>
    </div>
  );
};

export default PaymentDisplay;