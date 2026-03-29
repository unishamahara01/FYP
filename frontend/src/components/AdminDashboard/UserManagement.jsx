import React from 'react';

export default function UserManagement({ users, onEdit, onDelete, onAdd, loading }) {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>User Management</h2>
        <button className="btn-primary" onClick={onAdd}>
          + Add User
        </button>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.department?.name || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${user.status?.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button className="btn-icon" onClick={() => onEdit(user)}>
                    Edit
                  </button>
                  <button className="btn-icon danger" onClick={() => onDelete(user._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
