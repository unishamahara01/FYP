# 💊 MediTrust - Intelligent Pharmacy Management System

A comprehensive pharmacy management system with real-time inventory tracking, order processing, and sales analytics. Built with React, Node.js, Express, and MongoDB.

![Status](https://img.shields.io/badge/status-active-success.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)
![React](https://img.shields.io/badge/frontend-React-blue.svg)
![Node.js](https://img.shields.io/badge/backend-Node.js-green.svg)

---

## 🚀 Quick Start (One Command!)

```bash
# Double-click this file or run:
.\START_PROJECT.bat
```

**That's it!** The browser will open automatically at http://localhost:3000

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure login/register with JWT
- Role-based access control (Admin, Pharmacist, Staff)
- Google OAuth integration
- Password reset with email verification

### 📊 Dashboard
- Real-time statistics from MongoDB
- Sales forecast with actual vs predicted data
- Inventory alerts (expiring items, low stock)
- Interactive charts and graphs

### 📦 Inventory Management
- Add/edit/delete products
- Auto-generated unique batch numbers
- Stock level tracking
- Expiry date monitoring
- Category-based organization

### 🛒 Order Processing
- Create customer orders
- Multi-product orders
- Automatic stock updates
- Multiple payment methods (Cash, Card, Insurance, Online)
- Real-time sales tracking

### 📈 Sales Analytics
- Monthly sales reports
- Sales forecast visualization
- Revenue tracking
- Order history

### 👥 User Management (Admin)
- Create/edit/delete users
- Assign roles and permissions
- View user activity
- Login history tracking

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React.js, Recharts |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **Authentication** | JWT, Passport.js, Google OAuth |
| **Email** | Nodemailer |
| **Styling** | CSS3 |

---

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm

---

## 🎯 Installation & Setup

### First Time Setup (Do Once):

#### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

#### 2. Setup MongoDB
```bash
.\setup-mongodb.bat
```

#### 3. Seed Database with Sample Data
```bash
cd backend
node seedAllData.js
cd ..
```

#### 4. Create Desktop Shortcut (Optional)
- Right-click `START_PROJECT.bat`
- Select "Send to" → "Desktop (create shortcut)"

✅ **Setup Complete!**

---

## 🚀 Running the Application

### Every Time You Start Working:

```bash
# Method 1: Double-click the desktop shortcut (EASIEST)

# Method 2: Double-click START_PROJECT.bat in project folder

# Method 3: Run in terminal
.\START_PROJECT.bat
```

The script will:
1. ✅ Check MongoDB is running
2. ✅ Clear any stuck processes
3. ✅ Start backend server (port 3001)
4. ✅ Start frontend server (port 3000)
5. ✅ Open browser automatically

**Keep the 2 server windows open!** Closing them stops the servers.

---

## 👤 Test Accounts

| Email | Password | Role | Permissions |
|-------|----------|------|-------------|
| admin@meditrust.com | password123 | Admin | Full access |
| pharmacist@meditrust.com | password123 | Pharmacist | Inventory + Orders |
| staff@meditrust.com | password123 | Staff | View only |

---

## 📁 Project Structure

```
MediTrust/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── config/          # Database configuration
│   ├── server.js        # Express server
│   ├── seedAllData.js   # Database seeding
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── components/  # Reusable components
│   │   └── App.js       # Main app component
│   └── package.json
├── START_PROJECT.bat    # One-click startup
├── setup-mongodb.bat    # MongoDB setup
└── README.md
```

---

## 🔧 Available Scripts

### Startup
```bash
.\START_PROJECT.bat              # Start everything
```

### Database Management
```bash
cd backend
node seedAllData.js              # Seed all data
node seedUsers.js                # Seed users only
node addSampleProducts.js        # Add sample products
node clearOldOrders.js           # Clear old orders
```

### Manual Server Start
```bash
# Backend
cd backend
npm start

# Frontend (in new terminal)
cd frontend
npm start
```

---

## 🌐 URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | User interface |
| Backend | http://localhost:3001 | API server |
| MongoDB | mongodb://localhost:27017/meditrust | Database |

---

## 📚 Documentation

- **[HOW_TO_START.md](HOW_TO_START.md)** - Detailed startup instructions
- **[COMPLETE_STARTUP_GUIDE.md](COMPLETE_STARTUP_GUIDE.md)** - Comprehensive guide
- **[TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md)** - Fix common issues
- **[QUICK_START_CARD.md](QUICK_START_CARD.md)** - Quick reference
- **[DATABASE_DOCUMENTATION.md](DATABASE_DOCUMENTATION.md)** - Database schema
- **[CREATE_DESKTOP_SHORTCUT.md](CREATE_DESKTOP_SHORTCUT.md)** - Shortcut guide

---

## 🆘 Troubleshooting

### "Failed to fetch" error?
```bash
# Backend is not running. Restart:
.\START_PROJECT.bat
```

### Port already in use?
```bash
# Kill processes and restart:
npx kill-port 3000
npx kill-port 3001
.\START_PROJECT.bat
```

### MongoDB not running?
```bash
.\setup-mongodb.bat
```

### Servers stop when closing VS Code?
**This is normal!** Just run `START_PROJECT.bat` again when you reopen.

**More help**: See [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md)

---

## 🎯 Demo Checklist

Before your demo:

- [ ] Run `START_PROJECT.bat`
- [ ] Wait for browser to open (10-15 seconds)
- [ ] Login as pharmacist
- [ ] Test creating a product
- [ ] Test creating an order
- [ ] Verify sales graph updates
- [ ] Keep server windows open during demo

---

## 📊 Database Schema

### Collections:
- **users** - User accounts and authentication
- **products** - Inventory items
- **orders** - Customer orders
- **sales** - Sales transactions
- **suppliers** - Supplier information
- **customers** - Customer records
- **passwordresets** - Password reset codes

See [DATABASE_DOCUMENTATION.md](DATABASE_DOCUMENTATION.md) for detailed schema.

---

## 🔐 Environment Variables

Create `.env` file in `backend/` directory:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/meditrust
JWT_SECRET=your-secret-key-change-this-in-production
SESSION_SECRET=your-session-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🚀 Features in Development

- [ ] Reports & Analytics module
- [ ] Suppliers management
- [ ] Customers management
- [ ] Expiry risk tracking
- [ ] Advanced search and filters
- [ ] Export to PDF/Excel
- [ ] Mobile responsive design

---

## 🤝 Contributing

This is a Final Year Project (FYP) for educational purposes.

---

## 📧 Contact

**Developer**: Unisha Mahara  
**Email**: unishamahara01@gmail.com  
**Project**: Final Year Project - Pharmacy Management System

---

## 📄 License

MIT License - Feel free to use this project for learning purposes.

---

## 🎉 Acknowledgments

- Built as a Final Year Project
- Demonstrates full-stack development skills
- Real-world pharmacy management solution
- MongoDB integration for data persistence
- Modern React UI/UX design

---

**⭐ Star this project if you find it helpful!**

**Last Updated**: January 18, 2026
