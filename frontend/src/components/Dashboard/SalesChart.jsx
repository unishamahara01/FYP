import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SalesChart({ salesData }) {
  return (
    <div className="dashboard-card chart-card">
      <div className="card-header">
        <h3>Daily Sales Trend</h3>
        <p className="card-subtitle">Last 30 days sales performance</p>
      </div>
      <div className="chart-container">
        {salesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#667eea" 
                strokeWidth={3}
                name="Daily Sales (Rs)"
                dot={{ fill: '#667eea', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="coming-soon-container">
            <p>No sales data available. Create some orders to see the graph!</p>
          </div>
        )}
      </div>
    </div>
  );
}
