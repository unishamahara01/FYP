import React from 'react';

export default function StatsCards({ stats }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Total SKUs</span>
          <div className="stat-icon blue">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
        </div>
        <div className="stat-value">{(stats.totalSKUs || 0).toLocaleString()}</div>
        <div className="stat-change positive">Products in inventory</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Expiring Items</span>
          <div className="stat-icon orange">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
          </div>
        </div>
        <div className="stat-value">{stats.expiringItems || 0}</div>
        <div className="stat-change neutral">Within 90 days</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Low Stock Items</span>
          <div className="stat-icon red">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
        </div>
        <div className="stat-value">{stats.predictedShortages || 0}</div>
        <div className="stat-change neutral">Need reorder</div>
      </div>

      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-title">Today's Sales</span>
          <div className="stat-icon green">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3h12"/>
              <path d="M6 8h12"/>
              <path d="M6 8c0 4.418 0 8 6 8s6-3.582 6-8"/>
              <path d="M12 8v8"/>
              <path d="M8 16h8"/>
            </svg>
          </div>
        </div>
        <div className="stat-value">Rs {(stats.todaysSales || 0).toLocaleString()}</div>
        <div className="stat-change positive">From database</div>
      </div>
    </div>
  );
}
