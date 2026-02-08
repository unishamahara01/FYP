import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import UserProfileDropdown from "../components/UserProfileDropdown";
import AIChatbot from "../components/AIChatbot";
import CustomersPage from "./CustomersPage";
import SuppliersPage from "./SuppliersPage";
import ReportsPage from "./ReportsPage";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard({ onLogout, onAccountSettings }) {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState({
    totalSKUs: 0,
    expiringItems: 0,
    predictedShortages: 0,
    todaysSales: 0
  });
  const [loading, setLoading] = useState(true);
  
  // AI Expiry Prediction state
  const [aiPredictions, setAiPredictions] = useState(null);
  const [showAIPredictions, setShowAIPredictions] = useState(false);
  
  // Top Products state
  const [topProducts, setTopProducts] = useState([]);
  
  // Recent Activity state
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Inventory state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotic',
    manufacturer: '',
    batchNumber: '',
    quantity: 0,
    price: 0,
    expiryDate: '',
    manufactureDate: ''
  });

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: '',
    items: [{ product: '', quantity: 1 }],
    paymentMethod: 'Cash'
  });

  // Customers state
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [newCustomer, setNewCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    gender: 'Male'
  });

  // Suppliers state
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'Nepal' },
    status: 'Active',
    rating: 5
  });

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch products when inventory section is active
  useEffect(() => {
    if (activeSection === 'inventory') {
      fetchProducts();
    } else if (activeSection === 'orders') {
      fetchOrders();
      fetchProducts(); // Need products for order form
    }
  }, [activeSection]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch stats
      const statsRes = await fetch('http://localhost:3001/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch sales forecast
      const salesRes = await fetch('http://localhost:3001/api/sales/forecast', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const salesForecast = await salesRes.json();
      setSalesData(salesForecast);

      // Fetch AI Expiry Predictions
      fetchAIPredictions();
      
      // Fetch Top Products
      const topProductsRes = await fetch('http://localhost:3001/api/dashboard/top-products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const topProductsData = await topProductsRes.json();
      setTopProducts(topProductsData);
      
      // Fetch Recent Activity
      const activityRes = await fetch('http://localhost:3001/api/dashboard/recent-activity', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activityData = await activityRes.json();
      setRecentActivity(activityData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchAIPredictions = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3001/api/ai/expiry-prediction', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAiPredictions(data);
    } catch (error) {
      console.error('Error fetching AI predictions:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3001/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProducts(data);
      setProductsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProductsLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    // Auto-generate batch number if empty
    const productData = {...newProduct};
    if (!productData.batchNumber || productData.batchNumber.trim() === '') {
      const prefix = productData.name.substring(0, 3).toUpperCase();
      const timestamp = Date.now().toString().slice(-6);
      productData.batchNumber = `${prefix}-${timestamp}`;
    }
    
    console.log("Adding product:", productData);
    
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      const result = await res.json();
      console.log("Add product response:", result);
      
      if (res.ok) {
        alert('Product added successfully!');
        setShowAddModal(false);
        fetchProducts();
        fetchDashboardData(); // Refresh dashboard stats
        setNewProduct({
          name: '',
          genericName: '',
          category: 'Antibiotic',
          manufacturer: '',
          batchNumber: '',
          quantity: 0,
          price: 0,
          expiryDate: '',
          manufactureDate: ''
        });
      } else {
        console.error("Error:", result);
        alert('Failed to add product: ' + (result.message || result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + error.message);
    }
  };

  const fetchOrders = async () => {
    try {
      console.log("📋 Fetching orders...");
      setOrdersLoading(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3001/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("📋 Orders response status:", res.status);
      
      const data = await res.json();
      console.log("📋 Orders data received:", data);
      
      // Handle both array and object responses
      const ordersArray = Array.isArray(data) ? data : (data.orders || []);
      console.log("📋 Number of orders:", ordersArray.length);
      
      setOrders(ordersArray);
      setOrdersLoading(false);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      setOrdersLoading(false);
    }
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    
    console.log("🛒 Submitting order:", newOrder);
    
    try {
      const token = localStorage.getItem('authToken');
      
      console.log("📡 Sending request to:", 'http://localhost:3001/api/orders');
      
      const res = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newOrder)
      });
      
      console.log("📥 Response status:", res.status);
      
      const result = await res.json();
      console.log("📥 Response data:", result);
      
      if (res.ok) {
        alert('Order created successfully! Sales graph will update.');
        setShowOrderModal(false);
        fetchOrders();
        fetchDashboardData(); // Refresh stats and graph
        fetchProducts(); // Refresh product quantities
        setNewOrder({
          customerName: '',
          items: [{ product: '', quantity: 1 }],
          paymentMethod: 'Cash'
        });
      } else {
        console.error("❌ Error response:", result);
        alert(result.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      alert('Failed to create order: ' + error.message);
    }
  };

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { product: '', quantity: 1 }]
    });
  };

  const removeOrderItem = (index) => {
    const items = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items });
  };

  const updateOrderItem = (index, field, value) => {
    const items = [...newOrder.items];
    items[index][field] = value;
    setNewOrder({ ...newOrder, items });
  };

  // Render content based on active section
  const renderContent = () => {
    switch(activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'orders':
        return renderOrders();
      case 'inventory':
        return renderInventory();
      case 'reports':
        return renderReports();
      case 'suppliers':
        return renderSuppliers();
      case 'customers':
        return renderCustomers();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      {/* WELCOME SECTION */}
      <div className="welcome-section">
        <h1>Welcome, {currentUser.fullName || 'User'}!</h1>
        <p className="welcome-subtitle">Dashboard Overview • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
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
              <div className="stat-value">{stats.totalSKUs.toLocaleString()}</div>
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
              <div className="stat-value">{stats.expiringItems}</div>
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
              <div className="stat-value">{stats.predictedShortages}</div>
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
              <div className="stat-value">Rs {stats.todaysSales.toLocaleString()}</div>
              <div className="stat-change positive">From database</div>
            </div>
          </div>

          {/* MAIN CONTENT WITH SIDEBAR LAYOUT */}
          <div className="dashboard-main-layout">
            {/* LEFT SIDE - MAIN CONTENT */}
            <div className="dashboard-main-content">
              {/* DAILY SALES CHART */}
              <div className="dashboard-card chart-card">
                <div className="card-header">
                  <h3>Daily Sales Trend</h3>
                  <p className="card-subtitle">Last 30 days sales performance</p>
                </div>
                <div className="chart-container">
                  {salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="month" stroke="#666" />
                        <YAxis stroke="#666" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '10px'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#667eea" 
                          strokeWidth={3}
                          name="Daily Sales (Rs)"
                          dot={{ fill: '#667eea', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="coming-soon-container">
                      <p>No sales data available. Create some orders to see the graph!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* TOP SELLING PRODUCTS */}
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

              {/* RECENT ACTIVITY */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Recent Activity</h3>
                  <p className="card-subtitle">Latest system updates from database</p>
                </div>
                <div className="activity-list">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => {
                      const getTimeAgo = (time) => {
                        const seconds = Math.floor((new Date() - new Date(time)) / 1000);
                        if (seconds < 60) return `${seconds} seconds ago`;
                        const minutes = Math.floor(seconds / 60);
                        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
                        const hours = Math.floor(minutes / 60);
                        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                        const days = Math.floor(hours / 24);
                        return `${days} day${days > 1 ? 's' : ''} ago`;
                      };

                      return (
                        <div key={index} className="activity-item">
                          <div className={`activity-icon ${activity.icon}`}>
                            {activity.type === 'order' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                              </svg>
                            )}
                            {activity.type === 'product' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                              </svg>
                            )}
                            {activity.type === 'ai' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                              </svg>
                            )}
                            {activity.type === 'customer' && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                              </svg>
                            )}
                          </div>
                          <div className="activity-content">
                            <span className="activity-text">{activity.text}</span>
                            <span className="activity-time">{getTimeAgo(activity.time)}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{padding: '20px', textAlign: 'center', color: '#64748b'}}>
                      No recent activity. Start using the system to see updates!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR - AI FEATURES */}
            <div className="dashboard-sidebar">
              {/* AI EXPIRY PREDICTION */}
              <div className="sidebar-card ai-expiry-card">
                <div className="sidebar-card-header">
                  <div className="ai-badge-small">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    AI Expiry Prediction
                  </div>
                </div>
                <div className="sidebar-card-content">
                  {aiPredictions && aiPredictions.criticalRisk > 0 ? (
                    <>
                      <div className="ai-summary">
                        <div className="ai-summary-number">{aiPredictions.criticalRisk}</div>
                        <div className="ai-summary-text">Critical Risk Items</div>
                      </div>
                      <div className="ai-summary-details">
                        <p>Analyzed {aiPredictions.totalAnalyzed} products</p>
                        <p className="risk-value">Potential loss: Rs {aiPredictions.totalValueAtRisk.toLocaleString()}</p>
                      </div>
                      <button className="sidebar-btn" onClick={() => setShowAIPredictions(!showAIPredictions)}>
                        {showAIPredictions ? 'Hide Details' : 'View All Predictions'}
                      </button>
                      {showAIPredictions && (
                        <div className="ai-predictions-compact">
                          {aiPredictions.predictions.slice(0, 8).map((pred, index) => (
                            <div key={index} className="prediction-compact">
                              <div className="prediction-compact-header">
                                <span className="product-name-small">{pred.productName}</span>
                                <span className={`risk-badge-small ${pred.urgency}`}>{pred.riskLevel}</span>
                              </div>
                              <div className="prediction-compact-info">
                                <span>{pred.daysUntilExpiry}d • Rs {pred.stockValue.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="ai-empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <p style={{color: '#64748b', marginTop: '12px', fontSize: '14px'}}>
                        {aiPredictions ? 'No critical risk items found' : 'Add products to see AI predictions'}
                      </p>
                      <p style={{color: '#94a3b8', fontSize: '12px', marginTop: '8px'}}>
                        AI will analyze your inventory for expiry risks
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI INVENTORY OPTIMIZATION */}
              <div className="sidebar-card ai-optimization-card">
                <div className="sidebar-card-header">
                  <div className="ai-badge-small">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                    AI Inventory Optimization
                  </div>
                </div>
                <div className="sidebar-card-content">
                  <p className="optimization-text">AI identified optimization opportunities for your inventory</p>
                  <div className="optimization-stats">
                    <div className="opt-stat">
                      <span className="opt-number">12</span>
                      <span className="opt-label">Reorder Suggestions</span>
                    </div>
                    <div className="opt-stat">
                      <span className="opt-number">5</span>
                      <span className="opt-label">Overstocked Items</span>
                    </div>
                  </div>
                  <button className="sidebar-btn">View Optimization Plan</button>
                </div>
              </div>

              {/* QUICK ACTIONS */}
              <div className="sidebar-card quick-actions-card">
                <div className="sidebar-card-header">
                  <h4>Quick Actions</h4>
                </div>
                <div className="sidebar-card-content">
                  <button className="quick-action-btn" onClick={() => setActiveSection('orders')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Create Order
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveSection('inventory')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                    Add Product
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveSection('reports')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                    View Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );

  const renderOrders = () => (
    <div className="section-content">
      <div className="section-header-page">
        <h2>Orders Management</h2>
        <p className="section-subtitle">Create and manage customer orders</p>
      </div>

      <button className="add-btn" onClick={() => setShowOrderModal(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Create New Order
      </button>

      {ordersLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : (
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                    No orders found. Click "Create New Order" to get started.
                  </td>
                </tr>
              ) : (
                Array.isArray(orders) && orders.map((order) => (
                  <tr key={order._id}>
                    <td><strong>{order.orderNumber || 'N/A'}</strong></td>
                    <td>{order.customerName || 'N/A'}</td>
                    <td>{order.items?.length || 0} item(s)</td>
                    <td><strong>₨{order.totalAmount ? order.totalAmount.toLocaleString() : '0'}</strong></td>
                    <td>{order.paymentMethod || 'N/A'}</td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${(order.status || 'pending').toLowerCase()}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Order Modal */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Order</h3>
              <button className="close-btn" onClick={() => setShowOrderModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddOrder}>
              <div className="form-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter customer name"
                  value={newOrder.customerName}
                  onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={newOrder.paymentMethod}
                  onChange={(e) => setNewOrder({...newOrder, paymentMethod: e.target.value})}
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Online">Online</option>
                </select>
              </div>

              <div className="order-items-section">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                  <label style={{margin: 0}}>Order Items *</label>
                  <button type="button" className="add-item-btn" onClick={addOrderItem}>
                    + Add Item
                  </button>
                </div>

                {newOrder.items.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <div className="form-group" style={{flex: 2, marginBottom: 0}}>
                      <select
                        required
                        value={item.product}
                        onChange={(e) => updateOrderItem(index, 'product', e.target.value)}
                      >
                        <option value="">Select Product</option>
                        {Array.isArray(products) && products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.name} - ₨{product.price} (Stock: {product.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value))}
                      />
                    </div>
                    {newOrder.items.length > 1 && (
                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => removeOrderItem(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="order-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>Creating an order will automatically update product stock and sales data</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowOrderModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderInventory = () => (
    <div className="section-content">
      <div className="section-header-page">
        <h2>Inventory Management</h2>
        <p className="section-subtitle">Track and manage your pharmacy inventory</p>
      </div>

      <button className="add-btn" onClick={() => setShowAddModal(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add New Product
      </button>

      {productsLoading ? (
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
                <th>Category</th>
                <th>Batch Number</th>
                <th>Quantity</th>
                <th>Price (₨)</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                    No products found. Click "Add New Product" to get started.
                  </td>
                </tr>
              ) : (
                Array.isArray(products) && products.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div>
                        <strong>{product.name}</strong>
                        <br />
                        <small style={{color: '#64748b'}}>{product.genericName}</small>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{product.batchNumber}</td>
                    <td>{product.quantity}</td>
                    <td>₨{product.price}</td>
                    <td>{new Date(product.expiryDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${product.status.toLowerCase().replace(' ', '-')}`}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <select
                    required
                    value={newProduct.name}
                    onChange={(e) => {
                      const selected = e.target.value;
                      const medicines = {
                        'Paracetamol 500mg': 'Acetaminophen',
                        'Amoxicillin 500mg': 'Amoxicillin',
                        'Ibuprofen 400mg': 'Ibuprofen',
                        'Metformin 500mg': 'Metformin HCl',
                        'Omeprazole 20mg': 'Omeprazole',
                        'Aspirin 75mg': 'Acetylsalicylic Acid',
                        'Cetirizine 10mg': 'Cetirizine HCl',
                        'Vitamin C 1000mg': 'Ascorbic Acid',
                        'Azithromycin 500mg': 'Azithromycin',
                        'Losartan 50mg': 'Losartan Potassium'
                      };
                      setNewProduct({
                        ...newProduct, 
                        name: selected,
                        genericName: medicines[selected] || ''
                      });
                    }}
                  >
                    <option value="">Select Product</option>
                    <option value="Paracetamol 500mg">Paracetamol 500mg</option>
                    <option value="Amoxicillin 500mg">Amoxicillin 500mg</option>
                    <option value="Ibuprofen 400mg">Ibuprofen 400mg</option>
                    <option value="Metformin 500mg">Metformin 500mg</option>
                    <option value="Omeprazole 20mg">Omeprazole 20mg</option>
                    <option value="Aspirin 75mg">Aspirin 75mg</option>
                    <option value="Cetirizine 10mg">Cetirizine 10mg</option>
                    <option value="Vitamin C 1000mg">Vitamin C 1000mg</option>
                    <option value="Azithromycin 500mg">Azithromycin 500mg</option>
                    <option value="Losartan 50mg">Losartan 50mg</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Generic Name</label>
                  <input
                    type="text"
                    readOnly
                    value={newProduct.genericName}
                    style={{backgroundColor: '#f1f5f9', cursor: 'not-allowed'}}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Painkiller">Painkiller</option>
                    <option value="Vitamin">Vitamin</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Heart">Heart</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Digestive">Digestive</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.manufacturer}
                    onChange={(e) => setNewProduct({...newProduct, manufacturer: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Batch Number</label>
                  <input
                    type="text"
                    placeholder="Leave empty to auto-generate"
                    value={newProduct.batchNumber}
                    onChange={(e) => setNewProduct({...newProduct, batchNumber: e.target.value})}
                  />
                  <small style={{color: '#64748b', fontSize: '12px', display: 'block', marginTop: '4px'}}>
                    Auto-generates unique batch number if left empty
                  </small>
                </div>
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₨) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Manufacture Date *</label>
                  <input
                    type="date"
                    required
                    value={newProduct.manufactureDate}
                    onChange={(e) => setNewProduct({...newProduct, manufactureDate: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Expiry Date *</label>
                <input
                  type="date"
                  required
                  value={newProduct.expiryDate}
                  onChange={(e) => setNewProduct({...newProduct, expiryDate: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderReports = () => <ReportsPage />;

  const renderSuppliers = () => <SuppliersPage />;

  const renderCustomers = () => <CustomersPage />;
  
  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span className="logo-text">MediTrust</span>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveSection('dashboard')}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
            </svg>
            <span className="nav-text">Dashboard</span>
          </div>
          <div className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`} onClick={() => setActiveSection('orders')}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span className="nav-text">Orders</span>
          </div>
          <div className={`nav-item ${activeSection === 'inventory' ? 'active' : ''}`} onClick={() => setActiveSection('inventory')}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <span className="nav-text">Inventory</span>
          </div>
          <div className={`nav-item ${activeSection === 'reports' ? 'active' : ''}`} onClick={() => setActiveSection('reports')}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span className="nav-text">Reports</span>
          </div>
          <div className={`nav-item ${activeSection === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveSection('suppliers')}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
            <span className="nav-text">Suppliers</span>
          </div>
          <div className={`nav-item ${activeSection === 'customers' ? 'active' : ''}`} onClick={() => setActiveSection('customers')}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span className="nav-text">Customers</span>
          </div>
          <div className="nav-item" onClick={onAccountSettings}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <span className="nav-text">Settings</span>
          </div>
        </nav>
        
        <div className="sidebar-footer">
          <div className="nav-item" onClick={onLogout}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="nav-text">Logout</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* HEADER */}
        <header className="dashboard-header">
          <div className="header-left">
            <div className="breadcrumb">
              <svg className="breadcrumb-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-text">MediTrust</span>
            </div>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <button className="header-btn">
                <svg className="header-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </button>
              <button className="header-btn">
                <svg className="header-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
              <UserProfileDropdown user={currentUser} onLogout={onLogout} onAccountSettings={onAccountSettings} />
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="dashboard-content">
          {renderContent()}
        </div>

        {/* FOOTER */}
        <footer className="dashboard-footer">
          <p>© 2024 MediTrust. All rights reserved.</p>
        </footer>
      </div>

      {/* AI CHATBOT */}
      <AIChatbot />
    </div>
  );
}