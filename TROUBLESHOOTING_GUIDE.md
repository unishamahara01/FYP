# 🔧 MediTrust Troubleshooting Guide

## Common Issues and Solutions

---

## 1️⃣ "Failed to fetch" Error

### Symptoms:
- Frontend loads but shows "Failed to fetch" error
- Dashboard shows loading spinner forever
- Login doesn't work

### Cause:
Backend server is not running

### Solution:
```bash
# Option 1: Use the startup script
.\START_PROJECT.bat

# Option 2: Start backend manually
cd backend
npm start
```

### Prevention:
Always run `START_PROJECT.bat` when you start working

---

## 2️⃣ Port Already in Use

### Symptoms:
- Error: "Port 3000 is already in use"
- Error: "Port 3001 is already in use"
- Servers won't start

### Cause:
Old server process is still running

### Solution:
The `START_PROJECT.bat` script automatically fixes this, but if needed:

```bash
# Kill port 3001 (backend)
npx kill-port 3001

# Kill port 3000 (frontend)
npx kill-port 3000

# Then restart
.\START_PROJECT.bat
```

---

## 3️⃣ MongoDB Not Running

### Symptoms:
- Error: "MongoDB connection failed"
- Backend crashes on startup
- Can't save data

### Cause:
MongoDB service is not running

### Solution:
```bash
# Run the MongoDB setup script
.\setup-mongodb.bat

# Then start your project
.\START_PROJECT.bat
```

### Check if MongoDB is Running:
```bash
tasklist | findstr mongod
```

If you see "mongod.exe", MongoDB is running ✅

---

## 4️⃣ Servers Stop When Closing VS Code

### Symptoms:
- Everything works in VS Code
- Close VS Code → servers stop
- Reopen VS Code → "Failed to fetch"

### Cause:
This is **normal behavior**. Servers run in terminal windows.

### Solution:
**Every time you open VS Code**, run:
```bash
.\START_PROJECT.bat
```

### Why This Happens:
- Servers run in terminal processes
- Closing VS Code closes terminals
- MongoDB keeps running (it's a service)
- Your data is safe

### Prevention:
- Create a desktop shortcut to `START_PROJECT.bat`
- Run it before opening VS Code
- Keep server windows open during work

---

## 5️⃣ Browser Doesn't Open Automatically

### Symptoms:
- Script runs successfully
- Browser doesn't open

### Cause:
Browser settings or timing issue

### Solution:
Manually open your browser and go to:
```
http://localhost:3000
```

---

## 6️⃣ Orders Not Displaying

### Symptoms:
- Create order successfully
- Order doesn't appear in table
- Shows "N/A" in fields

### Cause:
Old seeded data with different schema

### Solution:
```bash
# Clear old orders
cd backend
node clearOldOrders.js

# Restart servers
cd ..
.\START_PROJECT.bat
```

---

## 7️⃣ Products Not Adding

### Symptoms:
- Click "Add Product"
- Nothing happens
- Console shows errors

### Cause:
Backend not responding or validation error

### Solution:
1. Check backend terminal for errors
2. Make sure all required fields are filled
3. Check batch number is unique
4. Restart backend if needed

---

## 8️⃣ Sales Graph Not Updating

### Symptoms:
- Create orders
- Graph doesn't change
- Shows old data

### Cause:
Dashboard not refreshing

### Solution:
1. Refresh the page (F5)
2. Check if order was created successfully
3. Check backend terminal for errors
4. Verify sale record was created in MongoDB

---

## 9️⃣ Login Issues

### Symptoms:
- Can't login
- "Invalid credentials" error
- User not found

### Cause:
Database not seeded or wrong password

### Solution:
```bash
# Reseed users
cd backend
node seedUsers.js

# Test users (password: password123):
# admin@meditrust.com
# pharmacist@meditrust.com
# staff@meditrust.com
```

---

## 🔟 npm Errors

### Symptoms:
- "npm is not recognized"
- "Module not found"
- Package errors

### Cause:
Dependencies not installed

### Solution:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Then restart
cd ..
.\START_PROJECT.bat
```

---

## 🆘 Emergency Reset

If nothing works, do a complete reset:

```bash
# 1. Kill all processes
npx kill-port 3000
npx kill-port 3001

# 2. Reinstall dependencies
cd backend
npm install
cd ../frontend
npm install
cd ..

# 3. Restart MongoDB
.\setup-mongodb.bat

# 4. Reseed database
cd backend
node seedAllData.js
cd ..

# 5. Start project
.\START_PROJECT.bat
```

---

## 📞 Quick Diagnostic Commands

### Check if servers are running:
```bash
netstat -ano | findstr ":3000 :3001"
```

### Check if MongoDB is running:
```bash
tasklist | findstr mongod
```

### Check backend health:
Open in browser: http://localhost:3001

Should show: `{"message":"MediTrust Backend API is running","status":"healthy"}`

### Check frontend:
Open in browser: http://localhost:3000

Should show: MediTrust landing page

---

## 🎯 Pre-Demo Checklist

Before your teacher demo, verify:

- [ ] MongoDB is running
- [ ] Backend starts without errors
- [ ] Frontend loads properly
- [ ] Can login successfully
- [ ] Dashboard shows real data
- [ ] Can create products
- [ ] Can create orders
- [ ] Sales graph updates
- [ ] All server windows stay open

---

## 💡 Pro Tips

1. **Always check backend terminal** - Most errors show there
2. **Keep server windows visible** - Easy to spot errors
3. **Test before demo** - Create a test order to verify everything works
4. **Have backup plan** - Know how to restart quickly
5. **Don't panic** - Most issues are fixed by restarting

---

## 📧 Still Having Issues?

If you're still stuck:

1. Check the backend terminal for error messages
2. Check the browser console (F12) for frontend errors
3. Verify MongoDB is running
4. Try the emergency reset procedure above
5. Make sure all files are saved

---

**Remember**: Most issues are solved by running `START_PROJECT.bat` again!

**Last Updated**: January 18, 2026
