# MediTrust MongoDB - Quick Reference Card

## 🚀 Start Application

```cmd
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

**Access:** http://localhost:3000

---

## 🔐 Login Credentials

**Admin:**
- Email: `admin@meditrust.com`
- Password: `password123`
- Role: Admin

**Pharmacist:**
- Email: `john.doe@meditrust.com`
- Password: `password123`
- Role: Pharmacist

**Staff:**
- Email: `ankita01@gmail.com`
- Password: `password123`
- Role: Staff

---

## 📊 Database Commands

```cmd
# View all users
mongosh
use meditrust
db.users.find().pretty()

# Count users
db.users.countDocuments()

# Reset database
cd backend
npm run seed
```

---

## 🔧 Troubleshooting

**MongoDB not running:**
```cmd
net start MongoDB
```

**Reset everything:**
```cmd
cd backend
npm run seed
npm start
```

**Clear browser cache:**
```
Ctrl + Shift + R
```

---

## 📁 Key Files

- `backend/server.js` - Main backend (MongoDB integrated)
- `backend/models/User.js` - User schema
- `backend/config/database.js` - DB connection
- `backend/seedUsers.js` - Seed script
- `backend/.env` - Configuration
- `frontend/src/pages/AdminDashboard.jsx` - User management

---

## ✅ Features

- ✅ Persistent MongoDB storage
- ✅ User authentication (JWT)
- ✅ Role-based access (Admin/Pharmacist/Staff)
- ✅ Admin Dashboard (CRUD users)
- ✅ Google OAuth ready
- ✅ Password hashing (bcrypt)
- ✅ Data survives restarts

---

## 🎯 Test Checklist

- [ ] Login as Admin
- [ ] View all users in Admin Dashboard
- [ ] Add new user
- [ ] Edit user
- [ ] Delete user
- [ ] Search users
- [ ] Signup new account
- [ ] Login with new account
- [ ] Restart servers - data persists

---

## 📞 Help

- `MONGODB_SETUP.md` - Setup guide
- `MONGODB_INTEGRATION_COMPLETE.md` - Full docs
- `MONGODB_SUCCESS.md` - Status & demo guide

---

**Status:** ✅ Running and Ready!
