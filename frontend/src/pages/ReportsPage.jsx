import React, { useState, useEffect } from 'react';
import './ReportsPage.css';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      // If custom dates are provided, use them; otherwise use the date range
      let url = `http://localhost:3001/api/reports/${reportType}`;
      if (customStart && customEnd) {
        url += `?range=custom&start=${customStart}&end=${customEnd}`;
      } else {
        url += `?range=${dateRange}`;
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
    setLoading(false);
  };

  useEffect(() => {
    // Auto-generate report when report type or date range changes
    // Or when both custom dates are filled
    if (customStart && customEnd) {
      generateReport();
    } else if (!customStart && !customEnd) {
      generateReport();
    }
  }, [reportType, dateRange, customStart, customEnd]);

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="reports-page">
      <div className="page-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p className="page-subtitle">Generate and export business reports</p>
        </div>
        <button className="export-btn" onClick={exportToPDF}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export PDF
        </button>
      </div>

      <div className="report-controls">
        <div className="control-group">
          <label>Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="sales">Sales Report</option>
            <option value="inventory">Inventory Report</option>
            <option value="expiry">Expiry Report</option>
            <option value="customer">Customer Report</option>
          </select>
        </div>

        <div className="control-group">
          <label>Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div className="control-group">
          <label>Start Date</label>
          <input 
            type="date" 
            value={customStart} 
            onChange={(e) => setCustomStart(e.target.value)} 
            className="date-input"
          />
        </div>

        <div className="control-group">
          <label>End Date</label>
          <input 
            type="date" 
            value={customEnd} 
            onChange={(e) => setCustomEnd(e.target.value)} 
            className="date-input"
          />
        </div>

        <button className="generate-btn" onClick={generateReport}>
          Generate Report
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating report...</p>
        </div>
      ) : reportData ? (
        <div className="report-content">
          {reportType === 'sales' && <SalesReport data={reportData} range={dateRange} />}
          {reportType === 'inventory' && <InventoryReport data={reportData} />}
          {reportType === 'expiry' && <ExpiryReport data={reportData} />}
          {reportType === 'customer' && <CustomerReport data={reportData} />}
        </div>
      ) : null}
    </div>
  );
}

function SalesReport({ data, range }) {
  return (
    <div className="report-section">
      <h3>Sales Report - {range === 'custom' ? 'Custom Date Range' : range.charAt(0).toUpperCase() + range.slice(1)}</h3>
      
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-label">Total Sales</div>
          <div className="card-value">Rs {data.totalSales?.toLocaleString() || 0}</div>
        </div>
        <div className="summary-card">
          <div className="card-label">Total Orders</div>
          <div className="card-value">{data.totalOrders || 0}</div>
        </div>
        <div className="summary-card">
          <div className="card-label">Average Order</div>
          <div className="card-value">Rs {data.averageOrder?.toLocaleString() || 0}</div>
        </div>
      </div>

      <div className="report-table">
        <h4>Top Selling Products</h4>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.topProducts?.map((product, index) => (
              <tr key={index}>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>Rs {product.revenue?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InventoryReport({ data }) {
  return (
    <div className="report-section">
      <h3>Inventory Report</h3>
      
      <div className="report-content fade-in">
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-label">Total SKUs</div>
          <div className="card-value">{data.totalProducts}</div>
        </div>
        <div className="summary-card">
          <div className="card-label">Inventory Value</div>
          <div className="card-value">Rs {data.totalValue?.toLocaleString()}</div>
        </div>
        <div className="summary-card alert">
          <div className="card-label">Low Stock Items</div>
          <div className="card-value">{data.lowStockCount}</div>
        </div>
      </div>

      <div className="report-table">
        <h4>Low Stock Alert</h4>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>
          List of products currently at or below their reorder level.
        </p>
        {Array.isArray(data.lowStockItems) && data.lowStockItems.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{item.reorderLevel}</td>
                  <td><span className="status-badge critical">Low Stock</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
            ✅ Stock levels are healthy across all products.
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

function ExpiryReport({ data }) {
  return (
    <div className="report-section">
      <h3>Expiry Report</h3>
      
      <div className="summary-cards">
        <div className="summary-card alert">
          <div className="card-label">Expiring Soon (30 days)</div>
          <div className="card-value">{data.expiringSoon || 0}</div>
        </div>
        <div className="summary-card critical">
          <div className="card-label">Expired</div>
          <div className="card-value">{data.expired || 0}</div>
        </div>
      </div>

      <div className="report-table">
        <h4>Products Expiring Soon</h4>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Batch Number</th>
              <th>Expiry Date</th>
              <th>Stock</th>
              <th>Days Left</th>
            </tr>
          </thead>
          <tbody>
            {data.expiringProducts?.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.batchNumber}</td>
                <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                <td>{item.quantity}</td>
                <td>
                  <span className={`days-badge ${item.daysLeft < 30 ? 'critical' : 'warning'}`}>
                    {item.daysLeft} days
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerReport({ data }) {
  return (
    <div className="report-section">
      <h3>Customer Report</h3>
      
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-label">Total Customers</div>
          <div className="card-value">{data.totalCustomers || 0}</div>
        </div>
        <div className="summary-card">
          <div className="card-label">Active Customers</div>
          <div className="card-value">{data.activeCustomers || 0}</div>
        </div>
      </div>

      <div className="report-table">
        <h4>Top Customers</h4>
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Total Purchases</th>
              <th>Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {data.topCustomers?.map((customer, index) => (
              <tr key={index}>
                <td>{customer.fullName}</td>
                <td>Rs {customer.totalPurchases?.toLocaleString() || 0}</td>
                <td>{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : 'Never'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
