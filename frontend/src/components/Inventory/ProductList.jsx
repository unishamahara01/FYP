import React from 'react';

export default function ProductList({ products, onViewQR, onDelete, loading }) {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
        <p>No products found. Add your first product!</p>
      </div>
    );
  }

  // Helper function to check if product is expired
  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  // Helper function to get days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="products-grid">
      {products.map((product) => {
        const expired = isExpired(product.expiryDate);
        const daysLeft = getDaysUntilExpiry(product.expiryDate);
        
        return (
          <div 
            key={product._id} 
            className={`product-card ${expired ? 'expired-product' : ''}`}
            style={expired ? { border: '2px solid #ef4444', backgroundColor: '#fef2f2' } : {}}
          >
            <div className="product-header">
              <h4>{product.name}</h4>
              <span className={`status-badge ${product.status?.toLowerCase().replace(' ', '-')}`}>
                {product.status}
              </span>
            </div>
            <div className="product-details">
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Batch:</strong> {product.batchNumber}</p>
              <p><strong>Stock:</strong> {product.quantity} units</p>
              <p><strong>Price:</strong> Rs {product.price}</p>
              <p>
                <strong>Expiry:</strong> {new Date(product.expiryDate).toLocaleDateString()}
                {expired ? (
                  <span style={{ 
                    marginLeft: '8px', 
                    color: '#ef4444', 
                    fontWeight: 'bold',
                    backgroundColor: '#fee2e2',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    ⚠️ EXPIRED ({Math.abs(daysLeft)} days ago)
                  </span>
                ) : daysLeft <= 30 ? (
                  <span style={{ 
                    marginLeft: '8px', 
                    color: '#f59e0b', 
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    ({daysLeft} days left)
                  </span>
                ) : null}
              </p>
            </div>
            <div className="product-actions">
              <button className="btn-view-qr" onClick={() => onViewQR(product)}>
                View QR
              </button>
              {onDelete && (
                <button className="btn-delete" onClick={() => onDelete(product._id)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
