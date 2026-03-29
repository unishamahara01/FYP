// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const AI_BASE_URL = process.env.REACT_APP_AI_URL || 'http://localhost:5001';

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('authToken');
};

// Create headers with auth
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API call function
const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ==================== AUTH API ====================
export const authAPI = {
  login: (credentials) => 
    apiCall(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  register: (userData) =>
    apiCall(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getProfile: () =>
    apiCall(`${API_BASE_URL}/auth/profile`),

  forgotPassword: (email) =>
    apiCall(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (data) =>
    apiCall(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  logout: () =>
    apiCall(`${API_BASE_URL}/auth/logout`, {
      method: 'POST'
    }),

  isAuthenticated: () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return !!token;
  }
};

// ==================== PRODUCTS API ====================
export const productsAPI = {
  getAll: () =>
    apiCall(`${API_BASE_URL}/products`),

  getById: (id) =>
    apiCall(`${API_BASE_URL}/products/${id}`),

  create: (productData) =>
    apiCall(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(productData)
    }),

  update: (id, productData) =>
    apiCall(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    }),

  delete: (id) =>
    apiCall(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE'
    }),

  qrLookup: (qrData) =>
    apiCall(`${API_BASE_URL}/products/qr-lookup`, {
      method: 'POST',
      body: JSON.stringify({ qrData })
    }),

  qrAdd: (qrData, quantity) =>
    apiCall(`${API_BASE_URL}/products/qr-add`, {
      method: 'POST',
      body: JSON.stringify({ qrData, quantity })
    })
};

// ==================== ORDERS API ====================
export const ordersAPI = {
  getAll: (limit) =>
    apiCall(`${API_BASE_URL}/orders${limit ? `?limit=${limit}` : ''}`),

  getById: (id) =>
    apiCall(`${API_BASE_URL}/orders/${id}`),

  create: (orderData) =>
    apiCall(`${API_BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData)
    })
};

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  getStats: () =>
    apiCall(`${API_BASE_URL}/dashboard/stats`),

  getTopProducts: () =>
    apiCall(`${API_BASE_URL}/dashboard/top-products`),

  getRecentActivity: () =>
    apiCall(`${API_BASE_URL}/dashboard/recent-activity`),

  getSalesForecast: () =>
    apiCall(`${API_BASE_URL}/sales/forecast`)
};

// ==================== INVENTORY API ====================
export const inventoryAPI = {
  getLowStock: () =>
    apiCall(`${API_BASE_URL}/inventory/low-stock`),

  sendLowStockAlert: () =>
    apiCall(`${API_BASE_URL}/inventory/send-low-stock-alert`, {
      method: 'POST'
    })
};

// ==================== ADMIN API ====================
export const adminAPI = {
  getUsers: () =>
    apiCall(`${API_BASE_URL}/admin/users`),

  createUser: (userData) =>
    apiCall(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  updateUser: (id, userData) =>
    apiCall(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }),

  deleteUser: (id) =>
    apiCall(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE'
    })
};

// ==================== AI API ====================
export const aiAPI = {
  // Health check
  checkHealth: async () => {
    try {
      const response = await fetch(`${AI_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },

  // Train models
  trainModels: () =>
    fetch(`${AI_BASE_URL}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()),

  // Get all predictions (expiry + demand + reorder)
  getAllPredictions: () =>
    fetch(`${AI_BASE_URL}/predict`, {
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()),

  // Get expiry predictions
  getExpiryPredictions: () =>
    fetch(`${AI_BASE_URL}/predict/expiry`, {
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()),

  // Get demand predictions
  getDemandPredictions: () =>
    fetch(`${AI_BASE_URL}/predict/demand`, {
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()),

  // Get reorder suggestions
  getReorderSuggestions: () =>
    fetch(`${AI_BASE_URL}/suggest/reorder`, {
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()),

  // Chatbot
  sendChatMessage: (message) =>
    fetch(`${AI_BASE_URL}/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    }).then(res => res.json())
};

// ==================== CHATBOT API (via backend proxy) ====================
export const chatbotAPI = {
  sendMessage: (message) =>
    apiCall(`${API_BASE_URL}/chat`, {
      method: 'POST',
      body: JSON.stringify({ message })
    })
};

export default {
  auth: authAPI,
  products: productsAPI,
  orders: ordersAPI,
  dashboard: dashboardAPI,
  inventory: inventoryAPI,
  admin: adminAPI,
  ai: aiAPI,
  chatbot: chatbotAPI
};
