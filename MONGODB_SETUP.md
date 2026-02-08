# MongoDB Setup Guide for MediTrust

## Overview
Your MediTrust application is now connected to MongoDB! All user data is stored in a MongoDB database instead of in-memory storage.

## Prerequisites

### Install MongoDB
You need MongoDB installed on your computer. Choose one option:

**Option 1: MongoDB Community Server (Recommended)**
1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Server
3. MongoDB will run on `mongodb://localhost:27017` by default

**Option 2: MongoDB Atlas (Cloud)**
1. Create free account at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env` with your Atlas connection string

## Setup Steps

### 1. Start MongoDB Service

**Windows:**
```cmd
net start MongoDB
```

Or open Services app and start "MongoDB Server"

**Check if MongoDB is running:**
```cmd
mongosh
```
If it connects, MongoDB is running! Type `exit` to quit.

### 2. Seed Initial Users

Run this command to populate your database with initial users:

```cmd
cd backend
npm run seed
```

This will create 5 users:
- Admin User (admin@meditrust.com) - Admin role
- John Doe (john.doe@meditrust.com) - Pharmacist role
- Ankita (ankita01@gmail.com) - Pharmacist role
- Prajita (prajita01@gmail.com) - Pharmacist role
- Unisha Mahara (unishamahara01@gmail.com) - Pharmacist role

**All users have password:** `password123`

### 3. Start Backend Server

```cmd
cd backend
npm start
```

You should see:
```
MongoDB Connected: localhost
Database Name: meditrust
MediTrust Backend Server running on port 3001
```

### 4. Start Frontend Server

Open a new terminal:
```cmd
cd frontend
npm start
```

## Database Structure

### User Schema
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: String (Admin, Pharmacist, Staff),
  permissions: [String],
  googleId: String (optional, for Google OAuth),
  avatar: String (optional),
  authProvider: String (local or google),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## MongoDB Commands

### View Database
```cmd
mongosh
use meditrust
db.users.find().pretty()
```

### Count Users
```cmd
db.users.countDocuments()
```

### Find Specific User
```cmd
db.users.findOne({ email: "admin@meditrust.com" })
```

### Delete All Users (Careful!)
```cmd
db.users.deleteMany({})
```

### Re-seed Database
```cmd
npm run seed
```

## Configuration

### Environment Variables (backend/.env)
```env
MONGODB_URI=mongodb://localhost:27017/meditrust
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meditrust?retryWrites=true&w=majority
```

## Features

✅ **Persistent Storage** - Data survives server restarts
✅ **User Management** - Create, read, update, delete users
✅ **Role-Based Access** - Admin, Pharmacist, Staff roles
✅ **Google OAuth** - Sign in with Google account
✅ **Password Hashing** - Secure bcrypt password storage
✅ **Automatic Timestamps** - createdAt and updatedAt fields

## Troubleshooting

### "MongoServerError: connect ECONNREFUSED"
- MongoDB service is not running
- Start MongoDB service (see Step 1)

### "User validation failed"
- Check that all required fields are provided
- Email must be unique

### "Cannot find module './models/User'"
- Make sure you're in the backend directory
- Check that `backend/models/User.js` exists

### Reset Everything
```cmd
cd backend
npm run seed
```

## What Changed?

### Before (In-Memory)
- Users stored in array
- Data lost on server restart
- No persistence

### After (MongoDB)
- Users stored in database
- Data persists across restarts
- Scalable and production-ready
- Can handle thousands of users

## Next Steps

1. ✅ MongoDB connected
2. ✅ User model created
3. ✅ All endpoints updated
4. ✅ Seed script ready
5. 🎯 Run `npm run seed` to populate database
6. 🎯 Start servers and test!

## Testing

1. Seed database: `npm run seed`
2. Start backend: `npm start`
3. Start frontend: `cd ../frontend && npm start`
4. Login with: `admin@meditrust.com` / `password123`
5. Test user management in Admin Dashboard
6. Create new users via signup
7. All data persists in MongoDB!
