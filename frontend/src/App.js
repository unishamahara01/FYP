import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReportsPage from './pages/ReportsPage';
import AccountSettings from './pages/AccountSettings';
import MedicineDetail from './pages/MedicineDetail';
import { authAPI } from './services/api';

// A component to protect routes that require authentication
function ProtectedRoute({ isLoggedIn, isLoading, children }) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#4b5563' }}>Loading...</div>
      </div>
    );
  }
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

// A component to restrict public routes (like login/signup) from already logged-in users
function PublicRoute({ isLoggedIn, isLoading, children }) {
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#4b5563' }}>Loading...</div>
      </div>
    );
  }
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      if (authAPI.isAuthenticated()) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Fix old user data with "youba" name
        if (user.fullName === 'youba' || user.fullName === 'youba11@gmail.com') {
          // Clear old data and force re-login
          localStorage.clear();
          setIsLoggedIn(false);
          setUserRole(null);
          setIsLoading(false);
          navigate('/');
          return;
        }
        setUserRole(user.role);
        setIsLoggedIn(true);
        
        // Intercept return redirects from eSewa sandbox to land automatically on the Dashboard
        if (window.location.search.includes('esewa=')) {
          navigate(`/dashboard${window.location.search}`, { replace: true });
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const switchToSignup = () => {
    navigate('/signup');
  };

  const switchToLogin = () => {
    navigate('/login');
  };

  const switchToLanding = () => {
    navigate('/');
  };

  const switchToForgotPassword = () => {
    navigate('/forgot-password');
  };

  const switchToResetPassword = () => {
    navigate('/reset-password');
  };

  const handleLogin = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  const handleSignup = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  const handleResetSuccess = () => {
    alert('Password reset successful! Please login with your new password.');
    navigate('/login');
  };

  const handleAccountSettings = () => {
    navigate('/settings');
  };

  const handleBackFromSettings = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Clear all state
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '18px', fontWeight: '500', color: '#4b5563' }}>Loading...</div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="App">
      <Routes>
        {/* Public Landing Page */}
        <Route 
          path="/" 
          element={
            <LandingPage 
              onSwitchToLogin={switchToLogin} 
              onSwitchToSignup={switchToSignup}
              isLoggedIn={isLoggedIn}
              user={user}
              onGoToDashboard={() => navigate('/dashboard')}
              onLogout={handleLogout}
            />
          } 
        />

        {/* Public Only Auth Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute isLoggedIn={isLoggedIn} isLoading={isLoading}>
              <LoginPage 
                onSwitchToSignup={switchToSignup} 
                onLogin={handleLogin} 
                onBackToLanding={switchToLanding}
                onSwitchToForgotPassword={switchToForgotPassword}
              />
            </PublicRoute>
          } 
        />

        <Route 
          path="/signup" 
          element={
            <PublicRoute isLoggedIn={isLoggedIn} isLoading={isLoading}>
              <SignupPage 
                onSwitchToLogin={switchToLogin} 
                onSignup={handleSignup} 
                onBackToLanding={switchToLanding} 
              />
            </PublicRoute>
          } 
        />

        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute isLoggedIn={isLoggedIn} isLoading={isLoading}>
              <ForgotPasswordPage 
                onBackToLogin={switchToLogin} 
                onSwitchToReset={switchToResetPassword} 
              />
            </PublicRoute>
          } 
        />

        <Route 
          path="/reset-password" 
          element={
            <PublicRoute isLoggedIn={isLoggedIn} isLoading={isLoading}>
              <ResetPasswordPage 
                onBackToLogin={switchToLogin} 
                onResetSuccess={handleResetSuccess} 
              />
            </PublicRoute>
          } 
        />

        {/* Protected Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading}>
              {user.role === 'Admin' ? (
                <AdminDashboard onLogout={handleLogout} onAccountSettings={handleAccountSettings} />
              ) : (
                <Dashboard onLogout={handleLogout} onAccountSettings={handleAccountSettings} userRole={user.role} />
              )}
            </ProtectedRoute>
          } 
        />

        {/* Protected Settings Route */}
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading}>
              <AccountSettings onBack={handleBackFromSettings} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Catch-All Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;