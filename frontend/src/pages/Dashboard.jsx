import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import UserProfileDropdown from "../components/UserProfileDropdown";
import AIChatbot from "../components/AIChatbot";
import QRPayment from "../components/QRPayment";
import PaymentDisplay from "../components/PaymentDisplay";
import QRScanner from "../components/QRScanner";
import ProductQR from "../components/ProductQR";
import CustomersPage from "./CustomersPage";
import SuppliersPage from "./SuppliersPage";
import ReportsPage from "./ReportsPage";
import SearchableSelect from "../components/SearchableSelect";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import CryptoJS from 'crypto-js';

export default function Dashboard({ onLogout, onAccountSettings, userRole }) {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isPharmacist = userRole === 'Pharmacist' || currentUser.role === 'Pharmacist';
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
  
  // Low Stock Notification state
  const [lowStockItems, setLowStockItems] = useState(null);
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  
  // Top Products state
  const [topProducts, setTopProducts] = useState([]);
  
  // AI Demand Predictions state
  const [demandPredictions, setDemandPredictions] = useState([]);
  
  // Recent Activity state
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Inventory state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(false);
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

  // QR Scanner state
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrScanResult, setQrScanResult] = useState(null);
  const [showQRView, setShowQRView] = useState(false);
  const [selectedProductForQR, setSelectedProductForQR] = useState(null);
  
  // Quantity Dialog state for QR scanning
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [foundProduct, setFoundProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState('1');
  const [pendingQRData, setPendingQRData] = useState(null);

  // Procurement state
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  // Success states
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Header dropdown states
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // AI Analytics tab state
  const [aiActiveTab, setAiActiveTab] = useState('expiry');

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
    fetchProducts();
  }, []);

  // eSewa Payment Response Handler
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('esewa');
    const orderId = urlParams.get('oid');

    if (status === 'success') {
      alert(`✅ eSewa Payment Successful!\nOrder ID: ${orderId}\nYour order has been confirmed.`);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      if (typeof fetchOrders === 'function') fetchOrders();
      if (typeof fetchDashboardData === 'function') fetchDashboardData();
    } else if (status === 'failed') {
      const error = urlParams.get('error');
      alert(`❌ eSewa Payment Failed: ${error || 'User cancelled or transaction failed'}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch products when inventory section is active
  useEffect(() => {
    if (activeSection === 'inventory') {
      fetchProducts();
    } else if (activeSection === 'orders') {
      fetchOrders();
      fetchProducts(); // Need products for order form
    } else if (activeSection === 'procurement') {
      fetchPurchaseOrders();
    }
  }, [activeSection]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }
      
      // Fetch stats
      const statsRes = await fetch('http://localhost:3001/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!statsRes.ok) {
        throw new Error(`Stats API failed: ${statsRes.status}`);
      }
      
      const statsData = await statsRes.json();
      setStats(statsData || {
        totalSKUs: 0,
        expiringItems: 0,
        predictedShortages: 0,
        todaysSales: 0
      });

      // Fetch sales forecast
      const salesRes = await fetch('http://localhost:3001/api/sales/forecast', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const salesForecast = await salesRes.json();
      setSalesData(Array.isArray(salesForecast) ? salesForecast : []);

      // Fetch AI Expiry Predictions
      fetchAIPredictions();
      
      // Fetch Low Stock Items
      fetchLowStockItems();
      
      // Fetch Top Products
      const topProductsRes = await fetch('http://localhost:3001/api/dashboard/top-products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const topProductsData = await topProductsRes.json();
      setTopProducts(Array.isArray(topProductsData) ? topProductsData : []);
      
      // Fetch Recent Activity
      const activityRes = await fetch('http://localhost:3001/api/dashboard/recent-activity', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const activityData = await activityRes.json();
      // Transform backend data to match frontend expectations
      const transformedActivity = Array.isArray(activityData) ? activityData.map(activity => ({
        type: activity.type,
        text: activity.description,
        time: activity.timestamp,
        icon: activity.type === 'order' ? 'order-icon' : 'default-icon'
      })) : [];
      setRecentActivity(transformedActivity);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set safe defaults
      setStats({
        totalSKUs: 0,
        expiringItems: 0,
        predictedShortages: 0,
        todaysSales: 0
      });
      setTopProducts([]);
      setRecentActivity([]);
      setSalesData([]);
      setLoading(false);
    }
  };

  const fetchAIPredictions = async (forceRetrain = false) => {
    try {
      console.log('🔄 Fetching AI predictions...');
      
      // Check if ML backend is available
      const healthCheck = await fetch('http://localhost:5001/health');
      if (!healthCheck.ok) {
        console.log('❌ ML backend health check failed');
        setAiPredictions(null);
        setDemandPredictions([]);
        return;
      }
      console.log('✅ ML backend is healthy');

      // Force retrain if requested
      if (forceRetrain) {
        console.log('🎓 Force retraining model...');
        await trainAIModel(true);
        return;
      }

      // Fetch expiry predictions from ML backend
      const res = await fetch('http://localhost:5001/predict');
      
      // If predictions fail (model not trained), auto-train first
      if (!res.ok) {
        console.log('🎓 Model not trained yet, training automatically...');
        await trainAIModel(true);
        return; // trainAIModel will call fetchAIPredictions again
      }
      
      const data = await res.json();
      console.log('📊 AI Predictions received:', data);
      console.log('📊 Number of predictions:', data.predictions?.length || 0);
      console.log('📊 Predictions:', data.predictions);
      
      // Log expired products specifically
      const expiredProducts = data.predictions?.filter(p => p.daysUntilExpiry < 0) || [];
      console.log('⚠️ Expired products found:', expiredProducts.length);
      if (expiredProducts.length > 0) {
        console.log('⚠️ Expired products:', expiredProducts);
      }
      
      setAiPredictions(data || { predictions: [] });
      
      // Fetch demand predictions
      const demandRes = await fetch('http://localhost:5001/predict/demand');
      if (demandRes.ok) {
        const demandData = await demandRes.json();
        if (demandData.success && demandData.predictions) {
          setDemandPredictions(demandData.predictions);
        }
      }
    } catch (error) {
      console.error('❌ ML backend not available:', error);
      setAiPredictions(null);
      setDemandPredictions([]);
    }
  };

  const trainAIModel = async (silent = false) => {
    try {
      const response = await fetch('http://localhost:5001/train', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (!silent) {
          alert(`✅ AI Model trained successfully!\n\nTraining samples: ${data.training_samples}\nAccuracy: ${(data.accuracy * 100).toFixed(1)}%`);
        }
        fetchAIPredictions();
      } else {
        if (!silent) {
          alert(`❌ Training failed: ${data.message}`);
        }
      }
    } catch (err) {
      if (!silent) {
        alert(`❌ ML Backend not available. Please start the ML server first.`);
      }
    }
  };

  const handleApplyPromotion = async (productId, discountPercentage) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/inventory/apply-promotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          discountPercentage: parseInt(discountPercentage),
          isPromoted: true
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`✅ ${discountPercentage}% discount applied successfully!`);
        
        // Force complete refresh from AI backend
        await fetchAIPredictions();
        await fetchProducts();
      } else {
        alert(`❌ Failed to apply promotion: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Promotion error:', err);
      alert(`❌ Error applying promotion: ${err.message}`);
    }
  };

  const handleRemovePromotion = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/inventory/apply-promotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          isPromoted: false,
          discountPercentage: 0
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update the prediction in state immediately without full refresh
        if (aiPredictions && aiPredictions.predictions) {
          const updatedPredictions = aiPredictions.predictions.map(pred => 
            pred.productId === productId 
              ? { ...pred, isPromoted: false, discountPercentage: 0 }
              : pred
          );
          setAiPredictions({ ...aiPredictions, predictions: updatedPredictions });
        }
        
        alert(`✅ Promotion removed successfully!`);
        fetchProducts();
      } else {
        alert(`❌ Failed to remove promotion: ${data.message}`);
      }
    } catch (err) {
      alert(`❌ Error removing promotion: ${err.message}`);
    }
  };

  const handleDisposeProduct = async (productId, productName) => {
    if (!window.confirm(`⚠️ Are you sure you want to mark "${productName}" as disposed? This will set quantity to 0.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: 0
        })
      });

      const data = await response.json();
      
      if (response.ok && data.product) {
        alert(`✅ ${productName} has been disposed successfully! Quantity set to 0.`);
        fetchAIPredictions();
        fetchProducts();
      } else {
        alert(`❌ Failed to dispose product: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Dispose error:', err);
      alert(`❌ Error disposing product: ${err.message}`);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3001/api/inventory/low-stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLowStockItems(data);
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    }
  };

  const sendLowStockAlert = async () => {
    try {
      setSendingAlert(true);
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3001/api/inventory/send-low-stock-alert', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`✅ ${data.message}\nEmails sent: ${data.emailsSent}/${data.totalRecipients}`);
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Error sending low stock alert:', error);
      alert('❌ Failed to send low stock alert');
    } finally {
      setSendingAlert(false);
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
      setProducts(Array.isArray(data) ? data : []);
      setProductsLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProductsLoading(false);
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const res = await fetch('http://localhost:3001/api/purchase-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setPurchaseOrders(data);
      } else if (data.orders && Array.isArray(data.orders)) {
        setPurchaseOrders(data.orders);
      } else {
        setPurchaseOrders([]);
      }
    } catch (err) {
      console.error("Error fetching POs:", err);
    }
  };

  // QR Scanner Functions
  const handleQRScan = async (qrData) => {
    try {
      console.log('🔍 QR Scanned:', qrData);
      setQrScanResult(qrData);
      
      // Check authentication first
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('❌ Authentication required. Please login again.');
        return;
      }
      
      console.log('📡 Sending QR lookup request to backend...');
      console.log('🔑 Using auth token:', token ? 'Present' : 'Missing');
      
      // Send the entire qrData so backend can use batchNumber if ID fails
      let dataToSend = qrData;
      
      const res = await fetch('http://localhost:3001/api/products/qr-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ qrData: dataToSend })
      });
      
      console.log('📥 QR lookup response status:', res.status);
      console.log('📥 QR lookup response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ QR lookup failed:', res.status, errorText);
        
        if (res.status === 401) {
          alert('❌ Authentication failed. Please login again.');
          onLogout(); // Redirect to login
          return;
        }
        
        alert(`❌ Error looking up product: ${res.status} - ${errorText}`);
        return;
      }
      
      const result = await res.json();
      console.log('📦 QR lookup result:', result);
      
      if (result.success) {
        // Show quantity dialog instead of using prompt()
        console.log('✅ Product found, showing quantity dialog');
        setFoundProduct(result.product);
        setPendingQRData(qrData);
        setQuantityToAdd('1'); // Default quantity
        setShowQuantityDialog(true);
      } else {
        alert(`❌ Product not found: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error processing QR scan:', error);
      alert(`❌ Error processing QR code: ${error.message}`);
    }
  };

  const addProductViaQR = async (qrData, quantity) => {
    try {
      console.log('📦 Adding product via QR:', { qrData, quantity });
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('❌ Authentication required. Please login again.');
        return;
      }
      
      const res = await fetch('http://localhost:3001/api/products/qr-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          qrData: typeof qrData === 'string' ? qrData : JSON.stringify(qrData), 
          quantity 
        })
      });
      
      console.log('📥 QR add response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ QR add failed:', res.status, errorText);
        
        if (res.status === 401) {
          alert('❌ Authentication failed. Please login again.');
          onLogout();
          return;
        }
        
        alert(`❌ Error adding product: ${res.status} - ${errorText}`);
        return;
      }
      
      const result = await res.json();
      console.log('✅ QR add result:', result);
      
      if (result.success) {
        alert(`✅ ${result.message}`);
        fetchProducts(); // Refresh product list
        fetchDashboardData(); // Refresh dashboard stats
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error('❌ Error adding product via QR:', error);
      alert(`❌ Error adding product to inventory: ${error.message}`);
    }
  };

  // Handle quantity dialog confirmation
  const handleQuantityConfirm = async () => {
    const quantity = parseInt(quantityToAdd);
    if (quantity && quantity > 0 && pendingQRData) {
      setShowQuantityDialog(false);
      await addProductViaQR(pendingQRData, quantity);
      // Reset state
      setFoundProduct(null);
      setPendingQRData(null);
      setQuantityToAdd('1');
    } else {
      alert('❌ Please enter a valid quantity (greater than 0)');
    }
  };

  // Handle quantity dialog cancellation
  const handleQuantityCancel = () => {
    setShowQuantityDialog(false);
    setFoundProduct(null);
    setPendingQRData(null);
    setQuantityToAdd('1');
  };

  const openQRView = (product) => {
    setSelectedProductForQR(product);
    setShowQRView(true);
  };

  // Group similar products by name
  const groupProductsByName = (products) => {
    if (!Array.isArray(products)) return [];
    
    const grouped = {};
    
    products.forEach(product => {
      const key = product.name; // Group by exact name
      
      if (!grouped[key]) {
        grouped[key] = {
          ...product,
          totalQuantity: product.quantity,
          batches: [product],
          averagePrice: product.price,
          earliestExpiry: product.expiryDate,
          combinedStatus: product.status
        };
      } else {
        // Add to existing group
        grouped[key].totalQuantity += product.quantity;
        grouped[key].batches.push(product);
        
        // Calculate average price
        const totalPrice = grouped[key].batches.reduce((sum, batch) => sum + batch.price, 0);
        grouped[key].averagePrice = parseFloat((totalPrice / grouped[key].batches.length).toFixed(2));
        
        // Find earliest expiry
        if (new Date(product.expiryDate) < new Date(grouped[key].earliestExpiry)) {
          grouped[key].earliestExpiry = product.expiryDate;
        }
        
        // Determine combined status (prioritize warnings)
        const statuses = grouped[key].batches.map(b => b.status);
        if (statuses.includes('Expiring Soon')) {
          grouped[key].combinedStatus = 'Expiring Soon';
        } else if (statuses.includes('Low Stock')) {
          grouped[key].combinedStatus = 'Low Stock';
        } else if (statuses.includes('Out Of Stock')) {
          grouped[key].combinedStatus = 'Out Of Stock';
        } else {
          grouped[key].combinedStatus = 'In Stock';
        }
      }
    });
    
    return Object.values(grouped);
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
    setOrderProcessing(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newOrder)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setOrderSuccess(true);
        setOrderProcessing(false);
        
        // Show success for 2 seconds before closing
        setTimeout(() => {
          setShowOrderModal(false);
          setOrderSuccess(false);
          fetchOrders();
          fetchDashboardData();
          fetchProducts();
          setNewOrder({
            customerName: '',
            items: [{ product: '', quantity: 1 }],
            paymentMethod: 'Cash'
          });
        }, 2000);
      } else {
        setOrderProcessing(false);
        alert(result.message || 'Failed to create order');
      }
    } catch (error) {
      setOrderProcessing(false);
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
        // Restrict suppliers section for Pharmacist and Staff users
        if (isPharmacist) {
          setActiveSection('dashboard');
          return renderDashboard();
        }
        return renderSuppliers();
      case 'customers':
        // Restrict customers section for Pharmacist and Staff users
        if (isPharmacist) {
          setActiveSection('dashboard');
          return renderDashboard();
        }
        return renderCustomers();
      case 'procurement':
        return (
          <ProcurementView 
            purchaseOrders={purchaseOrders} 
            createPurchaseRequest={createPurchaseRequest} 
            fulfillOrder={fulfillOrder} 
          />
        );
      case 'ai-analytics':
        return renderAIAnalytics();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <>
      {/* WELCOME SECTION */}
      <div className="welcome-section">
        <h1>Welcome, {currentUser.fullName || 'User'}!</h1>
        <p className="welcome-subtitle">
          {isPharmacist ? 'Pharmacist Dashboard' : 'Dashboard Overview'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

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
              <div className="stat-value">{(stats.totalSKUs || 0).toLocaleString()}</div>
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
              <div className="stat-value">{stats.expiringItems || 0}</div>
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
              <div className="stat-value">{stats.predictedShortages || 0}</div>
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
              <div className="stat-value">Rs {(stats.todaysSales || 0).toLocaleString()}</div>
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
                  {(topProducts && topProducts.length > 0) ? (
                    topProducts.map((product, index) => (
                      <div key={product._id || index} className="top-product-item">
                        <div className="product-rank">{index + 1}</div>
                        <div className="product-info">
                          <span className="product-name-top">{product.name || product.productName || 'Unknown'}</span>
                          <span className="product-sales">{product.soldQuantity || product.unitsSold || 0} units sold</span>
                        </div>
                        <div className="product-revenue">Rs {(product.revenue || 0).toLocaleString()}</div>
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
                  {(recentActivity && recentActivity.length > 0) ? (
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
                      <div style={{display: 'flex', gap: '8px', marginBottom: '12px'}}>
                        <button className="sidebar-btn" style={{flex: 1}} onClick={() => setShowAIPredictions(!showAIPredictions)}>
                          {showAIPredictions ? 'Hide Details' : 'View Details'}
                        </button>
                        <button className="sidebar-btn-secondary" onClick={() => fetchAIPredictions()} title="Refresh Predictions">
                          🔄
                        </button>
                      </div>
                      {showAIPredictions && (
                        <div className="ai-predictions-compact">
                          {aiPredictions.predictions.slice(0, 8).map((pred, index) => (
                            <div key={index} className="prediction-compact">
                              <div className="prediction-compact-header">
                                <span className="product-name-small">{pred.productName}</span>
                                <span className={`risk-badge-small ${pred.urgency}`}>{pred.riskLevel}</span>
                              </div>
                              <div className="prediction-compact-info">
                                <span>{pred.daysUntilExpiry}d • {pred.currentStock} units</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : aiPredictions === null ? (
                    <div className="ai-empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <p style={{color: '#64748b', marginTop: '12px', fontSize: '14px'}}>
                        ML Backend Offline
                      </p>
                      <p style={{color: '#94a3b8', fontSize: '12px', marginTop: '8px'}}>
                        Start the ML server to enable AI predictions
                      </p>
                      <button className="sidebar-btn" style={{marginTop: '12px'}} onClick={fetchAIPredictions}>
                        🔄 Retry Connection
                      </button>
                    </div>
                  ) : (
                    <div className="ai-empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      <p style={{color: '#64748b', marginTop: '12px', fontSize: '14px'}}>
                        No critical risk items found
                      </p>
                      <p style={{color: '#94a3b8', fontSize: '12px', marginTop: '8px'}}>
                        AI will automatically analyze your inventory for expiry risks
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* LOW STOCK ALERT */}
              <div className="sidebar-card low-stock-alert-card">
                <div className="sidebar-card-header">
                  <div className="ai-badge-small" style={{background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Low Stock Alert
                  </div>
                </div>
                <div className="sidebar-card-content">
                  {lowStockItems && lowStockItems.outOfStock && lowStockItems.lowStock && (lowStockItems.outOfStock.length > 0 || lowStockItems.lowStock.length > 0) ? (
                    <>
                      <div className="low-stock-summary">
                        {lowStockItems.outOfStock.length > 0 && (
                          <div className="stock-alert critical">
                            <div className="alert-number">{lowStockItems.outOfStock.length}</div>
                            <div className="alert-text">Out of Stock</div>
                          </div>
                        )}
                        {lowStockItems.lowStock.length > 0 && (
                          <div className="stock-alert warning">
                            <div className="alert-number">{lowStockItems.lowStock.length}</div>
                            <div className="alert-text">Low Stock</div>
                          </div>
                        )}
                      </div>
                      
                      <button 
                        className="sidebar-btn alert-btn" 
                        onClick={() => setShowLowStockAlert(!showLowStockAlert)}
                        style={{background: 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)', color: 'white'}}
                      >
                        {showLowStockAlert ? 'Hide Items' : 'View Items'}
                      </button>
                      
                      {showLowStockAlert && (
                        <div className="low-stock-items">
                          {lowStockItems.outOfStock.length > 0 && (
                            <div className="stock-category">
                              <h5 style={{color: '#e53e3e', margin: '10px 0 5px 0', fontSize: '12px'}}>OUT OF STOCK</h5>
                              {lowStockItems.outOfStock.slice(0, 3).map((product, index) => (
                                <div key={index} className="stock-item critical">
                                  <span className="item-name">{product.name}</span>
                                  <span className="item-batch">({product.batchNumber})</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {lowStockItems.lowStock.length > 0 && (
                            <div className="stock-category">
                              <h5 style={{color: '#ed8936', margin: '10px 0 5px 0', fontSize: '12px'}}>LOW STOCK</h5>
                              {lowStockItems.lowStock.slice(0, 3).map((product, index) => (
                                <div key={index} className="stock-item warning">
                                  <span className="item-name">{product.name}</span>
                                  <span className="item-qty">Qty: {product.quantity}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="automated-alert-status" style={{ 
                        marginTop: '15px', 
                        padding: '10px', 
                        backgroundColor: '#f0fdf4', 
                        border: '1px solid #bbf7d0', 
                        borderRadius: '6px', 
                        fontSize: '12px', 
                        color: '#166534', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px' 
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span><strong>Active:</strong> Automated email alerts are enabled.</span>
                      </div>
                    </>
                  ) : (
                    <div className="ai-empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#48bb78" strokeWidth="1.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                      </svg>
                      <p style={{color: '#48bb78', marginTop: '12px', fontSize: '14px'}}>
                        All items well stocked!
                      </p>
                      <p style={{color: '#94a3b8', fontSize: '12px', marginTop: '8px'}}>
                        No items below 50 units threshold
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
                  <h4>{isPharmacist ? 'Pharmacist Quick Actions' : 'Quick Actions'}</h4>
                </div>
                <div className="sidebar-card-content">
                  <button className="quick-action-btn" onClick={() => setActiveSection('orders')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    {isPharmacist ? 'Process Order' : 'Create Order'}
                  </button>
                  <button className="quick-action-btn" onClick={() => setActiveSection('inventory')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                    {isPharmacist ? 'Manage Stock' : 'Add Product'}
                  </button>
                  {isPharmacist && (
                    <button 
                      className="quick-action-btn" 
                      onClick={() => setShowQRScanner(true)}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="5" height="5"/>
                        <rect x="16" y="3" width="5" height="5"/>
                        <rect x="3" y="16" width="5" height="5"/>
                        <path d="m21 16-3.5-3.5-2.5 2.5"/>
                        <path d="m13 13 3 3 2.5-2.5"/>
                      </svg>
                      Scan QR Code
                    </button>
                  )}
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
              {(!orders || orders.length === 0) ? (
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
            <form onSubmit={handleAddOrder} style={{ position: 'relative' }}>
              {orderSuccess && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '15px'
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <h3 style={{ color: '#166534', margin: 0 }}>Order Confirmed!</h3>
                  <p style={{ color: '#666' }}>
                    {newOrder.paymentMethod === 'QR Payment' ? 'Processing secure digital payment...' : 'Processing receipt...'}
                  </p>
                </div>
              )}

              {orderProcessing && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  zIndex: 99,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '12px'
                }}>
                   <div className="spinner"></div>
                </div>
              )}
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
                  <option value="QR Payment">Online</option>
                </select>
              </div>

              {/* Medicine QR Code System for QR Payment */}
              {newOrder.paymentMethod === 'QR Payment' && (
                <div style={{
                  border: '2px solid #28a745',
                  borderRadius: '12px',
                  padding: '20px',
                  margin: '20px 0',
                  backgroundColor: '#f8fff8'
                }}>
                  <div style={{textAlign: 'center', marginBottom: '20px'}}>
                    <h3 style={{color: '#28a745', margin: '0 0 10px 0'}}>
                      💳 Online Payment Portal
                    </h3>
                  </div>

                  {/* Payment Amount Display */}
                  <div style={{
                    textAlign: 'center',
                    backgroundColor: 'white',
                    border: '2px solid #28a745',
                    borderRadius: '8px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <div style={{fontSize: '16px', color: '#666', marginBottom: '5px'}}>
                      Total Amount
                    </div>
                    <div style={{
                      fontSize: '32px',
                      fontWeight: 'bold',
                      color: '#28a745'
                    }}>
                      Rs. {newOrder.items.reduce((sum, item) => {
                        const product = products.find(p => p._id === item.product);
                        const price = product ? product.price : 0;
                        const quantity = item.quantity || 0;
                        return sum + (quantity * price);
                      }, 0).toLocaleString()}
                    </div>
                  </div>


                  {/* eSewa Digital Payment Generator */}
                  {(() => {
                    const totalAmount = newOrder.items.reduce((sum, item) => {
                      const product = products.find(p => p._id === item.product);
                      return sum + ((item.quantity || 0) * (product ? product.price : 0));
                    }, 0);
                    
                    const qrPayload = `https://esewa.com.np/#/pay?merchant=EPAYTEST&amt=${totalAmount}&pid=ORD-PQ-${Date.now()}`;

                    const handleSandboxPayment = async () => {
                        setOrderProcessing(true);
                        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
                        
                        try {
                            console.log("🚀 Initiating eSewa payment...");
                            const res = await fetch('http://localhost:3001/api/payments/initiate-esewa', {
                                method: 'POST',
                                headers: { 
                                    'Content-Type': 'application/json', 
                                    Authorization: `Bearer ${token}` 
                                },
                                body: JSON.stringify({
                                    customerName: newOrder.customerName,
                                    items: newOrder.items
                                })
                            });

                            if (!res.ok) {
                                const errorData = await res.json();
                                throw new Error(errorData.message || 'Failed to initiate payment');
                            }
                            const { paymentParams } = await res.json();
                            console.log("🧪 Received eSewa payment params:", paymentParams);

                            // 2. Redirect to eSewa Sandbox via programmatic form submission
                            // This is the standard way to integrate eSewa ePay V2
                            const form = document.createElement('form');
                            form.setAttribute('method', 'POST');
                            form.setAttribute('action', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');

                            for (const key in paymentParams) {
                                const hiddenField = document.createElement('input');
                                hiddenField.setAttribute('type', 'hidden');
                                hiddenField.setAttribute('name', key);
                                hiddenField.setAttribute('value', paymentParams[key]);
                                form.appendChild(hiddenField);
                            }

                            document.body.appendChild(form);
                            form.submit();

                        } catch (err) {
                            setOrderProcessing(false);
                            console.error('❌ eSewa redirect error:', err);
                            alert(`Failed to start eSewa payment: ${err.message}`);
                        }
                    };

                    return (
                      <div style={{
                        backgroundColor: '#f0fdf4',
                        border: '2px solid #22c55e',
                        borderRadius: '12px',
                        padding: '20px',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Green Header Ribbon */}
                        <div style={{
                          backgroundColor: '#22c55e', 
                          position: 'absolute', 
                          top: 0, left: 0, right: 0, 
                          height: '4px'
                        }} />
                        
                        <div style={{
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '15px'
                        }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                            <polyline points="22,6 12,13 2,6"/>
                          </svg>
                          <span style={{fontSize: '18px', fontWeight: '800', color: '#166534', letterSpacing: '-0.5px'}}>
                            eSewa Digital Payment
                          </span>
                        </div>
                        
                        <div style={{
                          backgroundColor: 'white',
                          padding: '15px',
                          borderRadius: '8px',
                          display: 'inline-block',
                          border: '1px solid #bbf7d0',
                          marginBottom: '15px'
                        }}>
                          <QRCodeSVG 
                            value={qrPayload}
                            size={160}
                            bgColor={"#ffffff"}
                            fgColor={"#064e3b"}
                            level={"H"}
                            includeMargin={false}
                          />
                        </div>
                        
                        <div style={{
                          fontSize: '28px', 
                          fontWeight: '900', 
                          color: '#166534',
                          marginBottom: '5px'
                        }}>
                          Rs. {totalAmount.toLocaleString()}
                        </div>
                        
                        <div style={{fontSize: '13px', color: '#15803d', lineHeight: '1.6', marginBottom: '15px'}}>
                          Merchant: Unisha Mahara (FYP Demo)
                        </div>

                        <button
                          type="button"
                          onClick={handleSandboxPayment}
                          style={{
                              backgroundColor: '#16a34a',
                              color: 'white',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              width: '100%',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 4px 6px rgba(22, 163, 74, 0.2)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <path d="M12 8v8M8 12h8"></path>
                          </svg>
                          Pay Now with eSewa
                        </button>
                      </div>
                    );
                  })()}

                  {/* Order Information */}
                  <div style={{
                    marginTop: '15px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#666',
                    textAlign: 'center'
                  }}>
                    <div><strong>Order ID:</strong> ORD-{Date.now()}</div>
                    <div><strong>Customer:</strong> {newOrder.customerName}</div>
                    <div><strong>Merchant:</strong> MediTrust Pharmacy</div>
                  </div>
                </div>
              )}

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
                      <SearchableSelect
                        required
                        value={item.product}
                        onChange={(value) => {
                          const newItems = [...newOrder.items];
                          newItems[index].product = value;
                          setNewOrder({ ...newOrder, items: newItems });
                        }}
                        placeholder="Select Product"
                        options={Array.isArray(products) ? products.filter(p => p.quantity > 0).map(p => {
                          const promoPrice = p.isPromoted && p.discountPercentage > 0 
                            ? Math.round(p.price * (1 - p.discountPercentage / 100)) 
                            : null;
                          return {
                            value: p._id,
                            label: promoPrice 
                              ? `🏷️ ${p.name} - ₨${promoPrice} (was ₨${Math.round(p.price)}) ${p.discountPercentage}% OFF | Stock: ${p.quantity}`
                              : `${p.name} - ₨${Math.round(p.price)} (Stock: ${p.quantity})`
                          };
                        }) : []}
                      />
                    </div>
                    <div className="form-group" style={{flex: 1, marginBottom: 0}}>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    {newOrder.items && newOrder.items.length > 1 && (
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
        <p className="section-subtitle">Track and manage your pharmacy inventory with QR codes</p>
      </div>

      <div className="inventory-actions">
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New Product
        </button>
        
        <button 
          className="qr-scan-btn modern-qr-btn" 
          onClick={() => setShowQRScanner(true)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="5" height="5"/>
              <rect x="16" y="3" width="5" height="5"/>
              <rect x="3" y="16" width="5" height="5"/>
              <path d="m21 16-3.5-3.5-2.5 2.5"/>
              <path d="m13 13 3 3 2.5-2.5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>📱 Scan QR Code</div>
            <div style={{ fontSize: '12px', opacity: '0.9', fontWeight: '400' }}>Add stock to inventory</div>
          </div>
        </button>
        
        <button 
          className="qr-view-btn modern-qr-btn" 
          onClick={() => setShowQRView(true)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Changed to purple like scan button
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)', // Purple shadow to match
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)'; // Purple shadow
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)'; // Purple shadow
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="3" width="5" height="5"/>
              <rect x="16" y="3" width="5" height="5"/>
              <rect x="3" y="16" width="5" height="5"/>
              <rect x="16" y="16" width="5" height="5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700' }}>🏷️ View QR Codes</div>
            <div style={{ fontSize: '12px', opacity: '0.9', fontWeight: '400' }}>Generate & print labels</div>
          </div>
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: '#475569', fontWeight: '500', backgroundColor: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <input 
            type="checkbox" 
            checked={showOutOfStock} 
            onChange={() => setShowOutOfStock(!showOutOfStock)} 
            style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px', accentColor: '#667eea' }}
          />
          Show Out of Stock History
        </label>
      </div>

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
                <th>QR Code</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(products) ? (showOutOfStock ? products.filter(p => p.quantity === 0) : products.filter(p => p.quantity > 0)) : []).length === 0 ? (
                <tr>
                  <td colSpan="8" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>
                    {showOutOfStock ? "No out of stock history found." : "No active products found."}
                  </td>
                </tr>
              ) : (
                (Array.isArray(products) ? (showOutOfStock ? products.filter(p => p.quantity === 0) : products.filter(p => p.quantity > 0)) : []).map((product) => (
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
                    <td>
                      <strong style={{color: '#28a745'}}>{product.quantity}</strong>
                    </td>
                    <td>₨{Math.round(product.price)}</td>
                    <td>{new Date(product.expiryDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${product.status.toLowerCase().replace(' ', '-')}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="qr-btn"
                        onClick={() => openQRView(product)}
                        title="View QR Code"
                      >
                        📱
                      </button>
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
                  <SearchableSelect
                    required
                    grouped={true}
                    value={newProduct.name}
                    onChange={(value) => setNewProduct({...newProduct, name: value})}
                    placeholder="Type or select medicine..."
                    options={[
                      // Antibiotics
                      { value: "Amoxicillin 250mg", label: "Amoxicillin 250mg", category: "Antibiotics" },
                      { value: "Amoxicillin 500mg", label: "Amoxicillin 500mg", category: "Antibiotics" },
                      { value: "Azithromycin 250mg", label: "Azithromycin 250mg", category: "Antibiotics" },
                      { value: "Azithromycin 500mg", label: "Azithromycin 500mg", category: "Antibiotics" },
                      { value: "Ciprofloxacin 250mg", label: "Ciprofloxacin 250mg", category: "Antibiotics" },
                      { value: "Ciprofloxacin 500mg", label: "Ciprofloxacin 500mg", category: "Antibiotics" },
                      { value: "Cephalexin 250mg", label: "Cephalexin 250mg", category: "Antibiotics" },
                      { value: "Cephalexin 500mg", label: "Cephalexin 500mg", category: "Antibiotics" },
                      { value: "Doxycycline 100mg", label: "Doxycycline 100mg", category: "Antibiotics" },
                      { value: "Metronidazole 400mg", label: "Metronidazole 400mg", category: "Antibiotics" },
                      { value: "Clindamycin 150mg", label: "Clindamycin 150mg", category: "Antibiotics" },
                      { value: "Erythromycin 250mg", label: "Erythromycin 250mg", category: "Antibiotics" },
                      { value: "Levofloxacin 500mg", label: "Levofloxacin 500mg", category: "Antibiotics" },
                      { value: "Cefixime 200mg", label: "Cefixime 200mg", category: "Antibiotics" },
                      { value: "Norfloxacin 400mg", label: "Norfloxacin 400mg", category: "Antibiotics" },
                      // Painkillers
                      { value: "Paracetamol 500mg", label: "Paracetamol 500mg", category: "Painkillers" },
                      { value: "Paracetamol 650mg", label: "Paracetamol 650mg", category: "Painkillers" },
                      { value: "Ibuprofen 200mg", label: "Ibuprofen 200mg", category: "Painkillers" },
                      { value: "Ibuprofen 400mg", label: "Ibuprofen 400mg", category: "Painkillers" },
                      { value: "Aspirin 75mg", label: "Aspirin 75mg", category: "Painkillers" },
                      { value: "Aspirin 150mg", label: "Aspirin 150mg", category: "Painkillers" },
                      { value: "Diclofenac 50mg", label: "Diclofenac 50mg", category: "Painkillers" },
                      { value: "Diclofenac Gel 30g", label: "Diclofenac Gel 30g", category: "Painkillers" },
                      { value: "Naproxen 250mg", label: "Naproxen 250mg", category: "Painkillers" },
                      { value: "Tramadol 50mg", label: "Tramadol 50mg", category: "Painkillers" },
                      { value: "Ketorolac 10mg", label: "Ketorolac 10mg", category: "Painkillers" },
                      { value: "Mefenamic Acid 250mg", label: "Mefenamic Acid 250mg", category: "Painkillers" },
                      // Diabetes
                      { value: "Metformin 500mg", label: "Metformin 500mg", category: "Diabetes" },
                      { value: "Metformin 850mg", label: "Metformin 850mg", category: "Diabetes" },
                      { value: "Glimepiride 1mg", label: "Glimepiride 1mg", category: "Diabetes" },
                      { value: "Glimepiride 2mg", label: "Glimepiride 2mg", category: "Diabetes" },
                      { value: "Glibenclamide 5mg", label: "Glibenclamide 5mg", category: "Diabetes" },
                      { value: "Sitagliptin 50mg", label: "Sitagliptin 50mg", category: "Diabetes" },
                      { value: "Insulin Glargine 100IU/ml", label: "Insulin Glargine 100IU/ml", category: "Diabetes" },
                      { value: "Insulin Regular 100IU/ml", label: "Insulin Regular 100IU/ml", category: "Diabetes" },
                      // Heart & Blood Pressure
                      { value: "Atorvastatin 10mg", label: "Atorvastatin 10mg", category: "Heart & Blood Pressure" },
                      { value: "Atorvastatin 20mg", label: "Atorvastatin 20mg", category: "Heart & Blood Pressure" },
                      { value: "Amlodipine 5mg", label: "Amlodipine 5mg", category: "Heart & Blood Pressure" },
                      { value: "Amlodipine 10mg", label: "Amlodipine 10mg", category: "Heart & Blood Pressure" },
                      { value: "Losartan 50mg", label: "Losartan 50mg", category: "Heart & Blood Pressure" },
                      { value: "Enalapril 5mg", label: "Enalapril 5mg", category: "Heart & Blood Pressure" },
                      { value: "Bisoprolol 5mg", label: "Bisoprolol 5mg", category: "Heart & Blood Pressure" },
                      { value: "Carvedilol 6.25mg", label: "Carvedilol 6.25mg", category: "Heart & Blood Pressure" },
                      { value: "Clopidogrel 75mg", label: "Clopidogrel 75mg", category: "Heart & Blood Pressure" },
                      { value: "Digoxin 0.25mg", label: "Digoxin 0.25mg", category: "Heart & Blood Pressure" },
                      { value: "Furosemide 40mg", label: "Furosemide 40mg", category: "Heart & Blood Pressure" },
                      // Digestive
                      { value: "Omeprazole 20mg", label: "Omeprazole 20mg", category: "Digestive" },
                      { value: "Omeprazole 40mg", label: "Omeprazole 40mg", category: "Digestive" },
                      { value: "Pantoprazole 40mg", label: "Pantoprazole 40mg", category: "Digestive" },
                      { value: "Ranitidine 150mg", label: "Ranitidine 150mg", category: "Digestive" },
                      { value: "Esomeprazole 40mg", label: "Esomeprazole 40mg", category: "Digestive" },
                      { value: "Domperidone 10mg", label: "Domperidone 10mg", category: "Digestive" },
                      { value: "Ondansetron 4mg", label: "Ondansetron 4mg", category: "Digestive" },
                      { value: "Loperamide 2mg", label: "Loperamide 2mg", category: "Digestive" },
                      { value: "Antacid Syrup 200ml", label: "Antacid Syrup 200ml", category: "Digestive" },
                      // Respiratory
                      { value: "Cetirizine 10mg", label: "Cetirizine 10mg", category: "Respiratory" },
                      { value: "Loratadine 10mg", label: "Loratadine 10mg", category: "Respiratory" },
                      { value: "Montelukast 10mg", label: "Montelukast 10mg", category: "Respiratory" },
                      { value: "Salbutamol Inhaler 100mcg", label: "Salbutamol Inhaler 100mcg", category: "Respiratory" },
                      { value: "Budesonide Inhaler 200mcg", label: "Budesonide Inhaler 200mcg", category: "Respiratory" },
                      { value: "Cough Syrup 100ml", label: "Cough Syrup 100ml", category: "Respiratory" },
                      { value: "Ambroxol 30mg", label: "Ambroxol 30mg", category: "Respiratory" },
                      { value: "Chlorpheniramine 4mg", label: "Chlorpheniramine 4mg", category: "Respiratory" },
                      { value: "Pseudoephedrine 60mg", label: "Pseudoephedrine 60mg", category: "Respiratory" },
                      // Vitamins
                      { value: "Vitamin C 500mg", label: "Vitamin C 500mg", category: "Vitamins" },
                      { value: "Vitamin C 1000mg", label: "Vitamin C 1000mg", category: "Vitamins" },
                      { value: "Vitamin D3 1000 IU", label: "Vitamin D3 1000 IU", category: "Vitamins" },
                      { value: "Vitamin D3 60000 IU", label: "Vitamin D3 60000 IU", category: "Vitamins" },
                      { value: "Vitamin B Complex", label: "Vitamin B Complex", category: "Vitamins" },
                      { value: "Vitamin E 400 IU", label: "Vitamin E 400 IU", category: "Vitamins" },
                      { value: "Calcium 500mg", label: "Calcium 500mg", category: "Vitamins" },
                      { value: "Iron 65mg", label: "Iron 65mg", category: "Vitamins" },
                      { value: "Zinc 50mg", label: "Zinc 50mg", category: "Vitamins" },
                      { value: "Multivitamin Tablets", label: "Multivitamin Tablets", category: "Vitamins" },
                      { value: "Omega-3 Fish Oil 1000mg", label: "Omega-3 Fish Oil 1000mg", category: "Vitamins" },
                      { value: "Folic Acid 5mg", label: "Folic Acid 5mg", category: "Vitamins" },
                      // Antacids
                      { value: "Digene Gel 200ml", label: "Digene Gel 200ml", category: "Antacids" },
                      { value: "Eno Powder 5g", label: "Eno Powder 5g", category: "Antacids" },
                      { value: "Gelusil Syrup 200ml", label: "Gelusil Syrup 200ml", category: "Antacids" },
                      { value: "Pancreatin Tablets", label: "Pancreatin Tablets", category: "Antacids" },
                      // Antiseptics
                      { value: "Betadine Solution 100ml", label: "Betadine Solution 100ml", category: "Antiseptics" },
                      { value: "Hydrogen Peroxide 100ml", label: "Hydrogen Peroxide 100ml", category: "Antiseptics" },
                      { value: "Dettol Liquid 500ml", label: "Dettol Liquid 500ml", category: "Antiseptics" },
                      { value: "Neosporin Ointment 5g", label: "Neosporin Ointment 5g", category: "Antiseptics" },
                      { value: "Clotrimazole Cream 15g", label: "Clotrimazole Cream 15g", category: "Antiseptics" },
                      { value: "Hydrocortisone Cream 15g", label: "Hydrocortisone Cream 15g", category: "Antiseptics" },
                      { value: "Mupirocin Ointment 5g", label: "Mupirocin Ointment 5g", category: "Antiseptics" },
                      // Cold & Flu
                      { value: "Paracetamol + Caffeine", label: "Paracetamol + Caffeine", category: "Cold & Flu" },
                      { value: "Cold Relief Tablets", label: "Cold Relief Tablets", category: "Cold & Flu" },
                      { value: "Sinarest Tablets", label: "Sinarest Tablets", category: "Cold & Flu" },
                      { value: "Vicks Vaporub 50ml", label: "Vicks Vaporub 50ml", category: "Cold & Flu" },
                      // Mental Health
                      { value: "Fluoxetine 20mg", label: "Fluoxetine 20mg", category: "Mental Health" },
                      { value: "Sertraline 50mg", label: "Sertraline 50mg", category: "Mental Health" },
                      { value: "Escitalopram 10mg", label: "Escitalopram 10mg", category: "Mental Health" },
                      { value: "Alprazolam 0.5mg", label: "Alprazolam 0.5mg", category: "Mental Health" },
                      { value: "Clonazepam 0.5mg", label: "Clonazepam 0.5mg", category: "Mental Health" },
                      { value: "Diazepam 5mg", label: "Diazepam 5mg", category: "Mental Health" },
                      // Thyroid
                      { value: "Levothyroxine 50mcg", label: "Levothyroxine 50mcg", category: "Thyroid" },
                      { value: "Levothyroxine 100mcg", label: "Levothyroxine 100mcg", category: "Thyroid" },
                      { value: "Carbimazole 5mg", label: "Carbimazole 5mg", category: "Thyroid" },
                      // Eye & Ear
                      { value: "Moxifloxacin Eye Drops 5ml", label: "Moxifloxacin Eye Drops 5ml", category: "Eye & Ear Care" },
                      { value: "Timolol Eye Drops 5ml", label: "Timolol Eye Drops 5ml", category: "Eye & Ear Care" },
                      { value: "Artificial Tears 10ml", label: "Artificial Tears 10ml", category: "Eye & Ear Care" },
                      { value: "Ciprofloxacin Ear Drops 10ml", label: "Ciprofloxacin Ear Drops 10ml", category: "Eye & Ear Care" },
                      // Contraceptives
                      { value: "Oral Contraceptive Pills", label: "Oral Contraceptive Pills", category: "Contraceptives" },
                      { value: "Emergency Contraceptive", label: "Emergency Contraceptive", category: "Contraceptives" },
                      // Skin Care
                      { value: "Tretinoin Cream 0.025%", label: "Tretinoin Cream 0.025%", category: "Skin Care" },
                      { value: "Benzoyl Peroxide Gel 2.5%", label: "Benzoyl Peroxide Gel 2.5%", category: "Skin Care" },
                      { value: "Calamine Lotion 100ml", label: "Calamine Lotion 100ml", category: "Skin Care" },
                      { value: "Moisturizing Cream 50g", label: "Moisturizing Cream 50g", category: "Skin Care" },
                      // Others
                      { value: "Antihistamine Tablets", label: "Antihistamine Tablets", category: "Other" },
                      { value: "Antifungal Cream 15g", label: "Antifungal Cream 15g", category: "Other" },
                      { value: "Oral Rehydration Salts", label: "Oral Rehydration Salts", category: "Other" },
                      { value: "Activated Charcoal 250mg", label: "Activated Charcoal 250mg", category: "Other" },
                      { value: "Glycerin Suppository", label: "Glycerin Suppository", category: "Other" }
                    ]}
                  />
                </div>
                <div className="form-group">
                  <label>Generic Name</label>
                  <input
                    type="text"
                    value={newProduct.genericName}
                    onChange={(e) => setNewProduct({...newProduct, genericName: e.target.value})}
                    placeholder="Enter generic name (e.g., Acetaminophen)"
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
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Painkillers">Painkillers</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Heart & Blood Pressure">Heart & Blood Pressure</option>
                    <option value="Digestive">Digestive</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Vitamins">Vitamins</option>
                    <option value="Antacids">Antacids</option>
                    <option value="Antiseptics">Antiseptics</option>
                    <option value="Cold & Flu">Cold & Flu</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Thyroid">Thyroid</option>
                    <option value="Eye & Ear Care">Eye & Ear Care</option>
                    <option value="Contraceptives">Contraceptives</option>
                    <option value="Skin Care">Skin Care</option>
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
                    onChange={(e) => setNewProduct({...newProduct, quantity: parseInt(e.target.value) || 0})}
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
                    step="1"
                    value={newProduct.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string or valid integers
                      if (value === '' || /^\d*$/.test(value)) {
                        setNewProduct({...newProduct, price: value === '' ? 0 : parseInt(value, 10)});
                      }
                    }}
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

  const renderAIAnalytics = () => {
    return (
      <div className="section-content">
        <div className="ai-analytics-header">
          <div className="ai-analytics-title">
            <div className="ai-icon-large">🤖</div>
            <div>
              <h2>AI Analytics Suite</h2>
              <p className="ai-subtitle">Intelligent insights for inventory, expiry, and demand forecasting</p>
            </div>
          </div>
          <button 
            className="sidebar-btn" 
            onClick={() => {
              console.log('🔄 Manual refresh with retrain triggered');
              fetchAIPredictions(true);
            }}
            style={{marginLeft: 'auto'}}
          >
            🔄 Retrain & Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="ai-tabs">
          <button 
            className={`ai-tab ${aiActiveTab === 'expiry' ? 'active' : ''}`}
            onClick={() => setAiActiveTab('expiry')}
          >
            ⚠️ Expiry Prediction
          </button>
          <button 
            className={`ai-tab ${aiActiveTab === 'demand' ? 'active' : ''}`}
            onClick={() => setAiActiveTab('demand')}
          >
            📊 Demand Forecast
          </button>
        </div>

        {/* Expiry Prediction Tab */}
        {aiActiveTab === 'expiry' && (
          <>
            {/* Summary Cards */}
            {aiPredictions && aiPredictions.predictions && aiPredictions.predictions.length > 0 ? (
              <>
                <div className="ai-summary-cards">
                  <div className="ai-summary-card critical">
                    <div className="ai-summary-number">{aiPredictions.criticalRisk || 0}</div>
                    <div className="ai-summary-label">CRITICAL RISK ITEMS</div>
                  </div>
                  <div className="ai-summary-card high">
                    <div className="ai-summary-number">{aiPredictions.highRisk || 0}</div>
                    <div className="ai-summary-label">HIGH RISK ITEMS</div>
                  </div>
                  <div className="ai-summary-card value">
                    <div className="ai-summary-number">Rs {(aiPredictions.totalValueAtRisk || 0).toLocaleString()}</div>
                    <div className="ai-summary-label">TOTAL VALUE AT RISK</div>
                  </div>
                </div>

                {/* Expiry Risk Table */}
                <div className="dashboard-card" style={{marginTop: '24px'}}>
                  <div className="card-header">
                    <h3>Top Items at Risk of Expiry</h3>
                  </div>
                  <div className="table-container">
                    <table className="expiry-risk-table">
                      <thead>
                        <tr>
                          <th>PRODUCT</th>
                          <th>CURRENT STOCK</th>
                          <th>DAYS LEFT</th>
                          <th>RISK SCORE</th>
                          <th>AI RECOMMENDATION</th>
                          <th>PROMOTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiPredictions.predictions.map((pred, index) => (
                          <tr key={index}>
                            <td>
                              <div className="product-cell">
                                <div className="product-name-expiry">{pred.productName}</div>
                                <div className="product-batch">Batch: {pred.batchNumber}</div>
                              </div>
                            </td>
                            <td>
                              <div className="stock-cell">
                                <div className="stock-units">{pred.currentStock} units</div>
                              </div>
                            </td>
                            <td>
                              <span className={`days-badge ${pred.daysUntilExpiry < 0 ? 'expired' : pred.daysUntilExpiry < 30 ? 'critical' : 'warning'}`}>
                                {pred.daysUntilExpiry < 0 ? `${Math.abs(pred.daysUntilExpiry)} days` : `${pred.daysUntilExpiry} days`}
                              </span>
                            </td>
                            <td>
                              <div className="risk-score-cell">
                                <div className="risk-bar-container">
                                  <div 
                                    className="risk-bar-fill" 
                                    style={{
                                      width: `${pred.riskScore}%`,
                                      backgroundColor: pred.riskLevel === 'Critical' ? '#ef4444' : pred.riskLevel === 'High' ? '#f59e0b' : pred.riskLevel === 'Medium' ? '#eab308' : '#10b981'
                                    }}
                                  ></div>
                                </div>
                                <span className="risk-score-text">{pred.riskScore}/100 ({pred.riskLevel})</span>
                              </div>
                            </td>
                            <td>
                              <div className="recommendation-cell">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{flexShrink: 0}}>
                                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                                  <path d="M2 17l10 5 10-5"/>
                                  <path d="M2 12l10 5 10-5"/>
                                </svg>
                                <span>{pred.recommendation}</span>
                              </div>
                            </td>
                            <td>
                              {pred.daysUntilExpiry < 0 ? (
                                <button 
                                  className="promo-btn dispose"
                                  onClick={() => handleDisposeProduct(pred.productId, pred.productName)}
                                >
                                  🗑️ Dispose
                                </button>
                              ) : pred.currentStock === 0 ? (
                                <span className="promo-status" style={{color: '#64748b'}}>
                                  📦 Out of Stock
                                </span>
                              ) : pred.isPromoted ? (
                                <span className="promo-status active">
                                  🟢 {pred.discountPercentage}% Active
                                  <button 
                                    className="promo-remove"
                                    onClick={() => handleRemovePromotion(pred.productId)}
                                  >
                                    Remove Promo
                                  </button>
                                </span>
                              ) : pred.riskLevel === 'Critical' || pred.riskLevel === 'High' ? (
                                <div className="promo-input-group">
                                  <input 
                                    type="number" 
                                    className="promo-input" 
                                    id={`discount-${pred.productId}`}
                                    defaultValue={Math.round((pred.riskScore / 100) * 30)} 
                                    min="0" 
                                    max="100" 
                                  />
                                  <span className="promo-percent">%</span>
                                  <button 
                                    className="promo-btn apply"
                                    onClick={() => {
                                      const discountInput = document.getElementById(`discount-${pred.productId}`);
                                      const discount = discountInput ? discountInput.value : 20;
                                      handleApplyPromotion(pred.productId, discount);
                                    }}
                                  >
                                    Apply
                                  </button>
                                </div>
                              ) : (
                                <span className="promo-status">No promotion</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : aiPredictions === null ? (
              <div className="ai-empty-state-large">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <h3>ML Backend Offline</h3>
                <p>Start the ML server to see AI predictions</p>
                <button className="sidebar-btn" style={{marginTop: '16px'}} onClick={fetchAIPredictions}>
                  🔄 Retry Connection
                </button>
              </div>
            ) : (
              <div className="ai-empty-state-large">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <h3>No High-Risk Items</h3>
                <p>All products are within safe expiry ranges!</p>
              </div>
            )}
          </>
        )}

        {/* Demand Forecast Tab */}
        {aiActiveTab === 'demand' && (
          <>
            {/* Summary Cards */}
            <div className="ai-summary-cards">
              <div className="ai-summary-card high">
                <div className="ai-summary-number">{demandPredictions.length > 0 ? demandPredictions.length : 0}</div>
                <div className="ai-summary-label">PRODUCTS ANALYZED</div>
              </div>
              <div className="ai-summary-card critical">
                <div className="ai-summary-number">{demandPredictions.filter(p => (p.predicted30DayDemand || 0) > 0).length}</div>
                <div className="ai-summary-label">TRENDING PRODUCTS IDENTIFIED</div>
              </div>
              <div className="ai-summary-card value">
                <div className="ai-summary-number">
                  {demandPredictions.length > 0 
                    ? `${Math.round(demandPredictions.reduce((sum, p) => sum + (p.predicted30DayDemand || 0), 0) / demandPredictions.length)} units/mo`
                    : '0 units/mo'
                  }
                </div>
                <div className="ai-summary-label">AVG MONTHLY DEMAND</div>
              </div>
            </div>

            {/* Demand Forecast Table */}
            <div className="dashboard-card" style={{marginTop: '24px'}}>
              <div className="card-header">
                <h3>Top Forecasted Demand</h3>
              </div>
              {demandPredictions.length > 0 ? (
                <div className="table-container">
                  <table className="expiry-risk-table">
                    <thead>
                      <tr>
                        <th>PRODUCT (CATEGORY)</th>
                        <th>CURRENT STOCK</th>
                        <th>PREDICTED 30 DAY DEMAND</th>
                        <th>MARKET TREND</th>
                        <th>STOCKOUT RISK</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandPredictions.slice(0, 10).map((prediction, index) => {
                        const currentStock = prediction.currentStock || 0;
                        const predictedDemand = prediction.predicted30DayDemand || 0;
                        const stockoutRisk = prediction.stockoutRisk || 'Low';
                        const daysUntilStockout = Math.floor(prediction.daysUntilStockout || 999);
                        const avgDailySales = predictedDemand > 0 ? (predictedDemand / 30).toFixed(1) : 0;
                        
                        return (
                          <tr key={index}>
                            <td>
                              <div className="product-cell">
                                <div className="product-name-expiry">{prediction.productName}</div>
                                <div className="product-batch">General</div>
                              </div>
                            </td>
                            <td>
                              <div className="stock-cell">
                                <div className="stock-units">{currentStock} units</div>
                                <div className="stock-value-text">Avg Sales: {avgDailySales} units/day</div>
                              </div>
                            </td>
                            <td>
                              <div className="stock-cell">
                                <div className="stock-units" style={{color: '#2563eb', fontWeight: 700}}>{predictedDemand} units/mo</div>
                                <div className="stock-value-text">Revenue: Rs {(predictedDemand * 50).toLocaleString()}</div>
                              </div>
                            </td>
                            <td>
                              <span className="days-badge" style={{
                                background: stockoutRisk === 'High' ? '#fee2e2' : stockoutRisk === 'Medium' ? '#fef3c7' : '#dcfce7',
                                color: stockoutRisk === 'High' ? '#dc2626' : stockoutRisk === 'Medium' ? '#d97706' : '#16a34a'
                              }}>
                                {stockoutRisk === 'High' ? 'Increasing' : stockoutRisk === 'Medium' ? 'Moderate' : 'Stable'}
                              </span>
                            </td>
                            <td>
                              <div className="recommendation-cell">
                                {stockoutRisk === 'High' ? (
                                  <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{flexShrink: 0}}>
                                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                      <line x1="12" y1="9" x2="12" y2="13"/>
                                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                                    </svg>
                                    <span style={{color: '#ef4444', fontWeight: 600}}>Out in {daysUntilStockout} days</span>
                                  </>
                                ) : stockoutRisk === 'Medium' ? (
                                  <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{flexShrink: 0}}>
                                      <circle cx="12" cy="12" r="10"/>
                                      <line x1="12" y1="8" x2="12" y2="12"/>
                                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                    <span style={{color: '#f59e0b', fontWeight: 600}}>Out in {daysUntilStockout} days</span>
                                  </>
                                ) : (
                                  <>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" style={{flexShrink: 0}}>
                                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                      <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                    <span style={{color: '#10b981', fontWeight: 600}}>Stock sufficient</span>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{margin: '0 auto 16px'}}>
                    <path d="M3 3v18h18"/>
                    <path d="M18 17V9"/>
                    <path d="M13 17V5"/>
                    <path d="M8 17v-3"/>
                  </svg>
                  <p style={{fontSize: '16px', marginBottom: '8px'}}>No AI Demand Predictions Available</p>
                  <p style={{fontSize: '14px', color: '#94a3b8'}}>Click "Train AI Model" to generate demand forecasts</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const createPurchaseRequest = async (suggestion) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('http://localhost:3001/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: suggestion.productId,
          productName: suggestion.productName,
          suggestedOrderQty: suggestion.suggestedOrderQty,
          estimatedCost: suggestion.estimatedCost
        })
      });
      
      if (!res.ok) throw new Error("Failed to create purchase request");
      
      const data = await res.json();
      setPurchaseOrders([data.po, ...purchaseOrders]);
      
      // Refresh AI predictions to remove this product from suggestions
      fetchAIPredictions();
      
      alert(`✅ Purchase request created for ${suggestion.productName}! It's now in your 'Pending Deliveries' list.`);
    } catch (error) {
      console.error("PO Creation error:", error);
      alert(`❌ Error creating request: ${error.message}`);
    }
  };

  const fulfillOrder = async (poId) => {
    const token = localStorage.getItem('authToken');
    
    try {
      console.log(`🔄 Attempting to fulfill PO: ${poId}`);
      
      const res = await fetch(`http://localhost:3001/api/purchase-orders/${poId}/fulfill`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      console.log(`📡 Response status: ${res.status}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Fulfillment failed:", errorData);
        
        // Provide more helpful error message
        if (res.status === 500) {
          alert(`❌ Server Error: Unable to process the request. This might be due to:\n• Database connection issue\n• Product not found\n• Invalid purchase order\n\nPlease try refreshing the page and try again.`);
        } else {
          alert(`❌ Error restocking: ${errorData.message || 'Unknown error'}`);
        }
        return;
      }

      const data = await res.json();
      console.log("✅ Fulfillment successful:", data);
      
      // Update local state
      setPurchaseOrders(purchaseOrders.map(po => po._id === poId ? data.po : po));
      fetchProducts();
      
      // Refresh AI predictions to update suggestions
      fetchAIPredictions();
      
      // Show success message
      alert(`🎉 Successfully restocked ${data.po.productName}! Stock has been updated to ${data.product.quantity} units.`);
      
    } catch (error) {
      console.error("❌ Network error:", error);
      alert(`❌ Network Error: Unable to connect to server. Please check:\n• Server is running\n• Internet connection\n• Try refreshing the page\n\nError: ${error.message}`);
    }
  };

  const ProcurementView = ({ purchaseOrders, createPurchaseRequest, fulfillOrder }) => {
    const [reorderData, setReorderData] = useState(null);
    const [loading, setLoading] = useState(false);

    const pendingPOs = Array.isArray(purchaseOrders) ? purchaseOrders.filter(po => po.status === 'Pending') : [];
    const completedPOs = Array.isArray(purchaseOrders) ? purchaseOrders.filter(po => po.status === 'Received') : [];

    useEffect(() => {
      const fetchReorder = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('authToken');
          const res = await fetch('http://localhost:3001/api/ai/reorder-suggestions', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const result = await res.json();
          setReorderData(result);
        } catch (err) {
          console.error(err);
        }
        setLoading(false);
      };
      fetchReorder();
    }, [purchaseOrders.length]); // Refetch when purchase orders change

    return (
      <div className="section-content">
        <div className="section-header-page">
          <h2>📦 Reorder Suggestions & Restocking</h2>
          <p className="section-subtitle">Turn AI reorder suggestions into active inventory restocks</p>
        </div>

        {/* PENDING DELIVERIES SECTION */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🚚 Pending Deliveries ({pendingPOs.length})
          </h3>
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>PO #</th>
                  <th>Product</th>
                  <th>Expected Qty</th>
                  <th>Requested Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingPOs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No pending deliveries. Use the suggestions below to order more stock.
                    </td>
                  </tr>
                ) : (
                  pendingPOs.map((po) => (
                    <tr key={po._id}>
                      <td><strong>{po.poNumber}</strong></td>
                      <td>{po.productName}</td>
                      <td><span style={{ color: '#2563eb', fontWeight: 'bold' }}>+{po.suggestedOrderQty} units</span></td>
                      <td>{new Date(po.createdAt || po.orderDate).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="submit-btn" 
                          style={{ padding: '6px 12px', fontSize: '12px', width: 'auto' }}
                          onClick={() => fulfillOrder(po._id)}
                        >
                          ✅ Confirm Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI SUGGESTIONS SECTION */}
        <div style={{ marginBottom: '30px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginBottom: '15px', color: '#1e293b' }}>🤖 Smart Reorder Suggestions</h3>
          {loading ? (
             <div className="loading-state"><div className="spinner"></div><p>Calculating reorder points...</p></div>
          ) : (
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock / Reorder Pt</th>
                    <th>Suggested Qty</th>
                    <th>Est. Cost</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(reorderData?.suggestions || []).map((item, idx) => (
                    <tr key={idx}>
                      <td><strong>{item.productName}</strong><br/><small>{item.category}</small></td>
                      <td>{item.currentStock} / {item.reorderPoint}</td>
                      <td><span style={{ color: '#059669', fontWeight: 'bold' }}>+{item.suggestedOrderQty}</span></td>
                      <td>₨ {(item.estimatedCost || 0).toLocaleString()}</td>
                      <td>
                        <button 
                          onClick={() => createPurchaseRequest(item)}
                          style={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          🛒 Create Purchase Request
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!reorderData?.suggestions || reorderData.suggestions.length === 0) && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Your inventory is currently optimal!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RESTOCK HISTORY LOG */}
        <div>
          <h3 style={{ marginBottom: '15px', color: '#64748b' }}>📜 Restock History (Last 5)</h3>
          <div className="products-table-container">
            <table className="products-table" style={{ opacity: 0.8 }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty Received</th>
                  <th>Received At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedPOs.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '15px' }}>No completed restocks yet.</td></tr>
                ) : (
                  completedPOs.slice(0, 5).map(po => (
                    <tr key={po._id}>
                      <td>{po.productName}</td>
                      <td><strong>+{po.suggestedOrderQty}</strong></td>
                      <td>{new Date(po.receivedAt).toLocaleString()}</td>
                      <td><span className="status-badge" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>Completed</span></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
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
          {!isPharmacist && (
            <div className={`nav-item ${activeSection === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveSection('suppliers')}>
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
              <span className="nav-text">Suppliers</span>
            </div>
          )}
          {!isPharmacist && (
            <div className={`nav-item ${activeSection === 'customers' ? 'active' : ''}`} onClick={() => setActiveSection('customers')}>
              <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span className="nav-text">Customers</span>
            </div>
          )}
          <div className={`nav-item ${activeSection === 'procurement' ? 'active' : ''}`} onClick={() => setActiveSection('procurement')}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
            </svg>
            <span className="nav-text">Reorder Suggestions</span>
          </div>
          <div className={`nav-item ${activeSection === 'ai-analytics' ? 'active' : ''}`} onClick={() => setActiveSection('ai-analytics')}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span className="nav-text">AI Analytics</span>
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
                {((stats?.expiringItems || 0) + (stats?.predictedShortages || 0)) > 0 && (
                  <span className="notification-badge">{(stats?.expiringItems || 0) + (stats?.predictedShortages || 0)}</span>
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
                        setActiveSection('inventory');
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
                  {stats?.predictedShortages > 0 && (
                    <div className="notification-item warning" onClick={() => {
                      setActiveSection('inventory');
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
                        <div className="notification-text">{stats.predictedShortages} items need reordering</div>
                      </div>
                    </div>
                  )}
                  {stats?.expiringItems > 0 && (
                    <div className="notification-item danger" onClick={() => {
                      setActiveSection('inventory');
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
                        <div className="notification-text">{stats.expiringItems} items expiring within 90 days</div>
                      </div>
                    </div>
                  )}
                  {(!stats?.predictedShortages && !stats?.expiringItems) && (
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
          {renderContent()}
        </div>

        {/* FOOTER */}
        <footer className="dashboard-footer">
          <p>© 2024 MediTrust. All rights reserved.</p>
        </footer>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onScan={handleQRScan}
        onClose={() => setShowQRScanner(false)}
      />

      {/* Quantity Dialog Modal for QR Scanning */}
      {showQuantityDialog && foundProduct && (
        <div className="modal-overlay" onClick={handleQuantityCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>📦 Add Product to Inventory</h3>
              <button className="close-btn" onClick={handleQuantityCancel}>×</button>
            </div>
            
            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #dee2e6', 
                borderRadius: '8px', 
                padding: '15px', 
                marginBottom: '20px' 
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>✅ Product Found!</h4>
                <div><strong>Name:</strong> {foundProduct.name}</div>
                <div><strong>Current Stock:</strong> {foundProduct.quantity} units</div>
                <div><strong>Price:</strong> Rs. {Math.round(foundProduct.price)}</div>
                {foundProduct.expiryDate && (
                  <div><strong>Expiry:</strong> {new Date(foundProduct.expiryDate).toLocaleDateString()}</div>
                )}
              </div>
              
              <div>
                <label htmlFor="quantityInput" style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold',
                  color: '#495057'
                }}>
                  How many units to add to inventory?
                </label>
                <input
                  id="quantityInput"
                  type="number"
                  min="1"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #007bff',
                    borderRadius: '6px',
                    fontSize: '16px',
                    marginBottom: '20px'
                  }}
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleQuantityConfirm();
                    }
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleQuantityCancel}
                  style={{
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuantityConfirm}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ✅ Add {quantityToAdd} Units
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR View Modal */}
      {showQRView && (
        <div className="modal-overlay" onClick={() => setShowQRView(false)}>
          <div className="modal-content qr-view-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏷️ Product QR Codes</h3>
              <button className="close-btn" onClick={() => setShowQRView(false)}>×</button>
            </div>
            
            <div className="qr-view-content">
              {selectedProductForQR ? (
                <div className="single-qr-view">
                  <h4>QR Code for: {selectedProductForQR.name}</h4>
                  <ProductQR product={selectedProductForQR} size={200} showInfo={true} />
                </div>
              ) : (
                <div className="all-qr-view">
                  <h4>All Product QR Codes</h4>
                  <div className="qr-grid">
                    {products.map((product) => (
                      <ProductQR 
                        key={product._id} 
                        product={product} 
                        size={150} 
                        showInfo={true} 
                      />
                    ))}
                  </div>
                  {products.length === 0 && (
                    <p style={{textAlign: 'center', color: '#666', padding: '40px'}}>
                      No products available. Add products to generate QR codes.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI CHATBOT */}
      <AIChatbot />
    </div>
  );
}