import React from 'react';

export default function TopProducts({ topProducts }) {
  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Top Selling Products</h3>
        <p className="card-subtitle">Best performing items based on actual sales</p>
      </div>
      <div className="top-products-list">
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <div key={product._id} className="top-product-item">
              <div className="product-rank">{index + 1}</div>
              <div className="product-info">
                <span className="product-name-top">{product.productName}</span>
                <span className="product-sales">{product.unitsSold} units sold</span>
              </div>
              <div className="product-revenue">Rs {product.revenue.toLocaleString()}</div>
            </div>
          ))
        ) : (
          <div style={{padding: '20px', textAlign: 'center', color: '#64748b'}}>
            No sales data yet. Create orders to see top products!
          </div>
        )}
      </div>
    </div>
  );
}
