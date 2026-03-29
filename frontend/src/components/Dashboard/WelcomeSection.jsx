import React from 'react';

export default function WelcomeSection({ currentUser, isPharmacist }) {
  return (
    <div className="welcome-section">
      <h1>Welcome, {currentUser.fullName || 'User'}!</h1>
      <p className="welcome-subtitle">
        {isPharmacist ? 'Pharmacist Dashboard' : 'Dashboard Overview'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}
