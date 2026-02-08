import React, { useState } from "react";
import "./AccountSettings.css";

export default function AccountSettings({ onBack, onLogout }) {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState('profile');
  const [profilePhoto, setProfilePhoto] = useState(() => {
    // Load saved photo from localStorage on mount
    return localStorage.getItem('profilePhoto') || null;
  });
  const fileInputRef = React.useRef(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result;
        setProfilePhoto(photoData);
        // Save to localStorage so it persists
        localStorage.setItem('profilePhoto', photoData);
        console.log('Photo selected:', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    localStorage.removeItem('profilePhoto');
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="account-settings-container">
      {/* Header */}
      <header className="settings-header">
        <button className="back-button" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12,19 5,12 12,5"/>
          </svg>
        </button>
        <h1>Settings</h1>
      </header>

      <div className="settings-content">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <button 
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Profile</span>
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Security</span>
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span>Notifications</span>
          </button>
          <button 
            className={`sidebar-item ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Privacy</span>
          </button>
          
          <div className="sidebar-divider"></div>
          
          <button className="sidebar-item logout-item" onClick={onLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span>Log Out</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="settings-main">
          {activeTab === 'profile' && (
            <div className="settings-section">
              <h2>Profile Information</h2>
              <p className="section-description">Manage your personal information and account details</p>

              <div className="profile-avatar-section">
                <div className="profile-avatar-large">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="profile-photo-img" />
                  ) : (
                    getInitials(currentUser.fullName)
                  )}
                </div>
                <div>
                  <button className="change-photo-btn" onClick={handlePhotoClick}>
                    {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {profilePhoto && (
                    <button className="remove-photo-btn" onClick={handleRemovePhoto}>
                      Remove Photo
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={currentUser.fullName || ''} readOnly />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={currentUser.email || ''} readOnly />
              </div>

              <div className="form-group">
                <label>Role</label>
                <input type="text" value={currentUser.role || ''} readOnly />
              </div>

              <div className="info-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <p>Contact your administrator to update your profile information.</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              <p className="section-description">Manage your password and security preferences</p>

              <div className="security-item">
                <div className="security-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div className="security-item-content">
                  <h3>Change Password</h3>
                  <p>Update your password regularly to keep your account secure</p>
                </div>
                <button className="security-item-btn">Change</button>
              </div>

              <div className="security-item">
                <div className="security-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div className="security-item-content">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <button className="security-item-btn">Enable</button>
              </div>

              <div className="security-item">
                <div className="security-item-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12,6 12,12 16,14"/>
                  </svg>
                </div>
                <div className="security-item-content">
                  <h3>Login History</h3>
                  <p>View recent login activity and active sessions</p>
                </div>
                <button className="security-item-btn">View</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              <p className="section-description">Choose what notifications you want to receive</p>

              <div className="notification-item">
                <div className="notification-item-content">
                  <h3>Email Notifications</h3>
                  <p>Receive email updates about your account activity</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-item-content">
                  <h3>Login Alerts</h3>
                  <p>Get notified when someone logs into your account</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="notification-item">
                <div className="notification-item-content">
                  <h3>System Updates</h3>
                  <p>Receive notifications about system maintenance and updates</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy Settings</h2>
              <p className="section-description">Control your privacy and data preferences</p>

              <div className="privacy-item">
                <div className="privacy-item-content">
                  <h3>Profile Visibility</h3>
                  <p>Control who can see your profile information</p>
                </div>
                <select className="privacy-select">
                  <option>Everyone</option>
                  <option>Team Members Only</option>
                  <option>Only Me</option>
                </select>
              </div>

              <div className="privacy-item">
                <div className="privacy-item-content">
                  <h3>Activity Status</h3>
                  <p>Show when you're active on the platform</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="privacy-item">
                <div className="privacy-item-content">
                  <h3>Data Collection</h3>
                  <p>Allow collection of usage data to improve your experience</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
