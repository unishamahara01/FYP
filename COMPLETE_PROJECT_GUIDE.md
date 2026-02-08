# MediTrust - Complete Project Guide

## 🎯 Project Overview
MediTrust is a pharmacy management system with role-based authentication and authorization (RBAC). The system has three user roles with different access levels and dashboards.

---

## 👥 User Roles & Access

### 1. **Admin** (Full Access)
- **Dashboard**: Admin Dashboard with User Management
- **Permissions**: 
  - View, add, edit, and delete users
  - Manage all system settings
  - Access all features
- **Test Account**: 
  - Email: `admin@meditrust.com`
  - Password: `password123`

### 2. **Pharmacist** (Standard Access)
- **Dashboard**: Pharmacist Dashboard with inventory and sales
- **Permissions**:
  - View and manage inventory
  - Process orders
  - View reports
- **Test Accounts**:
  - Email: `ankita01@gmail.com` | Password: `password123`
  - Email: `prajita01@gmail.com` | Password: `password123`
  - Email: `unishamahara01@gmail.com` | Password: `password123`

### 3. **Staff** (View-Only Access)
- **Dashboard**: Simple Staff Dashboard (view-only)
- **Permissions**:
  - View inventory (read-only)
  - View orders (read-only)
- **Note**: Staff can be created by Admin through User Management

---

## 🚀 How to Run the Project

### Method 1: Using Batch File (Easiest)
1. Double-click `start-project.bat`
2. Wait for both servers to start
3. Frontend opens automatically at `http://localhost:3000`

### Method 2: Manual Start
1. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```
   Backend runs on: `http://localhost:3001`

2. **Start Frontend** (in new terminal):
   ```bash
   cd frontend
   npm start
   ```
   Frontend runs on: `http://localhost:3000`

---

## 🔐 Authentication Features

### Login
- Email and password authentication
- Role selection dropdown
- JWT token-based authentication
- Automatic role-based routing

### Signup
- New user registration
- Role selection (Admin, Pharmacist, Staff)
- Password validation (minimum 6 characters)
- Email validation

### Security
- Passwords hashed with bcrypt
- JWT tokens for session management
- Protected API routes
- Role-based authorization middleware

---

## 📊 Dashboard Features

### Admin Dashboard
**Features**:
- **User Management Table**: View all users with name, email, and role
- **Add User**: Create new users with any role
- **Edit User**: Modify user details and change roles
- **Delete User**: Remove users (cannot delete yourself)
- **Search**: Filter users by name, email, or role
- **Success/Error Messages**: Visual feedback for all actions

**User Management Actions**:
1. Click "Add User" button to create new user
2. Click blue "Edit" icon to modify user details
3. Click red "Delete" icon to remove user
4. Use search bar to find specific users

### Pharmacist Dashboard
**Features**:
- Sales statistics (Today's Sales, Monthly Revenue)
- Inventory overview (Total SKUs, Expiring Items)
- Quick action cards
- Professional medical-themed design
- Currency in Nepali Rupees (₨)

### Staff Dashboard
**Features**:
- Simple welcome screen
- User information display
- Limited access notification
- View-only permissions message
- Clean, minimal design

---

## 🎨 Design Features

### Color Scheme
- Primary: Green gradient (#4ade80 to #22c55e)
- Background: Light gray (#f8fafc)
- Text: Dark slate (#1e293b)
- Accents: Role-specific colors

### UI Elements
- White sidebars with clean navigation
- Professional SVG icons
- Smooth animations and transitions
- Responsive design
- Role badges with color coding:
  - Admin: Yellow/Gold
  - Pharmacist: Blue
  - Staff: Purple

### Login/Signup Pages
- Bright, colorful floating icons
- Gradient backgrounds
- Smooth animations
- Professional medical theme

---

## 🔧 Technical Stack

### Frontend
- **Framework**: React.js
- **Styling**: Custom CSS
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Conditional rendering based on role

### Backend
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **CORS**: Enabled for frontend communication

### Data Storage
- In-memory storage (users array)
- Can be easily migrated to MongoDB/PostgreSQL

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Admin Routes (Admin Only)
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Inventory Routes (Admin & Pharmacist)
- `GET /api/inventory` - Get inventory items
- `POST /api/inventory` - Add inventory item
- `PUT /api/inventory/:id` - Update inventory item

### Order Routes (Admin & Pharmacist)
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order

### Reports (Admin & Pharmacist)
- `GET /api/reports` - Get sales and inventory reports

---

## 🎓 Key Learning Concepts

### 1. Role-Based Access Control (RBAC)
- Different roles have different permissions
- Middleware checks user role before allowing access
- Frontend shows different dashboards based on role

### 2. JWT Authentication
- Secure token-based authentication
- Tokens stored in localStorage
- Tokens sent with every API request

### 3. Password Security
- Passwords never stored in plain text
- bcrypt hashing with salt rounds
- Secure password comparison

### 4. API Authorization
- `authenticateToken()` - Verifies JWT token
- `authorizeRole()` - Checks user role
- `authorizePermission()` - Checks specific permissions

### 5. Frontend-Backend Communication
- RESTful API design
- JSON data format
- Error handling and validation
- CORS configuration

---

## 🐛 Troubleshooting

### "Failed to fetch" Error
**Solution**: Make sure backend is running on port 3001
```bash
cd backend
npm start
```

### Login Not Working
**Solution**: Check that you're using correct credentials:
- Admin: `admin@meditrust.com` / `password123`
- Pharmacist: `ankita01@gmail.com` / `password123`

### Wrong Dashboard Showing
**Solution**: 
1. Logout completely
2. Clear browser cache (Ctrl + Shift + Delete)
3. Login again with correct role

### Port Already in Use
**Solution**: 
- Frontend: Change port in package.json or use suggested port
- Backend: Change PORT in .env file

---

## 📚 Project Structure

```
meditrust/
├── backend/
│   ├── server.js          # Main backend server
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main app component
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── Dashboard.jsx        # Pharmacist Dashboard
│   │   │   ├── AdminDashboard.jsx   # Admin Dashboard
│   │   │   └── StaffDashboard.jsx   # Staff Dashboard
│   │   └── services/
│   │       └── api.js    # API service functions
│   └── package.json      # Frontend dependencies
├── start-project.bat     # Quick start script
└── README.md            # Project documentation
```

---

## ✅ Features Checklist

- [x] User Registration & Login
- [x] JWT Authentication
- [x] Role-Based Authorization
- [x] Admin Dashboard with User Management
- [x] Pharmacist Dashboard with Stats
- [x] Staff Dashboard (View-Only)
- [x] Add/Edit/Delete Users (Admin)
- [x] Search Users
- [x] Success/Error Messages
- [x] Professional UI Design
- [x] Nepali Rupees Currency
- [x] Password Security (bcrypt)
- [x] Protected API Routes
- [x] Role-Based Routing

---

## 🎯 Demo Flow for Teacher

1. **Start Project**: Run `start-project.bat`

2. **Show Admin Features**:
   - Login as Admin (`admin@meditrust.com` / `password123`)
   - Show User Management table
   - Add a new Staff user
   - Edit a user's role
   - Search for users
   - Delete a user

3. **Show Pharmacist Features**:
   - Logout and login as Pharmacist (`ankita01@gmail.com` / `password123`)
   - Show dashboard with sales stats
   - Show inventory overview
   - Explain limited access (no user management)

4. **Show Staff Features**:
   - Logout and login as Staff (use the one you created)
   - Show simple view-only dashboard
   - Explain most restricted access

5. **Show Security**:
   - Open browser DevTools → Network tab
   - Show JWT token in request headers
   - Explain password hashing in backend code

---

## 📞 Support

If you encounter any issues:
1. Check that both backend and frontend are running
2. Clear browser cache and try again
3. Check console for error messages
4. Verify you're using correct login credentials

---

**Project Created By**: [Your Name]
**Date**: January 2026
**Technology**: React.js + Express.js + JWT Authentication
