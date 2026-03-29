import React, { useState } from "react";
import "./LoginPage.css";
import { authAPI } from "../services/api";
import GoogleSignIn from "../components/GoogleSignIn";

export default function LoginPage({ onSwitchToSignup, onLogin, onBackToLanding, onSwitchToForgotPassword }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Pharmacist'
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      console.log('Login successful:', response);
      
      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('authToken', response.token); // Backup for compatibility
      }
      
      // Store user info
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      onLogin(); // Navigate to dashboard
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        general: error.message || 'Login failed. Please check your credentials.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = (result) => {
    console.log('Google Sign-In successful:', result);
    
    // Store token if provided
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('authToken', result.token);
    }
    
    // Store user info
    if (result.user) {
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    onLogin(); // Navigate to dashboard
  };

  const handleGoogleError = (error) => {
    setErrors({ 
      general: error || 'Google Sign-In failed. Please try again.' 
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* LEFT SIDE - Simple Brand Section */}
        <div className="login-left">
          <div className="brand-section">
            <svg className="brand-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <h2 className="brand-name">MediTrust</h2>
            <p className="brand-tagline">Intelligent Pharmacy Management System</p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="login-right">
          <button type="button" className="back-to-landing-btn" onClick={onBackToLanding}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12,19 5,12 12,5"/>
            </svg>
            Back to Home
          </button>
          <h1>Welcome Back</h1>
          <p className="subtitle">Sign in to your MediTrust account</p>

          <form onSubmit={handleLogin}>
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@meditrust.com"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-container">
                <input 
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className={errors.password ? 'error' : ''}
                />
                <button 
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    // Eye with slash (hide)
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    // Eye open (show)
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Role</label>
              <select 
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="Pharmacist">Pharmacist</option>
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <div className="forgot-password-link">
              <span className="link-text" onClick={onSwitchToForgotPassword}>Forgot Password?</span>
            </div>
          </form>

          <GoogleSignIn 
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
          
          <div className="switch-page">
            <p>Don't have an account? <span className="link-text" onClick={onSwitchToSignup}>Sign up</span></p>
          </div>
        </div>

      </div>
    </div>
  );
}
