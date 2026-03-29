import React from 'react';

export default function ReportsSummary({ summary }) {
  return (
    <div className="reports-summary">
      <div className="summary-card">
        <h4>Total Revenue</h4>
        <p className="summary-value">Rs {summary.totalRevenue?.toLocaleString() || 0}</p>
      </div>
      <div className="summary-card">
        <h4>Total Orders</h4>
        <p className="summary-value">{summary.totalOrders || 0}</p>
      </div>
      <div className="summary-card">
        <h4>Products Sold</h4>
        <p className="summary-value">{summary.productsSold || 0}</p>
      </div>
      <div className="summary-card">
        <h4>Average Order</h4>
        <p className="summary-value">Rs {summary.averageOrder?.toLocaleString() || 0}</p>
      </div>
    </div>
  );
}
