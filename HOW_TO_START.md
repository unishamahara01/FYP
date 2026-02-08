# 🚀 How to Start MediTrust Project

## ⚡ Quick Start (RECOMMENDED)

### Every Time You Open VS Code or Your Computer:

1. **Double-click** `START_PROJECT.bat` in your project folder
2. Wait 10-15 seconds for everything to start
3. Browser will open automatically at http://localhost:3000
4. **Done!** Your project is ready to use

---

## 📋 What the Script Does Automatically:

✅ Checks if MongoDB is running (starts it if needed)  
✅ Clears any stuck processes on ports 3000 and 3001  
✅ Starts backend server (port 3001)  
✅ Starts frontend server (port 3000)  
✅ Opens your browser automatically  

---

## 🪟 Important: Keep Windows Open!

After running the script, you'll see **2 new command windows**:
- **"MediTrust Backend"** - Backend server (port 3001)
- **"MediTrust Frontend"** - Frontend server (port 3000)

**⚠️ DO NOT CLOSE THESE WINDOWS!**  
If you close them, the servers will stop and you'll get "Failed to fetch" errors.

---

## 🔄 What Happens When You Close VS Code?

When you close VS Code or Kiro:
- ❌ Backend server stops (port 3001)
- ❌ Frontend server stops (port 3000)
- ✅ MongoDB keeps running (background service)
- ✅ **Your data is safe** in MongoDB

**Next time you open VS Code:**
- Just run `START_PROJECT.bat` again
- Everything will work perfectly!

---

## 🛠️ Manual Start (Alternative Method)

If you prefer to start manually:

1. **Terminal 1** (Backend):
   ```bash
   cd backend
   npm start
   ```

2. **Terminal 2** (Frontend):
   ```bash
   cd frontend
   npm start
   ```

3. Open browser: http://localhost:3000

---

## 🔧 Troubleshooting

### ❌ "Failed to fetch" error?
**Cause**: Backend server is not running  
**Solution**: Run `START_PROJECT.bat` again

### ❌ Port already in use?
**Cause**: Old server process is still running  
**Solution**: The script automatically kills old processes, but if needed:
```bash
npx kill-port 3001
npx kill-port 3000
```

### ❌ MongoDB not running?
**Solution**: Run `setup-mongodb.bat` first, then `START_PROJECT.bat`

### ❌ Browser doesn't open automatically?
**Solution**: Manually open http://localhost:3000 in your browser

---

## 🎯 For Your Teacher Demo

### Before the Demo:
1. ✅ Run `START_PROJECT.bat`
2. ✅ Wait for browser to open (10-15 seconds)
3. ✅ Login with your credentials
4. ✅ Test creating an order to show real-time updates

### During the Demo:
- ✅ Keep the 2 server windows open
- ✅ Don't close VS Code
- ✅ Show inventory, orders, and dashboard features
- ✅ Demonstrate that data persists in MongoDB

### After the Demo:
- You can close the server windows
- MongoDB will keep running in background
- Your data is saved and safe

---

## 💡 Pro Tips

1. **Create a desktop shortcut** to `START_PROJECT.bat` for even faster access
2. **Always run the script** before opening VS Code for your project
3. **Check the server windows** - if you see errors, restart the script
4. **MongoDB runs as a service** - you only need to set it up once

---

## 📞 Quick Reference

| Component | URL | Status Check |
|-----------|-----|--------------|
| Frontend | http://localhost:3000 | Open in browser |
| Backend | http://localhost:3001 | Check terminal window |
| MongoDB | mongodb://localhost:27017 | Check with `mongosh` |

---

**Last Updated**: January 18, 2026  
**Project**: MediTrust Pharmacy Management System  
**Your Email**: unishamahara01@gmail.com
