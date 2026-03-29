import React from 'react';

export default function OrderList({ orders, loading }) {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
        <p>No orders found. Create your first order!</p>
      </div>
    );
  }

  return (
    <div className="orders-list">
      {orders.map((order) => (
        <div key={order._id} className="order-card">
          <div className="order-header">
            <div>
              <h4>Order #{order._id.slice(-6)}</h4>
              <p className="order-date">
                {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="order-total">
              <span className="total-label">Total</span>
              <span className="total-amount">Rs {order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          <div className="order-details">
            <p><strong>Customer:</strong> {order.customerName}</p>
            <p><strong>Payment:</strong> {order.paymentMethod}</p>
            <p><strong>Items:</strong> {order.items?.length || 0}</p>
          </div>

          <div className="order-items">
            {order.items?.map((item, idx) => (
              <div key={idx} className="order-item">
                <span className="item-name">{item.productName}</span>
                <span className="item-qty">×{item.quantity}</span>
                <span className="item-price">Rs {item.price?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
