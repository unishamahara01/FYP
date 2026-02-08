import React, { useState, useEffect, useRef } from "react";
import "./UserProfileDropdown.css";

export default function UserProfileDropdown({ user, onLogout, onAccountSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(() => {
    return localStorage.getItem('profilePhoto') || null;
  });
  const dropdownRef = useRef(null);

  // Listen for photo changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setProfilePhoto(localStorage.getItem('profilePhoto') || null);
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Also check on mount and when dropdown opens
    const interval = setInterval(() => {
      setProfilePhoto(localStorage.getItem('profilePhoto') || null);
    }, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case "admin": return "role-badge-admin";
      case "pharmacist": return "role-badge-pharmacist";
      case "staff": return "role-badge-staff";
      default: return "role-badge-default";
    }
  };

  const handleAccountSettings = () => {
    setIsOpen(false);
    if (onAccountSettings) {
      onAccountSettings();
    }
  };

  return (
    <div className="user-profile-dropdown-container" ref={dropdownRef}>
      <button 
        className="user-profile-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <div className="user-avatar-trigger">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" className="avatar-photo" />
          ) : (
            getInitials(user.fullName)
          )}
        </div>
        <svg 
          className={`dropdown-arrow ${isOpen ? "open" : ""}`} 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      {isOpen && (
        <div className="user-profile-dropdown-menu">
          {/* User Profile Card */}
          <div className="profile-card">
            <div className="profile-card-content">
              <div className="user-avatar-large">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="avatar-photo" />
                ) : (
                  getInitials(user.fullName)
                )}
              </div>
              <div className="user-info">
                <h3 className="user-name">{user.fullName || "User"}</h3>
                <p className="user-email">{user.email || "No email"}</p>
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          {/* Menu Items */}
          <div className="menu-items">
            <button className="menu-item" onClick={handleAccountSettings}>
              <div className="menu-item-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m-6-6h6m6 0h6"/>
                </svg>
              </div>
              <div className="menu-item-content">
                <span className="menu-item-title">Settings & Privacy</span>
                <span className="menu-item-subtitle">Account preferences and privacy</span>
              </div>
              <svg className="menu-item-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
