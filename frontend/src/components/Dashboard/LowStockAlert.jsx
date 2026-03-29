import React from 'react';

export default function LowStockAlert({ lowStockItems, sendingAlert, onSendAlert }) {
  if (!lowStockItems || lowStockItems.items.length === 0) {
    return null;
  }

  return (
    <div className="dashboard-card low-stock-alert-card">
      <div className="card-header">
        <h3>⚠️ Low Stock Alert</h3>
        <p className="card-subtitle">{lowStockItems.items.length} items need attention</p>
      </div>
      <div className="low-stock-items">
        {lowStockItems.items.slice(0, 5).map((item) => (
          <div key={item._id} className="low-stock-item">
            <div className="item-info">
              <span className="item-name">{item.name}</span>
              <span className="item-stock">Stock: {item.quantity} / {item.reorderThreshold}</span>
            </div>
            <div className="item-status">
              <span className="status-badge critical">Low</span>
            </div>
          </div>
        ))}
      </div>
      <button 
        className="btn-send-alert" 
        onClick={onSendAlert}
        disabled={sendingAlert}
      >
        {sendingAlert ? 'Sending...' : '📧 Send Email Alert'}
      </button>
    </div>
  );
}
