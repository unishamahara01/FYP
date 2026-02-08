# 🚀 MediTrust Setup Guide

## ⚠️ Important: How to Run the Project

### ❌ WRONG WAY (This causes the error you saw)
```bash
# DON'T do this from root folder:
npm start  # ❌ This will fail!
```

### ✅ CORRECT WAYS

#### Method 1: Use the Batch File (Recommended)
```bash
# Just double-click this file:
start-project.bat
```

#### Method 2: Two Separate Terminals

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm start
```

#### Method 3: From Root with npm scripts
```bash
# Terminal 1
npm run start:backend

# Terminal 2
npm run start:frontend
```

## 📝 Why the Error Happened

The error you saw:
```
npm error code ENOENT
npm error path C:\Users\unish\FYP project\package.json
```

**Reason:** You ran `npm start` from the root folder, but the root folder didn't have a `package.json` file. The actual applications are in:
- `backend/` folder (has its own package.json)
- `frontend/` folder (has its own package.json)

**Solution:** I've now created a root `package.json` file, so you can use the npm scripts from the root folder too!

## 🔧 First Time Setup

### Step 1: Install Dependencies

**Option A: Install everything at once**
```bash
npm run install:all
```

**Option B: Install separately**
```bash
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

### Step 2: Start the Servers

Use any of the methods mentioned above!

### Step 3: Open in Browser
```
http://localhost:3000
```

## 🎯 Quick Test

1. **Start servers** using `start-project.bat`
2. **Open browser** to `http://localhost:3000`
3. **Login** with:
   - Email: `prajita01@gmail.com`
   - Password: `password123`
4. **Success!** You should see the dashboard

## 🐛 Common Issues

### Issue 1: "npm start" doesn't work from root
**Solution:** Use `npm run start:backend` or `npm run start:frontend` instead

### Issue 2: Port already in use
**Solution:** 
```bash
# Kill the process using the port
# Windows:
netstat -ano | findstr :3001
taskkill /PID <process_id> /F
```

### Issue 3: "Failed to fetch" in browser
**Solution:** Make sure backend is running on port 3001

## 📂 Project Structure

```
FYP project/
├── package.json          ← Root package.json (NEW!)
├── start-project.bat     ← Double-click to start
├── backend/
│   ├── package.json      ← Backend dependencies
│   └── server.js         ← Backend server
└── frontend/
    ├── package.json      ← Frontend dependencies
    └── src/              ← React app
```

## ✅ Verification Checklist

- [ ] Backend running on `http://localhost:3001`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Can login with test credentials
- [ ] Dashboard loads successfully
- [ ] No console errors

## 🎓 For Your Teacher

**To demonstrate:**
1. Show the error was fixed by creating root package.json
2. Show multiple ways to start the project
3. Show the application working
4. Show role-based access control

## 💡 Pro Tips

1. **Always start backend first** (it takes less time)
2. **Keep both terminals open** while using the app
3. **Use `start-project.bat`** for quickest startup
4. **Check console logs** if something doesn't work

## 🎉 You're Ready!

The error is now fixed. You can run the project from:
- Root folder using npm scripts
- Individual folders (backend/frontend)
- Using the batch file

Choose whichever method you prefer!
