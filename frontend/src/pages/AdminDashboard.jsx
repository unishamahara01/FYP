import React from 'react';
import './AdminDashboard.css';
import { renderModals } from './AdminDashboardModals';
import AdminReportsPage from './AdminReportsPage';
import SuppliersPage from './SuppliersPage';
import CustomersPage from './CustomersPage';

const AdminDashboard = ({ onLogout, onAccountSettings }) => {
  const [activeTab, setActiveTab] = React.useState('users');
  const [users, setUsers] = React.useState([]);
  const [departments, setDepartments] = React.useState([]);
  const [pharmacies, setPharmacies] = React.useState([]);
  const [suppliers, setSuppliers] = React.useState([]);
  const [customers, setCustomers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // AI Analytics state
  const [aiPredictions, setAiPredictions] = React.useState(null);
  const [demandPredictions, setDemandPredictions] = React.useState([]);
  const [aiActiveTab, setAiActiveTab] = React.useState('expiry');
  
  // Modal states
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState(null);
  
  // Form states
  const [formData, setFormData] = React.useState({});
  const [formErrors, setFormErrors] = React.useState({});

  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Fetch AI predictions when AI Analytics tab is active
  React.useEffect(() => {
    if (activeTab === 'ai-analytics') {
      fetchAIPredictions();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch data on component mount and tab change
  React.useEffect(() => {
    setSearchQuery(''); // Reset search when changing tabs
    fetchData();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch counts for stats cards on mount
  React.useEffect(() => {
    fetchAllCounts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAllCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch all counts in parallel
      const [usersRes, deptRes, pharmRes, suppRes, custRes] = await Promise.all([
        fetch('http://localhost:3001/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/admin/departments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/admin/pharmacies', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/suppliers', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3001/api/customers', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []));
      }
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(Array.isArray(data.departments) ? data.departments : (Array.isArray(data) ? data : []));
      }
      if (pharmRes.ok) {
        const data = await pharmRes.json();
        setPharmacies(Array.isArray(data.pharmacies) ? data.pharmacies : (Array.isArray(data) ? data : []));
      }
      if (suppRes.ok) {
        const data = await suppRes.json();
        setSuppliers(Array.isArray(data) ? data : []);
      }
      if (custRes.ok) {
        const data = await custRes.json();
        setCustomers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching counts:', error);
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('token');
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
      } else {
        alert(`❌ Failed to dispose product: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Dispose error:', err);
      alert(`❌ Error disposing product: ${err.message}`);
    }
  };

  const fetchData = async () => {
    if (activeTab === 'reports' || activeTab === 'suppliers' || activeTab === 'customers' || activeTab === 'ai-analytics') return; // These pages handle their own data fetching
    
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        setError('Please login to access admin dashboard');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost:3001/api/admin/${activeTab}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError(`Access denied. Admin role required. Your role: ${user.role || 'Unknown'}`);
        } else {
          throw new Error(`Failed to fetch ${activeTab}: ${response.status} ${response.statusText}`);
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (activeTab === 'users') {
        setUsers(Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []));
      } else if (activeTab === 'departments') {
        setDepartments(Array.isArray(data.departments) ? data.departments : (Array.isArray(data) ? data : []));
        // Pre-fetch users globally to populate the new Manager Dropdown dynamically!
        try {
          const userRes = await fetch('http://localhost:3001/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            setUsers(Array.isArray(userData.users) ? userData.users : (Array.isArray(userData) ? userData : []));
          }
        } catch (e) {
          console.error("Silent err fetching dropdown users", e);
        }
      } else if (activeTab === 'pharmacies') {
        setPharmacies(Array.isArray(data.pharmacies) ? data.pharmacies : (Array.isArray(data) ? data : []));
      } else if (activeTab === 'suppliers') {
        setSuppliers(Array.isArray(data.suppliers) ? data.suppliers : (Array.isArray(data) ? data : []));
      } else if (activeTab === 'customers') {
        setCustomers(Array.isArray(data.customers) ? data.customers : (Array.isArray(data) ? data : []));
      }
    } catch (err) {
      setError(err.message);
      console.error(`❌ Error fetching ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/${activeTab}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add ${activeTab.slice(0, -1)}`);
      }

      setShowAddModal(false);
      setFormData({});
      fetchData();
    } catch (err) {
      setFormErrors({ general: err.message });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/${activeTab}/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update ${activeTab.slice(0, -1)}`);
      }

      setShowEditModal(false);
      setEditingItem(null);
      setFormData({});
      fetchData();
    } catch (err) {
      setFormErrors({ general: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/admin/${activeTab}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${activeTab.slice(0, -1)}`);
      }

      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    
    // Handle nested objects for pharmacy data
    if (activeTab === 'pharmacies') {
      setFormData({
        ...item,
        // Ensure address object exists
        address: item.address || {},
        // Ensure contact object exists  
        contact: item.contact || {},
        // Ensure license object exists
        license: item.license || {},
        // Backward compatibility fields
        phone: item.contact?.phone || item.phone || '',
        email: item.contact?.email || item.email || '',
        licenseNumber: item.license?.number || item.licenseNumber || ''
      });
    } else {
      setFormData({ ...item });
    }
    
    setShowEditModal(true);
  };

  // Fetch data on component mount and tab change
  React.useEffect(() => {
    fetchData();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderFormFields = (isEdit) => {
    if (activeTab === 'users') {
      return (
        <>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          {!isEdit && (
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Role</label>
            <select
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
        </>
      );
    } else if (activeTab === 'departments') {
      return (
        <>
          <div className="form-group">
            <label>Department Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Manager</label>
            <select
              value={formData.manager || ''}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            >
              <option value="">No Manager Assigned (Optional)</option>
              {Array.isArray(users) && users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.fullName} ({user.role || 'Staff'})
                </option>
              ))}
            </select>
          </div>
        </>
      );
    } else if (activeTab === 'pharmacies') {
      return (
        <>
          <div className="form-group">
            <label>Pharmacy Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Pharmacy Code</label>
            <input
              type="text"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., PH001"
              required
            />
          </div>
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              value={formData.address?.street || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, street: e.target.value }
              })}
              placeholder="Street address"
              required
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={formData.address?.city || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, city: e.target.value }
              })}
              placeholder="e.g., Kathmandu, Pokhara"
              required
            />
          </div>
          <div className="form-group">
            <label>Province</label>
            <select
              value={formData.address?.state || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                address: { ...formData.address, state: e.target.value }
              })}
              required
            >
              <option value="">Select Province</option>
              <option value="Province No. 1 (Koshi)">Province No. 1 (Koshi)</option>
              <option value="Madhesh Province">Madhesh Province</option>
              <option value="Bagmati Province">Bagmati Province</option>
              <option value="Gandaki Province">Gandaki Province</option>
              <option value="Lumbini Province">Lumbini Province</option>
              <option value="Karnali Province">Karnali Province</option>
              <option value="Sudurpashchim Province">Sudurpashchim Province</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              value={formData.contact?.phone || formData.phone || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                contact: { ...formData.contact, phone: e.target.value },
                phone: e.target.value // For backward compatibility
              })}
              placeholder="e.g., +977-1-4567890"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.contact?.email || formData.email || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                contact: { ...formData.contact, email: e.target.value },
                email: e.target.value // For backward compatibility
              })}
              placeholder="Email address"
            />
          </div>
          <div className="form-group">
            <label>License Number</label>
            <input
              type="text"
              value={formData.license?.number || formData.licenseNumber || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                license: { ...formData.license, number: e.target.value },
                licenseNumber: e.target.value // For backward compatibility
              })}
              placeholder="License number"
              required
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              value={formData.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              required
            >
              <option value="">Select Department</option>
              {Array.isArray(departments) && departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </>
      );
    }
  };

  const getStatsData = () => {
    return {
      users: users.length,
      departments: departments.length,
      pharmacies: pharmacies.length,
      suppliers: suppliers.length,
      customers: customers.length,
      activeUsers: Array.isArray(users) ? users.filter(u => u.status === 'Active').length : 0
    };
  };

  const renderStatsCards = () => {
    const stats = getStatsData();
    
    return (
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon users">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-number">{stats.users}</div>
            <div className="admin-stat-label">Total Users</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon departments">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-number">{stats.departments}</div>
            <div className="admin-stat-label">Departments</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon pharmacies">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-number">{stats.pharmacies}</div>
            <div className="admin-stat-label">Pharmacies</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon suppliers" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-number">{stats.suppliers}</div>
            <div className="admin-stat-label">Suppliers</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon customers" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-number">{stats.customers}</div>
            <div className="admin-stat-label">Customers</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <div className="admin-stat-content">
            <div className="admin-stat-number">{stats.activeUsers}</div>
            <div className="admin-stat-label">Active Users</div>
          </div>
        </div>
      </div>
    );
  };
  const renderTable = () => {
    let data = [];
    let columns = [];

    if (activeTab === 'users') {
      data = users;
      columns = ['Full Name', 'Email', 'Role', 'Status', 'Actions'];
    } else if (activeTab === 'departments') {
      data = departments;
      columns = ['Name', 'Description', 'Manager', 'Status', 'Actions'];
    } else if (activeTab === 'pharmacies') {
      data = pharmacies;
      columns = ['Name', 'Address', 'Phone', 'License', 'Department', 'Actions'];
    }

    // Filter data based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(item => {
        if (activeTab === 'users') {
          return (
            item.fullName?.toLowerCase().includes(query) ||
            item.email?.toLowerCase().includes(query) ||
            item.role?.toLowerCase().includes(query)
          );
        } else if (activeTab === 'departments') {
          return (
            item.name?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.manager?.fullName?.toLowerCase().includes(query)
          );
        } else if (activeTab === 'pharmacies') {
          return (
            item.name?.toLowerCase().includes(query) ||
            item.code?.toLowerCase().includes(query) ||
            item.contact?.phone?.includes(query) ||
            item.phone?.includes(query)
          );
        }
        return false;
      });
    }

    return (
      <div className="admin-table-container">
        <table className="admin-data-table">
          <thead>
            <tr>
              {Array.isArray(columns) && columns.map(col => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="admin-no-data">
                  <div className="admin-empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                    <p>No {activeTab} found</p>
                    <button 
                      className="admin-add-first-btn"
                      onClick={() => {
                        if (activeTab === 'pharmacies') {
                          setFormData({
                            address: {},
                            contact: {},
                            license: {}
                          });
                        } else {
                          setFormData({});
                        }
                        setShowAddModal(true);
                      }}
                    >
                      Add First {activeTab.slice(0, -1)}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              Array.isArray(data) && data.map(item => (
                <tr key={item._id}>
                  {activeTab === 'users' && (
                    <>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-user-avatar">
                            {item.fullName?.charAt(0)?.toUpperCase() || item.email?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <span>{item.fullName || item.email?.split('@')[0]}</span>
                        </div>
                      </td>
                      <td>{item.email}</td>
                      <td>
                        <span className={`admin-role-badge ${item.role?.toLowerCase()}`}>
                          {item.role}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status-badge ${item.status === 'Active' ? 'active' : 'inactive'}`}>
                          {item.status || 'Active'}
                        </span>
                      </td>
                    </>
                  )}
                  {activeTab === 'departments' && (
                    <>
                      <td>
                        <div className="admin-dept-cell">
                          <div className="admin-dept-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            </svg>
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td>{item.description || 'No description'}</td>
                      <td>{item.manager?.fullName || 'Not assigned'}</td>
                      <td>
                        <span className={`admin-status-badge ${item.status === 'Active' ? 'active' : 'inactive'}`}>
                          {item.status || 'Active'}
                        </span>
                      </td>
                    </>
                  )}
                  {activeTab === 'pharmacies' && (
                    <>
                      <td>
                        <div className="admin-pharmacy-cell">
                          <div className="admin-pharmacy-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                            </svg>
                          </div>
                          <div>
                            <div className="admin-pharmacy-name">{item.name}</div>
                            <div className="admin-pharmacy-license">License: {item.licenseNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {typeof item.address === 'object' && item.address ? 
                          `${item.address.street || ''}, ${item.address.city || ''}, ${item.address.state || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') || 'No address'
                          : item.address || 'No address'
                        }
                      </td>
                      <td>{item.contact?.phone || item.phone || 'No phone'}</td>
                      <td>{item.license?.number || item.licenseNumber || 'No license'}</td>
                      <td>{item.department?.name || 'Not assigned'}</td>
                    </>
                  )}
                  <td>
                    <div className="admin-action-buttons">
                      <button
                        className="admin-edit-btn"
                        onClick={() => openEditModal(item)}
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        className="admin-delete-btn"
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

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
                  <p style={{fontSize: '14px', color: '#94a3b8'}}>Click "Retrain & Refresh" to generate demand forecasts</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="admin-dashboard-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <svg className="logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span className="logo-text">MediTrust</span>
          </div>
        </div>

        <div className="sidebar-nav">
          <div 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="nav-text">Users</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="9" x2="15" y2="9"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <span className="nav-text">Departments</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'pharmacies' ? 'active' : ''}`}
            onClick={() => setActiveTab('pharmacies')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span className="nav-text">Pharmacies</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'suppliers' ? 'active' : ''}`}
            onClick={() => setActiveTab('suppliers')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
            <span className="nav-text">Suppliers</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span className="nav-text">Customers</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span className="nav-text">Reports</span>
          </div>

          <div 
            className={`nav-item ${activeTab === 'ai-analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai-analytics')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <span className="nav-text">AI Analytics</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-sidebar">
            <div className="user-avatar-sidebar">
              {currentUser.fullName?.charAt(0)?.toUpperCase() || currentUser.email?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="user-info-sidebar">
              <div className="user-name-sidebar">
                {currentUser.fullName || currentUser.email?.split('@')[0] || 'Admin'}
              </div>
              <div className="user-role-sidebar">{currentUser.role || 'Administrator'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1>Admin Dashboard</h1>
              <p>Manage users, departments, and pharmacies across your organization</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="admin-error-banner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>{error}</span>
            {(error.includes('Admin role required') || error.includes('Please login')) && (
              <button 
                className="admin-login-btn"
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:3001/api/auth/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email: 'admin@meditrust.com',
                        password: 'password123'
                      })
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      localStorage.setItem('token', data.token);
                      localStorage.setItem('user', JSON.stringify(data.user));
                      setError('');
                      fetchData();
                    }
                  } catch (err) {
                    console.error('Login error:', err);
                  }
                }}
              >
                Login as Admin
              </button>
            )}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <div className="dashboard-body">
          {/* Stats Cards - only show on Users tab */}
          {activeTab === 'users' && renderStatsCards()}

          {/* Content Section */}
          {activeTab === 'ai-analytics' ? (
            // AI Analytics - no header, just render the content
            renderAIAnalytics()
          ) : (
            <div className="admin-content-section">
              <div className="admin-content-header">
                <h2>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {activeTab === 'users' && (
                      <>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </>
                    )}
                    {activeTab === 'departments' && (
                      <>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="9" y1="9" x2="15" y2="9"/>
                        <line x1="9" y1="15" x2="15" y2="15"/>
                      </>
                    )}
                    {activeTab === 'pharmacies' && (
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    )}
                    {activeTab === 'reports' && (
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 10l-5 5-5-5M12 15V3"/>
                    )}
                  </svg>
                  {activeTab === 'reports' ? 'Analytics & Reports' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management`}
                </h2>
                {activeTab !== 'reports' && activeTab !== 'suppliers' && activeTab !== 'customers' && (
                  <button
                    className="admin-add-button"
                    onClick={() => {
                      if (activeTab === 'pharmacies') {
                        setFormData({
                          address: {},
                          contact: {},
                          license: {}
                        });
                      } else {
                        setFormData({});
                      }
                      setShowAddModal(true);
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add {activeTab.slice(0, -1)}
                  </button>
                )}
              </div>

              {activeTab === 'reports' ? (
                <AdminReportsPage />
              ) : activeTab === 'suppliers' ? (
                <SuppliersPage />
              ) : activeTab === 'customers' ? (
                <CustomersPage />
              ) : (
                <div className="admin-management-container">
                  <div className="admin-search-bar">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input 
                      type="text" 
                      placeholder={`Search ${activeTab}...`} 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                  </div>

                  {loading ? (
                    <div className="admin-loading-container">
                      <div className="admin-loading-spinner"></div>
                      <p>Loading {activeTab}...</p>
                    </div>
                  ) : (
                    renderTable()
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {renderModals(
        showAddModal, setShowAddModal, showEditModal, setShowEditModal,
        activeTab, formErrors, handleAdd, handleUpdate, renderFormFields
      )}
    </div>
  );
};

export default AdminDashboard;