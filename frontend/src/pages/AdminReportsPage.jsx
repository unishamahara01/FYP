import React, { useState, useEffect } from 'react';
import './AdminReportsPage.css';

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSystemAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Build query params
      let params = new URLSearchParams();
      if (customStart && customEnd) {
        params.append('range', 'custom');
        params.append('start', customStart);
        params.append('end', customEnd);
      } else {
        params.append('range', dateRange);
      }
      
      // Fetch all report types in parallel for system-wide view
      const [salesRes, inventoryRes, expiryRes, customerRes] = await Promise.all([
        fetch(`http://localhost:3001/api/reports/sales?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://localhost:3001/api/reports/inventory`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://localhost:3001/api/reports/expiry`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`http://localhost:3001/api/reports/customer?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [sales, inventory, expiry, customer] = await Promise.all([
        salesRes.json(),
        inventoryRes.json(),
        expiryRes.json(),
        customerRes.json()
      ]);

      setSystemData({ sales, inventory, expiry, customer });
    } catch (error) {
      console.error('Error fetching system analytics:', error);
      alert('Failed to load analytics data');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (customStart && customEnd) {
      fetchSystemAnalytics();
    } else if (!customStart && !customEnd) {
      fetchSystemAnalytics();
    }
  }, [dateRange, customStart, customEnd]);

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="admin-reports-page">
      <div className="admin-reports-header">
        <div>
          <h2>System Analytics</h2>
          <p className="admin-reports-subtitle">Organization-wide performance metrics and insights</p>
        </div>
        <button className="admin-export-btn" onClick={exportToPDF}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export PDF
        </button>
      </div>

      <div className="admin-report-controls">
        <div className="admin-control-group">
          <label>Time Period</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        <div className="admin-control-group">
          <label>Custom Start</label>
          <input 
            type="date" 
            value={customStart} 
            onChange={(e) => setCustomStart(e.target.value)} 
            className="admin-date-input"
          />
        </div>

        <div className="admin-control-group">
          <label>Custom End</label>
          <input 
            type="date" 
            value={customEnd} 
            onChange={(e) => setCustomEnd(e.target.value)} 
            className="admin-date-input"
          />
        </div>

        <button className="admin-refresh-btn" onClick={fetchSystemAnalytics}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-state">
          <div className="admin-spinner"></div>
          <p>Loading system analytics...</p>
        </div>
      ) : systemData ? (
        <div className="admin-report-content">
          <SystemOverview data={systemData} />
        </div>
      ) : null}
    </div>
  );
}

function SystemOverview({ data }) {
  const { sales, inventory, expiry, customer } = data;

  return (
    <>
      {/* Executive Summary Cards */}
      <div className="admin-executive-summary">
        <div className="admin-summary-card revenue">
          <div className="admin-summary-icon">
            ₹
          </div>
          <div className="admin-summary-content">
            <div className="admin-summary-label">Total Revenue</div>
            <div className="admin-summary-value">Rs {sales?.totalSales?.toLocaleString() || 0}</div>
            <div className="admin-summary-trend positive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              System-wide sales
            </div>
          </div>
        </div>

        <div className="admin-summary-card orders">
          <div className="admin-summary-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <div className="admin-summary-content">
            <div className="admin-summary-label">Total Orders</div>
            <div className="admin-summary-value">{sales?.totalOrders || 0}</div>
            <div className="admin-summary-trend">Across all pharmacies</div>
          </div>
        </div>

        <div className="admin-summary-card inventory">
          <div className="admin-summary-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div className="admin-summary-content">
            <div className="admin-summary-label">Inventory Value</div>
            <div className="admin-summary-value">Rs {inventory?.totalValue?.toLocaleString() || 0}</div>
            <div className="admin-summary-trend">{inventory?.totalProducts || 0} total SKUs</div>
          </div>
        </div>

        <div className="admin-summary-card customers">
          <div className="admin-summary-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="admin-summary-content">
            <div className="admin-summary-label">Total Customers</div>
            <div className="admin-summary-value">{customer?.totalCustomers || 0}</div>
            <div className="admin-summary-trend">{customer?.activeCustomers || 0} active</div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="admin-alert-grid">
        <div className="admin-alert-card warning">
          <div className="admin-alert-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <h3>Low Stock Alert</h3>
          </div>
          <div className="admin-alert-value">{inventory?.lowStockCount || 0}</div>
          <div className="admin-alert-label">Products need reordering</div>
        </div>

        <div className="admin-alert-card critical">
          <div className="admin-alert-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3>Expiry Alert</h3>
          </div>
          <div className="admin-alert-value">{expiry?.expiringSoon || 0}</div>
          <div className="admin-alert-label">Products expiring in 30 days</div>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="admin-report-sections">
        {/* Top Products */}
        <div className="admin-report-section">
          <div className="admin-section-header">
            <h3>Top Performing Products</h3>
            <span className="admin-section-badge">System-wide</span>
          </div>
          <div className="admin-report-table">
            {sales?.topProducts && sales.topProducts.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Product Name</th>
                    <th>Units Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.topProducts.map((product, index) => (
                    <tr key={index}>
                      <td>
                        <div className="admin-rank-badge">#{index + 1}</div>
                      </td>
                      <td className="admin-product-name">{product.name}</td>
                      <td>{product.quantity}</td>
                      <td className="admin-revenue">Rs {product.revenue?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state">No sales data available</div>
            )}
          </div>
        </div>

        {/* Critical Inventory */}
        <div className="admin-report-section">
          <div className="admin-section-header">
            <h3>Critical Inventory Levels</h3>
            <span className="admin-section-badge alert">Requires Attention</span>
          </div>
          <div className="admin-report-table">
            {inventory?.lowStockItems && inventory.lowStockItems.length > 0 ? (
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
                  {inventory.lowStockItems.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td className="admin-product-name">{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.reorderLevel}</td>
                      <td>
                        <span className="admin-status-badge critical">Low Stock</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <p>All inventory levels are healthy</p>
              </div>
            )}
          </div>
        </div>

        {/* Expiring Products */}
        <div className="admin-report-section">
          <div className="admin-section-header">
            <h3>Products Expiring Soon</h3>
            <span className="admin-section-badge warning">Next 30 Days</span>
          </div>
          <div className="admin-report-table">
            {expiry?.expiringProducts && expiry.expiringProducts.length > 0 ? (
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
                  {expiry.expiringProducts.slice(0, 10).map((item, index) => (
                    <tr key={index}>
                      <td className="admin-product-name">{item.name}</td>
                      <td>{item.batchNumber}</td>
                      <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                      <td>{item.quantity}</td>
                      <td>
                        <span className={`admin-days-badge ${item.daysLeft < 15 ? 'critical' : 'warning'}`}>
                          {item.daysLeft} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <p>No products expiring soon</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Customers */}
        <div className="admin-report-section">
          <div className="admin-section-header">
            <h3>Top Customers</h3>
            <span className="admin-section-badge">By Purchase Value</span>
          </div>
          <div className="admin-report-table">
            {customer?.topCustomers && customer.topCustomers.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Customer Name</th>
                    <th>Total Purchases</th>
                    <th>Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.topCustomers.map((cust, index) => (
                    <tr key={index}>
                      <td>
                        <div className="admin-rank-badge">#{index + 1}</div>
                      </td>
                      <td className="admin-customer-name">{cust.fullName}</td>
                      <td className="admin-revenue">Rs {cust.totalPurchases?.toLocaleString() || 0}</td>
                      <td>{cust.lastVisit ? new Date(cust.lastVisit).toLocaleDateString() : 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="admin-empty-state">No customer data available</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
