import React, { useState } from "react";
import "./ForgotPasswordPage.css";

export default function ForgotPasswordPage({ onBackToLogin, onSwitchToReset }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset code");
      }

      setSuccess("Password reset code sent to your email! Check your inbox.");
      setEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        {/* LEFT SIDE */}
        <div className="forgot-password-left">
          <div className="brand-section">
            <svg className="brand-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <h2 className="brand-name">MediTrust</h2>
            <p className="brand-tagline">Intelligent Pharmacy Management System</p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="forgot-password-right">
          <button type="button" className="back-to-login-btn" onClick={onBackToLogin}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12,19 5,12 12,5"/>
            </svg>
            Back to Login
          </button>

          <h1>Forgot Password?</h1>
          <p className="subtitle">Enter your email address and we'll send you a code to reset your password</p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-message general-error">
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                {success}
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={error ? 'error' : ''}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>

          <div className="switch-page">
            <p>Remember your password? <span className="link-text" onClick={onBackToLogin}>Login</span></p>
            <p style={{marginTop: '8px'}}>Already have a code? <span className="link-text" onClick={onSwitchToReset}>Reset Password</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
