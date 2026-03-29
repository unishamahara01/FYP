import React from "react";
import "./LandingPage.css";

export default function LandingPage({ onSwitchToLogin, onSwitchToSignup, isLoggedIn, user, onGoToDashboard, onLogout }) {
  return (
    <div className="landing-page">
      {/* HEADER/NAVBAR */}
      <header className="landing-header">
        <div className="landing-container">
          <div className="landing-nav">
            <div className="landing-logo">
              <svg className="landing-logo-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <span className="landing-logo-text">MediTrust</span>
            </div>
            <nav className="landing-nav-links">
              <a href="#features">Features</a>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
            </nav>
            <div className="landing-nav-buttons">
              {isLoggedIn ? (
                <>
                  <span className="landing-user-welcome">
                    Welcome, {user?.fullName && user.fullName !== 'youba' && user.fullName !== user.email 
                      ? user.fullName 
                      : user?.email?.split('@')[0] || 'User'}!
                  </span>
                  <button className="landing-btn-secondary" onClick={onLogout}>
                    Logout
                  </button>
                  <button className="landing-btn-primary" onClick={onGoToDashboard}>
                    Go to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button className="landing-btn-secondary" onClick={onSwitchToLogin}>
                    Login
                  </button>
                  <button className="landing-btn-primary" onClick={onSwitchToSignup}>
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-content">
            <div className="landing-hero-text">
              <div className="landing-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                Trusted by Healthcare Professionals
              </div>
              <h1 className="landing-hero-title">
                Intelligent Pharmacy Management System
              </h1>
              <p className="landing-hero-subtitle">
                A comprehensive solution for modern pharmacies to manage inventory, track medications, 
                prevent expiry waste, and optimize operations with data-driven insights.
              </p>
              <div className="landing-hero-buttons">
                {isLoggedIn ? (
                  <button className="landing-btn-hero-primary" onClick={onGoToDashboard}>
                    Go to Dashboard
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12,5 19,12 12,19"/>
                    </svg>
                  </button>
                ) : (
                  <>
                    <button className="landing-btn-hero-primary" onClick={onSwitchToSignup}>
                      Create Account
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12,5 19,12 12,19"/>
                      </svg>
                    </button>
                    <button className="landing-btn-hero-secondary" onClick={onSwitchToLogin}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                        <polyline points="10,17 15,12 10,7"/>
                        <line x1="15" y1="12" x2="3" y2="12"/>
                      </svg>
                      Sign In
                    </button>
                  </>
                )}
              </div>
              <div className="landing-hero-stats">
                <div className="landing-stat">
                  <div className="landing-stat-number">100%</div>
                  <div className="landing-stat-label">Secure</div>
                </div>
                <div className="landing-stat">
                  <div className="landing-stat-number">Real-time</div>
                  <div className="landing-stat-label">Data Tracking</div>
                </div>
                <div className="landing-stat">
                  <div className="landing-stat-number">Cloud</div>
                  <div className="landing-stat-label">Based System</div>
                </div>
              </div>
            </div>
            <div className="landing-hero-image">
              <div className="landing-pharmacy-image-container">
                <img 
                  src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&q=80" 
                  alt="Modern Pharmacy Interior" 
                  className="landing-pharmacy-image"
                  onError={(e) => {
                    // Fallback to a solid color if image fails to load
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #a8d5ba 0%, #94c5cc 100%)';
                    e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:white;font-size:24px;font-weight:bold;">PHARMACY</div>';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION - evitalrx.in Style */}
      <section id="features" className="landing-features-evital">
        <div className="landing-container">
          <div className="evital-section-header">
            <h2 className="evital-section-title">Why Your Pharmacy Needs MediTrust!</h2>
            <p className="evital-section-subtitle">
              MediTrust simplifies pharmacy operations with its comprehensive features.<br/>
              Our all-in-one platform is your trusted partner in pharmacy management.
            </p>
          </div>
          
          <div className="evital-cards-grid">
            {/* Card 1: AI Expiry Prediction */}
            <div className="evital-card evital-card-pink">
              <div className="evital-card-icon">
                <svg viewBox="0 0 200 200" fill="none">
                  <rect x="40" y="80" width="120" height="80" rx="8" fill="#667eea" opacity="0.2"/>
                  <rect x="50" y="90" width="100" height="60" rx="4" fill="#667eea" opacity="0.4"/>
                  <circle cx="100" cy="60" r="25" fill="#f56565"/>
                  <path d="M100 45 L100 60 L110 70" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                  <rect x="60" y="100" width="15" height="40" rx="2" fill="#48bb78"/>
                  <rect x="85" y="110" width="15" height="30" rx="2" fill="#ed8936"/>
                  <rect x="110" y="95" width="15" height="45" rx="2" fill="#f56565"/>
                </svg>
              </div>
              <h3 className="evital-card-title">AI Expiry Prediction</h3>
              <p className="evital-card-description">
                With Machine Learning insights, predict which medicines are at risk of expiry and take action before waste occurs
              </p>
            </div>

            {/* Card 2: AI Demand Forecasting */}
            <div className="evital-card evital-card-purple">
              <div className="evital-card-icon">
                <svg viewBox="0 0 200 200" fill="none">
                  <path d="M30 150 L60 120 L90 130 L120 90 L150 100 L170 60" stroke="#667eea" strokeWidth="4" fill="none"/>
                  <circle cx="30" cy="150" r="6" fill="#667eea"/>
                  <circle cx="60" cy="120" r="6" fill="#667eea"/>
                  <circle cx="90" cy="130" r="6" fill="#667eea"/>
                  <circle cx="120" cy="90" r="6" fill="#48bb78"/>
                  <circle cx="150" cy="100" r="6" fill="#48bb78"/>
                  <circle cx="170" cy="60" r="6" fill="#48bb78"/>
                  <path d="M120 90 L150 100 L170 60" stroke="#48bb78" strokeWidth="3" strokeDasharray="5,5" fill="none"/>
                </svg>
              </div>
              <h3 className="evital-card-title">AI Demand Forecasting</h3>
              <p className="evital-card-description">
                Automated predictions based on historical sales data. Know what to stock and when to stock it
              </p>
            </div>

            {/* Card 3: Smart Inventory Management */}
            <div className="evital-card evital-card-yellow">
              <div className="evital-card-icon">
                <svg viewBox="0 0 200 200" fill="none">
                  <rect x="50" y="100" width="100" height="60" rx="4" fill="#667eea" opacity="0.3"/>
                  <rect x="60" y="80" width="80" height="50" rx="4" fill="#667eea" opacity="0.5"/>
                  <rect x="70" y="60" width="60" height="40" rx="4" fill="#667eea"/>
                  <line x1="70" y1="75" x2="130" y2="75" stroke="white" strokeWidth="2"/>
                  <line x1="70" y1="85" x2="130" y2="85" stroke="white" strokeWidth="2"/>
                  <circle cx="160" cy="50" r="20" fill="#48bb78"/>
                  <path d="M150 50 L157 57 L170 44" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="evital-card-title">Smart Inventory Management</h3>
              <p className="evital-card-description">
                Keep a tab on what to keep & what not to keep in your inventory with real-time tracking and alerts
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="landing-about">
        <div className="landing-container">
          <div className="landing-section-header">
            <div className="landing-section-badge">About MediTrust</div>
            <h2 className="landing-section-title">Purpose-Built for Healthcare Excellence</h2>
            <p className="landing-section-subtitle">
              A comprehensive pharmacy management solution designed to enhance operational efficiency and patient care
            </p>
          </div>
          <div className="landing-about-content">
            <div className="landing-about-image">
              <div className="landing-about-card">
                <div className="landing-about-card-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <div className="landing-about-card-text">
                  <div className="landing-about-card-title">MediTrust Platform</div>
                  <div className="landing-about-card-subtitle">Healthcare Management</div>
                </div>
              </div>
            </div>
            <div className="landing-about-text">
              <h3 className="landing-about-heading">What is MediTrust?</h3>
              <p className="landing-about-description">
                MediTrust is a comprehensive pharmacy management system designed to help healthcare 
                professionals streamline their operations, reduce medication waste, and improve patient safety. 
                Our platform provides real-time inventory tracking, expiry management, and detailed analytics.
              </p>
              <h3 className="landing-about-heading">Key Benefits</h3>
              <p className="landing-about-description">
                The system enables pharmacies to maintain accurate medication records, track sales patterns, 
                manage multiple user roles, and generate comprehensive reports. With cloud-based access, 
                authorized personnel can monitor pharmacy operations from anywhere.
              </p>
              <div className="landing-about-features">
                <div className="landing-about-feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  <span>Secure Data Management</span>
                </div>
                <div className="landing-about-feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  <span>Real-Time Inventory Tracking</span>
                </div>
                <div className="landing-about-feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  <span>Comprehensive Reporting</span>
                </div>
                <div className="landing-about-feature">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                  <span>Multi-User Access Control</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="landing-cta">
        <div className="landing-container">
          <div className="landing-cta-content">
            <h2 className="landing-cta-title">Start Managing Your Pharmacy Today</h2>
            <p className="landing-cta-subtitle">
              Join healthcare professionals using MediTrust for efficient pharmacy management
            </p>
            <div className="landing-cta-buttons">
              {isLoggedIn ? (
                <button className="landing-btn-cta-primary" onClick={onGoToDashboard}>
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button className="landing-btn-cta-primary" onClick={onSwitchToSignup}>
                    Create Account
                  </button>
                  <button className="landing-btn-cta-secondary" onClick={onSwitchToLogin}>
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-content">
            <div className="landing-footer-section">
              <div className="landing-footer-logo">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <span>MediTrust</span>
              </div>
              <p className="landing-footer-description">
                Modern pharmacy management made simple. Streamline operations and improve patient care.
              </p>
            </div>
            <div className="landing-footer-section">
              <h4 className="landing-footer-title">Product</h4>
              <ul className="landing-footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#demo">Demo</a></li>
              </ul>
            </div>
            <div className="landing-footer-section">
              <h4 className="landing-footer-title">Company</h4>
              <ul className="landing-footer-links">
                <li><a href="#about">About Us</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="landing-footer-section">
              <h4 className="landing-footer-title">Support</h4>
              <ul className="landing-footer-links">
                <li><a href="#help">Help Center</a></li>
                <li><a href="#docs">Documentation</a></li>
                <li><a href="#api">API Reference</a></li>
                <li><a href="#status">System Status</a></li>
              </ul>
            </div>
          </div>
          <div className="landing-footer-bottom">
            <p>&copy; 2025 MediTrust. All rights reserved.</p>
            <div className="landing-footer-bottom-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
