import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ReportsPage from './pages/ReportsPage';
import AccountSettings from './pages/AccountSettings';
import { authAPI } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previousPage, setPreviousPage] = useState(null);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      if (authAPI.isAuthenticated()) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserRole(user.role);
        setIsLoggedIn(true);
        setCurrentPage('dashboard');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const switchToSignup = () => {
    setCurrentPage('signup');
  };

  const switchToLogin = () => {
    setCurrentPage('login');
  };

  const switchToLanding = () => {
    setCurrentPage('landing');
  };

  const switchToForgotPassword = () => {
    setCurrentPage('forgotPassword');
  };

  const switchToResetPassword = () => {
    setCurrentPage('resetPassword');
  };

  const handleLogin = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleResetSuccess = () => {
    alert('Password reset successful! Please login with your new password.');
    setCurrentPage('login');
  };

  const handleAccountSettings = () => {
    setPreviousPage(currentPage);
    setCurrentPage('accountSettings');
  };

  const handleBackFromSettings = () => {
    setCurrentPage(previousPage || 'dashboard');
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
    setCurrentPage('landing');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (isLoggedIn) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (currentPage === 'accountSettings') {
      return (
        <div className="App">
          <AccountSettings onBack={handleBackFromSettings} onLogout={handleLogout} />
        </div>
      );
    }
    
    return (
      <div className="App">
        {user.role === 'Admin' ? (
          <AdminDashboard onLogout={handleLogout} onAccountSettings={handleAccountSettings} />
        ) : user.role === 'Staff' ? (
          <StaffDashboard onLogout={handleLogout} onAccountSettings={handleAccountSettings} />
        ) : (
          <Dashboard onLogout={handleLogout} onAccountSettings={handleAccountSettings} />
        )}
      </div>
    );
  }

  return (
    <div className="App">
      {currentPage === 'landing' ? (
        <LandingPage onSwitchToLogin={switchToLogin} onSwitchToSignup={switchToSignup} />
      ) : currentPage === 'login' ? (
        <LoginPage 
          onSwitchToSignup={switchToSignup} 
          onLogin={handleLogin} 
          onBackToLanding={switchToLanding}
          onSwitchToForgotPassword={switchToForgotPassword}
        />
      ) : currentPage === 'signup' ? (
        <SignupPage onSwitchToLogin={switchToLogin} onSignup={handleLogin} onBackToLanding={switchToLanding} />
      ) : currentPage === 'forgotPassword' ? (
        <ForgotPasswordPage onBackToLogin={switchToLogin} onSwitchToReset={switchToResetPassword} />
      ) : currentPage === 'resetPassword' ? (
        <ResetPasswordPage onBackToLogin={switchToLogin} onResetSuccess={handleResetSuccess} />
      ) : null}
    </div>
  );
}

export default App;