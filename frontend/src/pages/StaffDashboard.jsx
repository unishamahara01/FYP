import React, { useState, useEffect } from "react";
import "./StaffDashboard.css";
import UserProfileDropdown from "../components/UserProfileDropdown";
import AIChatbot from "../components/AIChatbot";

export default function StaffDashboard({ onLogout, onAccountSettings }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
    fetchProducts(); // Fetch products on mount for Total SKUs count
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'activity') {
      fetchRecentActivity();
    } else if (activeTab === 'lowstock') {
      fetchLowStockProducts();
    } else if (activeTab === 'expiring') {
      fetchExpiringProducts();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch today's stats
      const salesRes = await fetch('http://localhost:3001/api/reports/sales?range=today', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const inventoryRes = await fetch('http://localhost:3001/api/reports/inventory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const expiryRes = await fetch('http://localhost:3001/api/reports/expiry', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const [sales, inventory, expiry] = await Promise.all([
        salesRes.json(),
        inventoryRes.json(),
        expiryRes.json()
      ]);

      setStats({
        todaySales: sales.totalSales || 0,
        todayOrders: sales.totalOrders || 0,
        lowStock: inventory.lowStockCount || 0,
        expiringSoon: expiry.expiringSoon || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setLoading(false);
  };

  const fetchRecentActivity = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/orders?limit=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRecentSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
    setLoading(false);
  };

  const fetchLowStockProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const lowStock = Array.isArray(data) ? data.filter(p => p.quantity <= p.reorderLevel) : [];
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
    }
    setLoading(false);
  };

  const fetchExpiringProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const expiring = Array.isArray(data) ? data.filter(p => {
        if (!p.expiryDate) return false;
        const expiryDate = new Date(p.expiryDate);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= now;
      }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate)) : [];
      
      setExpiringProducts(expiring);
    } catch (error) {
      console.error('Error fetching expiring products:', error);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="staff-dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span className="logo-text">MediTrust</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span className="nav-text">Overview</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
            <span className="nav-text">Products</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span className="nav-text">Activity</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'lowstock' ? 'active' : ''}`}
            onClick={() => setActiveTab('lowstock')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="nav-text">Low Stock</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'expiring' ? 'active' : ''}`}
            onClick={() => setActiveTab('expiring')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            <span className="nav-text">Expiring Soon</span>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="user-profile-sidebar">
            <div className="user-avatar-sidebar">
              {(currentUser.fullName || 'S').charAt(0).toUpperCase()}
            </div>
            <div className="user-info-sidebar">
              <div className="user-name-sidebar">{currentUser.fullName || 'Staff'}</div>
              <div className="user-role-sidebar">{currentUser.role || 'Staff'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* HEADER */}
        <header className="dashboard-header">
          <div className="header-left">
            <div className="breadcrumb">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-text">MediTrust</span>
            </div>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <button className="header-btn" onClick={() => setShowSearchBar(!showSearchBar)} title="Search Products">
                <svg className="header-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
              <button className="header-btn" onClick={() => setShowNotifications(!showNotifications)} title="View Alerts">
                <svg className="header-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {((stats?.lowStock || 0) + (stats?.expiringSoon || 0)) > 0 && (
                  <span className="notification-badge">{(stats?.lowStock || 0) + (stats?.expiringSoon || 0)}</span>
                )}
              </button>
              <UserProfileDropdown user={currentUser} onLogout={onLogout} onAccountSettings={onAccountSettings} />
            </div>

            {/* Search Dropdown */}
            {showSearchBar && (
              <div className="header-dropdown search-dropdown">
                <div className="dropdown-header">
                  <h3>Search Products</h3>
                  <button className="close-dropdown" onClick={() => setShowSearchBar(false)}>×</button>
                </div>
                <div className="search-input-container">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search by product name or batch number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                {searchQuery && (
                  <div className="search-results">
                    {products.filter(p => 
                      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).slice(0, 5).map(product => (
                      <div key={product._id} className="search-result-item" onClick={() => {
                        setActiveTab('products');
                        setShowSearchBar(false);
                      }}>
                        <div className="result-name">{product.name}</div>
                        <div className="result-details">
                          <span>Stock: {product.quantity}</span>
                          <span>Rs {product.price?.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    {products.filter(p => 
                      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="no-results">No products found</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="header-dropdown notifications-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <button className="close-dropdown" onClick={() => setShowNotifications(false)}>×</button>
                </div>
                <div className="notifications-list">
                  {stats?.lowStock > 0 && (
                    <div className="notification-item warning" onClick={() => {
                      setActiveTab('lowstock');
                      setShowNotifications(false);
                    }}>
                      <div className="notification-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">Low Stock Alert</div>
                        <div className="notification-text">{stats.lowStock} items need reordering</div>
                      </div>
                    </div>
                  )}
                  {stats?.expiringSoon > 0 && (
                    <div className="notification-item danger" onClick={() => {
                      setActiveTab('expiring');
                      setShowNotifications(false);
                    }}>
                      <div className="notification-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12,6 12,12 16,14"/>
                        </svg>
                      </div>
                      <div className="notification-content">
                        <div className="notification-title">Expiring Soon</div>
                        <div className="notification-text">{stats.expiringSoon} items expiring within 30 days</div>
                      </div>
                    </div>
                  )}
                  {(!stats?.lowStock && !stats?.expiringSoon) && (
                    <div className="no-notifications">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <p>No alerts at this time</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <>
              {/* STATS CARDS */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Total SKUs</span>
                    <div className="stat-icon blue">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                        <line x1="7" y1="7" x2="7.01" y2="7"/>
                      </svg>
                    </div>
                  </div>
                  <div className="stat-value">{products.length.toLocaleString()}</div>
                  <div className="stat-change positive">Products in inventory</div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Expiring Items</span>
                    <div className="stat-icon orange">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                    </div>
                  </div>
                  <div className="stat-value">{stats?.expiringSoon || 0}</div>
                  <div className="stat-change neutral">Within 90 days</div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Low Stock Items</span>
                    <div className="stat-icon red">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                    </div>
                  </div>
                  <div className="stat-value">{stats?.lowStock || 0}</div>
                  <div className="stat-change neutral">Need reorder</div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-title">Today's Sales</span>
                    <div className="stat-icon green">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 3h12"/>
                        <path d="M6 8h12"/>
                        <path d="M6 8c0 4.418 0 8 6 8s6-3.582 6-8"/>
                        <path d="M12 8v8"/>
                        <path d="M8 16h8"/>
                      </svg>
                    </div>
                  </div>
                  <div className="stat-value">Rs {(stats?.todaySales || 0).toLocaleString()}</div>
                  <div className="stat-change positive">From database</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-section">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                  <button className="quick-action-card" onClick={() => setActiveTab('products')}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <span>Search Products</span>
                  </button>

                  <button className="quick-action-card" onClick={() => setActiveTab('activity')}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    <span>View Activity</span>
                  </button>

                  <button className="quick-action-card" onClick={() => setActiveTab('lowstock')}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span>Low Stock Alert</span>
                  </button>

                  <button className="quick-action-card" onClick={() => setActiveTab('expiring')}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span>Expiring Products</span>
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="info-box">
                <div className="info-box-header">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  <h3>Your Permissions</h3>
                </div>
                <div className="permissions-list">
                  <div className="permission-item allowed">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    <span>View all products and inventory</span>
                  </div>
                  <div className="permission-item allowed">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    <span>View sales and order history</span>
                  </div>
                  <div className="permission-item denied">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <span>Cannot edit or delete records</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <div className="products-section">
              <div className="section-header">
                <h2>Product Inventory</h2>
                <div className="search-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search products by name or batch number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading products...</p>
                </div>
              ) : (
                <div className="products-table-container">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Batch Number</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Expiry Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="no-data">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                              <circle cx="11" cy="11" r="8"/>
                              <path d="M21 21l-4.35-4.35"/>
                            </svg>
                            <p>No products found</p>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map(product => (
                          <tr key={product._id}>
                            <td className="product-name">{product.name}</td>
                            <td>{product.batchNumber || 'N/A'}</td>
                            <td>
                              <span className={`stock-badge ${product.quantity <= product.reorderLevel ? 'low' : 'normal'}`}>
                                {product.quantity}
                              </span>
                            </td>
                            <td className="price">Rs {product.price?.toLocaleString()}</td>
                            <td>{product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}</td>
                            <td>
                              {product.quantity <= product.reorderLevel ? (
                                <span className="status-badge warning">Low Stock</span>
                              ) : (
                                <span className="status-badge success">In Stock</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="activity-section">
              <div className="section-header">
                <h2>Recent Activity</h2>
                <p className="section-subtitle">Latest sales and transactions</p>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading activity...</p>
                </div>
              ) : (
                <div className="activity-list">
                  {recentSales.length === 0 ? (
                    <div className="no-data">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                      <p>No recent activity</p>
                    </div>
                  ) : (
                    recentSales.map((order, index) => (
                      <div key={order._id || index} className="activity-item">
                        <div className="activity-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                          </svg>
                        </div>
                        <div className="activity-content">
                          <div className="activity-title">
                            {order.orderNumber || `Order #${index + 1}`}
                            {order.customerName && <span className="activity-customer"> • {order.customerName}</span>}
                          </div>
                          <div className="activity-details">
                            <span className="activity-items">{order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}</span>
                            <span className="activity-amount">Rs {order.totalAmount?.toLocaleString() || 0}</span>
                            {order.paymentMethod && <span className="activity-payment">{order.paymentMethod}</span>}
                          </div>
                          <div className="activity-time">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit'
                            }) : 'Recently'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'lowstock' && (
            <div className="alert-section">
              <div className="section-header">
                <div className="section-header-with-badge">
                  <h2>Low Stock Alert</h2>
                  <span className="alert-count warning">{lowStockProducts.length} items</span>
                </div>
                <p className="section-subtitle">Products at or below reorder level</p>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading low stock products...</p>
                </div>
              ) : (
                <div className="alert-products-grid">
                  {lowStockProducts.length === 0 ? (
                    <div className="no-data success-state">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <h3>All Good!</h3>
                      <p>No products are currently low on stock</p>
                    </div>
                  ) : (
                    lowStockProducts.map(product => (
                      <div key={product._id} className="alert-product-card warning">
                        <div className="alert-product-header">
                          <div className="alert-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                              <line x1="12" y1="9" x2="12" y2="13"/>
                              <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                          </div>
                          <span className="alert-badge">Low Stock</span>
                        </div>
                        <h3 className="alert-product-name">{product.name}</h3>
                        <div className="alert-product-details">
                          <div className="alert-detail-row">
                            <span className="alert-label">Current Stock:</span>
                            <span className="alert-value critical">{product.quantity} units</span>
                          </div>
                          <div className="alert-detail-row">
                            <span className="alert-label">Reorder Level:</span>
                            <span className="alert-value">{product.reorderLevel} units</span>
                          </div>
                          <div className="alert-detail-row">
                            <span className="alert-label">Price:</span>
                            <span className="alert-value">Rs {product.price?.toLocaleString()}</span>
                          </div>
                          {product.batchNumber && (
                            <div className="alert-detail-row">
                              <span className="alert-label">Batch:</span>
                              <span className="alert-value">{product.batchNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'expiring' && (
            <div className="alert-section">
              <div className="section-header">
                <div className="section-header-with-badge">
                  <h2>Products Expiring Soon</h2>
                  <span className="alert-count danger">{expiringProducts.length} items</span>
                </div>
                <p className="section-subtitle">Products expiring within 30 days</p>
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading expiring products...</p>
                </div>
              ) : (
                <div className="alert-products-grid">
                  {expiringProducts.length === 0 ? (
                    <div className="no-data success-state">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <h3>All Good!</h3>
                      <p>No products expiring in the next 30 days</p>
                    </div>
                  ) : (
                    expiringProducts.map(product => {
                      const daysLeft = Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={product._id} className={`alert-product-card ${daysLeft <= 7 ? 'danger' : 'warning'}`}>
                          <div className="alert-product-header">
                            <div className="alert-icon">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                              </svg>
                            </div>
                            <span className="alert-badge">{daysLeft} days left</span>
                          </div>
                          <h3 className="alert-product-name">{product.name}</h3>
                          <div className="alert-product-details">
                            <div className="alert-detail-row">
                              <span className="alert-label">Expiry Date:</span>
                              <span className="alert-value critical">
                                {new Date(product.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="alert-detail-row">
                              <span className="alert-label">Stock:</span>
                              <span className="alert-value">{product.quantity} units</span>
                            </div>
                            <div className="alert-detail-row">
                              <span className="alert-label">Price:</span>
                              <span className="alert-value">Rs {product.price?.toLocaleString()}</span>
                            </div>
                            {product.batchNumber && (
                              <div className="alert-detail-row">
                                <span className="alert-label">Batch:</span>
                                <span className="alert-value">{product.batchNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI CHATBOT */}
      <AIChatbot />
    </div>
  );
}
