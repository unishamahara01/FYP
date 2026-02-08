# 🚀 Complete MediTrust Startup Guide

## 📚 Table of Contents
1. [First Time Setup](#first-time-setup)
2. [Daily Workflow](#daily-workflow)
3. [Understanding the System](#understanding-the-system)
4. [Demo Preparation](#demo-preparation)
5. [Quick Reference](#quick-reference)

---

## 🎯 First Time Setup

### You Only Need to Do This Once:

#### 1. Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
cd ..
```

#### 2. Setup MongoDB
```bash
.\setup-mongodb.bat
```

#### 3. Seed Database
```bash
cd backend
node seedAllData.js
cd ..
```

#### 4. Create Desktop Shortcut (Optional but Recommended)
- Right-click `START_PROJECT.bat`
- Select "Send to" → "Desktop (create shortcut)"
- Rename to "Start MediTrust"

✅ **Setup Complete!** You're ready to use MediTrust.

---

## 📅 Daily Workflow

### Every Time You Want to Work on MediTrust:

#### Step 1: Start the System
```bash
# Option A: Double-click desktop shortcut (EASIEST)
# Option B: Double-click START_PROJECT.bat in project folder
# Option C: Run in terminal
.\START_PROJECT.bat
```

#### Step 2: Wait for Startup (10-15 seconds)
You'll see:
- ✅ MongoDB check
- ✅ Port availability check
- ✅ Backend starting
- ✅ Frontend starting
- ✅ Browser opening automatically

#### Step 3: Two Windows Will Open
- **"MediTrust Backend"** - Keep this open!
- **"MediTrust Frontend"** - Keep this open!

#### Step 4: Browser Opens Automatically
- URL: http://localhost:3000
- You'll see the MediTrust landing page

#### Step 5: Login
Use any of these test accounts:
| Email | Password | Role |
|-------|----------|------|
| admin@meditrust.com | password123 | Admin |
| pharmacist@meditrust.com | password123 | Pharmacist |
| staff@meditrust.com | password123 | Staff |

#### Step 6: Start Working!
- View Dashboard
- Manage Inventory
- Create Orders
- View Reports

---

## 🔍 Understanding the System

### What Runs Where:

#### MongoDB (Port 27017)
- **What**: Database service
- **Runs**: In background as Windows service
- **Stores**: Users, products, orders, sales
- **Status**: Always running (even when VS Code is closed)
- **Data**: Persists permanently

#### Backend Server (Port 3001)
- **What**: Node.js/Express API
- **Runs**: In "MediTrust Backend" terminal window
- **Provides**: API endpoints for frontend
- **Status**: Runs only when terminal is open
- **Stops**: When you close the terminal or VS Code

#### Frontend Server (Port 3000)
- **What**: React development server
- **Runs**: In "MediTrust Frontend" terminal window
- **Provides**: User interface
- **Status**: Runs only when terminal is open
- **Stops**: When you close the terminal or VS Code

### Why Servers Stop When You Close VS Code:

```
VS Code Open → Terminals Open → Servers Running ✅
VS Code Closed → Terminals Closed → Servers Stopped ❌
```

**This is normal!** Just run `START_PROJECT.bat` again when you reopen VS Code.

### Your Data is Safe:

```
MongoDB = Background Service = Always Running = Data Safe ✅
```

Even when servers stop, your data in MongoDB is safe and will be there when you restart.

---

## 🎓 Demo Preparation

### 1 Day Before Demo:

- [ ] Test the complete system
- [ ] Create a desktop shortcut
- [ ] Practice the startup process
- [ ] Verify all features work
- [ ] Check MongoDB is running
- [ ] Clear any old test data if needed

### 1 Hour Before Demo:

- [ ] Close all applications
- [ ] Run `START_PROJECT.bat`
- [ ] Verify both server windows are open
- [ ] Login and test each feature:
  - [ ] Dashboard loads with real data
  - [ ] Can view inventory
  - [ ] Can create a product
  - [ ] Can create an order
  - [ ] Sales graph updates
- [ ] Keep browser tab open
- [ ] Keep server windows visible but minimized

### During Demo:

✅ **DO:**
- Keep server windows open (minimize them)
- Keep VS Code open
- Show features confidently
- Explain MongoDB integration
- Demonstrate real-time updates

❌ **DON'T:**
- Close server windows
- Close VS Code
- Refresh page unnecessarily
- Click too fast (let things load)
- Panic if something is slow

### Demo Script:

1. **Introduction** (1 min)
   - "This is MediTrust, a pharmacy management system"
   - "Built with React, Node.js, and MongoDB"

2. **Dashboard** (2 min)
   - Show real-time stats from database
   - Explain sales forecast graph
   - Point out data comes from MongoDB

3. **Inventory Management** (2 min)
   - Show existing products
   - Add a new product
   - Explain auto-generated batch numbers
   - Show product appears immediately

4. **Order Management** (3 min)
   - Create a new order
   - Select products from inventory
   - Show stock decreases automatically
   - Show order appears in table
   - **Go back to dashboard**
   - Show sales graph updated with new order

5. **Technical Explanation** (2 min)
   - MongoDB stores all data
   - Backend API handles business logic
   - Frontend React app for user interface
   - Real-time updates across system

### After Demo:

- You can close everything
- MongoDB keeps running
- Data is saved
- Ready for next time

---

## 📋 Quick Reference

### Essential Commands:

```bash
# Start everything
.\START_PROJECT.bat

# Check if servers are running
netstat -ano | findstr ":3000 :3001"

# Check if MongoDB is running
tasklist | findstr mongod

# Kill stuck processes
npx kill-port 3000
npx kill-port 3001

# Reseed database
cd backend
node seedAllData.js
```

### Essential URLs:

```
Frontend:  http://localhost:3000
Backend:   http://localhost:3001
MongoDB:   mongodb://localhost:27017/meditrust
```

### Essential Files:

```
START_PROJECT.bat          - Start everything
setup-mongodb.bat          - Setup MongoDB
HOW_TO_START.md           - Detailed instructions
TROUBLESHOOTING_GUIDE.md  - Fix common issues
QUICK_START_CARD.md       - Quick reference card
```

### Test Accounts:

```
Email: admin@meditrust.com
Password: password123
Role: Admin (full access)

Email: pharmacist@meditrust.com
Password: password123
Role: Pharmacist (inventory + orders)

Email: staff@meditrust.com
Password: password123
Role: Staff (view only)
```

---

## 🆘 Common Issues

### "Failed to fetch"
**Solution**: Run `START_PROJECT.bat` again

### Port already in use
**Solution**: Script fixes automatically, or run:
```bash
npx kill-port 3000
npx kill-port 3001
```

### MongoDB not running
**Solution**: Run `setup-mongodb.bat`

### Servers stop when closing VS Code
**Solution**: This is normal! Run `START_PROJECT.bat` when you reopen

---

## 💡 Pro Tips

1. **Create desktop shortcut** - Fastest way to start
2. **Keep server windows visible** - Easy to spot errors
3. **Test before demo** - Verify everything works
4. **Don't close server windows** - Servers will stop
5. **MongoDB runs in background** - Your data is always safe

---

## 🎯 Success Checklist

Before considering your system "ready":

- [ ] Can start with one click (desktop shortcut)
- [ ] Both server windows open
- [ ] Browser opens automatically
- [ ] Can login successfully
- [ ] Dashboard shows real data from MongoDB
- [ ] Can add products to inventory
- [ ] Can create orders
- [ ] Orders update inventory automatically
- [ ] Sales graph updates with new orders
- [ ] Data persists after restart

---

## 📞 Need Help?

1. Check `TROUBLESHOOTING_GUIDE.md`
2. Look at backend terminal for errors
3. Check browser console (F12) for frontend errors
4. Try emergency reset (in troubleshooting guide)
5. Most issues fixed by restarting

---

## 🎉 You're Ready!

You now have:
- ✅ Complete understanding of the system
- ✅ Easy startup process
- ✅ Demo preparation guide
- ✅ Troubleshooting knowledge
- ✅ Quick reference materials

**Your teacher will be impressed!**

---

**Project**: MediTrust Pharmacy Management System  
**Your Email**: unishamahara01@gmail.com  
**Last Updated**: January 18, 2026  

**Good luck with your demo! 🚀**
