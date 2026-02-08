# Role-Based Authentication & Authorization System

## Overview
MediTrust now implements a comprehensive role-based access control (RBAC) system with three user roles and permission-based authorization.

## User Roles

### 1. **Admin** (Full Access)
- **Permissions:**
  - `view_all` - View all data
  - `edit_all` - Edit all data
  - `delete_all` - Delete any data
  - `manage_users` - Create, update, delete users
  - `view_reports` - Access all reports
  - `manage_inventory` - Full inventory control

### 2. **Pharmacist** (Operational Access)
- **Permissions:**
  - `view_inventory` - View inventory items
  - `edit_inventory` - Add/update inventory
  - `view_orders` - View all orders
  - `process_orders` - Create and process orders
  - `view_reports` - Access sales and inventory reports

### 3. **Staff** (Limited Access)
- **Permissions:**
  - `view_inventory` - View inventory items only
  - `view_orders` - View orders only

## Test User Credentials

### Admin User
- **Email:** `admin@meditrust.com`
- **Password:** `password123`
- **Role:** Admin
- **Access:** Full system access

### Pharmacist Users
- **Email:** `prajita01@gmail.com`
- **Password:** `password123`
- **Role:** Pharmacist
- **Access:** Inventory management, order processing, reports

- **Email:** `john.doe@meditrust.com`
- **Password:** `password123`
- **Role:** Pharmacist

- **Email:** `ankita01@gmail.com`
- **Password:** `password123`
- **Role:** Pharmacist

### Staff User
- **Email:** `aaesa@gmail.com`
- **Password:** `password123`
- **Role:** Staff
- **Access:** View-only access to inventory and orders

## API Endpoints

### Public Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Protected Endpoints (All Authenticated Users)
- `GET /api/auth/profile` - Get current user profile
- `GET /api/auth/permissions` - Get user permissions
- `POST /api/auth/logout` - Logout
- `GET /api/dashboard/stats` - Dashboard statistics

### Admin Only Endpoints
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `DELETE /api/admin/users/:id` - Delete user

### Admin & Pharmacist Endpoints
- `GET /api/inventory` - View inventory
- `POST /api/inventory` - Add inventory item (requires `edit_inventory` permission)
- `PUT /api/inventory/:id` - Update inventory item (requires `edit_inventory` permission)

### Admin, Pharmacist & Staff Endpoints
- `GET /api/orders` - View orders
- `POST /api/orders` - Create order (requires `process_orders` permission)

### Admin & Pharmacist Only
- `GET /api/reports` - View reports (requires `view_reports` permission)

## Authorization Middleware

### 1. `authenticateToken`
Verifies JWT token and authenticates the user.

```javascript
authenticateToken(req, res, next)
```

### 2. `authorizeRole(...roles)`
Checks if user has one of the specified roles.

```javascript
authorizeRole("Admin", "Pharmacist")
```

### 3. `authorizePermission(...permissions)`
Checks if user has specific permissions.

```javascript
authorizePermission("edit_inventory", "manage_inventory")
```

## Usage Examples

### Example 1: Admin Creating a New User
```bash
POST /api/admin/users
Headers: Authorization: Bearer <admin_token>
Body: {
  "fullName": "New User",
  "email": "newuser@meditrust.com",
  "password": "password123",
  "role": "Pharmacist"
}
```

### Example 2: Pharmacist Adding Inventory
```bash
POST /api/inventory
Headers: Authorization: Bearer <pharmacist_token>
Body: {
  "name": "Aspirin 100mg",
  "stock": 500,
  "price": 8,
  "category": "Pain Relief"
}
```

### Example 3: Staff Viewing Orders (Read-Only)
```bash
GET /api/orders
Headers: Authorization: Bearer <staff_token>
```

### Example 4: Staff Trying to Create Order (Will Fail)
```bash
POST /api/orders
Headers: Authorization: Bearer <staff_token>
Response: 403 Forbidden - "Access denied. Missing required permissions."
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Access token required"
}
```

### 403 Forbidden (Role-based)
```json
{
  "message": "Access denied. Insufficient permissions.",
  "requiredRole": ["Admin"],
  "userRole": "Staff"
}
```

### 403 Forbidden (Permission-based)
```json
{
  "message": "Access denied. Missing required permissions.",
  "requiredPermissions": ["edit_inventory"],
  "userPermissions": ["view_inventory", "view_orders"]
}
```

## Testing the System

### Step 1: Login as Admin
```bash
POST http://localhost:3001/api/auth/login
Body: {
  "email": "admin@meditrust.com",
  "password": "password123",
  "role": "Admin"
}
```

### Step 2: Get All Users (Admin Only)
```bash
GET http://localhost:3001/api/admin/users
Headers: Authorization: Bearer <token_from_step_1>
```

### Step 3: Login as Staff
```bash
POST http://localhost:3001/api/auth/login
Body: {
  "email": "aaesa@gmail.com",
  "password": "password123",
  "role": "Staff"
}
```

### Step 4: Try to Access Admin Endpoint (Should Fail)
```bash
GET http://localhost:3001/api/admin/users
Headers: Authorization: Bearer <staff_token>
Response: 403 Forbidden
```

## Frontend Integration

### Checking User Permissions
```javascript
// Get user permissions
const response = await fetch('http://localhost:3001/api/auth/permissions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { role, permissions } = await response.json();

// Show/hide UI elements based on permissions
if (permissions.includes('manage_users')) {
  // Show user management UI
}

if (role === 'Admin') {
  // Show admin dashboard
}
```

### Conditional Rendering Example
```javascript
{user.role === 'Admin' && (
  <button onClick={handleDeleteUser}>Delete User</button>
)}

{user.permissions.includes('edit_inventory') && (
  <button onClick={handleAddInventory}>Add Inventory</button>
)}
```

## Security Best Practices

1. **Token Storage:** Store JWT tokens securely (httpOnly cookies or secure localStorage)
2. **Token Expiration:** Tokens expire after 24 hours
3. **Password Hashing:** All passwords are hashed using bcrypt
4. **Role Validation:** Both frontend and backend validate user roles
5. **Permission Checks:** Fine-grained permission checks for sensitive operations

## Future Enhancements

1. **Database Integration:** Replace in-memory storage with MongoDB/PostgreSQL
2. **Refresh Tokens:** Implement refresh token mechanism
3. **Audit Logging:** Log all admin actions
4. **Two-Factor Authentication:** Add 2FA for admin accounts
5. **Dynamic Permissions:** Allow admins to customize role permissions
6. **Session Management:** Track active sessions and allow remote logout

## Summary

✅ **3 User Roles:** Admin, Pharmacist, Staff
✅ **Permission-Based Access:** Fine-grained control
✅ **Secure Authentication:** JWT tokens with bcrypt hashing
✅ **Role-Based Routes:** Different access levels for different endpoints
✅ **Error Handling:** Clear error messages for unauthorized access
✅ **Test Users:** Pre-configured users for each role

Your MediTrust application now has a complete role-based authentication and authorization system!
