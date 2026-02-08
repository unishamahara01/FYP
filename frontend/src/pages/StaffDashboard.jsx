import React from "react";
import "./StaffDashboard.css";
import UserProfileDropdown from "../components/UserProfileDropdown";
import AIChatbot from "../components/AIChatbot";

export default function StaffDashboard({ onLogout, onAccountSettings }) {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

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
          <div className="nav-item active">
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span className="nav-text">Dashboard</span>
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
              <svg className="breadcrumb-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              <span className="breadcrumb-separator">›</span>
              <span className="breadcrumb-text">MediTrust</span>
            </div>
          </div>
          <div className="header-right">
            <UserProfileDropdown user={currentUser} onLogout={onLogout} onAccountSettings={onAccountSettings} />
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="dashboard-content">
          {/* WELCOME SECTION */}
          <div className="welcome-section">
            <h1>Welcome, {currentUser.fullName || 'Staff'}!</h1>
            <p className="welcome-subtitle">Staff Dashboard • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {/* Welcome Card */}
          <div className="welcome-card">
            <div className="welcome-content">
              <div className="welcome-icon-large">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <h2>Welcome to MediTrust</h2>
              <p className="welcome-subtitle">You're logged in as <strong>Staff Member</strong></p>
              <div className="role-badge-large">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                View-Only Access
              </div>
            </div>
          </div>

          {/* Info Cards Grid */}
          <div className="info-cards-grid">
            {/* Access Level Card */}
            <div className="info-card purple">
              <div className="info-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div className="info-card-content">
                <h3>Access Level</h3>
                <p>Limited Permissions</p>
                <span className="info-card-detail">View-only access to inventory and orders</span>
              </div>
            </div>

            {/* Permissions Card */}
            <div className="info-card blue">
              <div className="info-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9,11 12,14 22,4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </div>
              <div className="info-card-content">
                <h3>Your Permissions</h3>
                <p>2 Active Permissions</p>
                <span className="info-card-detail">View Inventory • View Orders</span>
              </div>
            </div>

            {/* Support Card */}
            <div className="info-card green">
              <div className="info-card-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="info-card-content">
                <h3>Need Help?</h3>
                <p>Contact Administrator</p>
                <span className="info-card-detail">For additional permissions or support</span>
              </div>
            </div>
          </div>

          {/* Detailed Info Section */}
          <div className="detailed-info-section">
            <div className="info-box-detailed">
              <div className="info-box-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <h3>About Your Role</h3>
              </div>
              <div className="info-box-content">
                <p>As a <strong>Staff Member</strong>, you have view-only access to the MediTrust system. This means you can:</p>
                <ul className="permissions-list">
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    View inventory items and stock levels
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    View customer orders and order history
                  </li>
                  <li className="restricted">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Cannot edit or delete any records
                  </li>
                  <li className="restricted">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    Cannot access user management or reports
                  </li>
                </ul>
                <div className="contact-admin-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>If you need additional permissions, please contact your system administrator.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI CHATBOT */}
      <AIChatbot />
    </div>
  );
}
