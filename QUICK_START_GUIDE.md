# Quick Start Guide - MediTrust with Machine Learning

## How to Start Your Project

### Option 1: One-Click Start (EASIEST)

Just double-click this file:
```
START_PROJECT_WITH_ML.bat
```

This will automatically:
1. Start MongoDB
2. Start ML Backend (Python)
3. Start Node.js Backend
4. Start React Frontend
5. Open browser to http://localhost:3000

**4 command windows will open** - DO NOT CLOSE THEM!

---

### Option 2: Manual Start (Step by Step)

If the batch file doesn't work, start manually:

#### Step 1: Start MongoDB
```bash
# Open Command Prompt 1
cd C:\Program Files\MongoDB\Server\8.0\bin
mongod
```
Keep this window open!

#### Step 2: Start ML Backend
```bash
# Open Command Prompt 2
cd C:\Users\unish\FYP project\ml-backend
python app.py
```
You should see: "🚀 Server running on http://localhost:5001"
Keep this window open!

#### Step 3: Start Node.js Backend
```bash
# Open Command Prompt 3
cd C:\Users\unish\FYP project\backend
node server.js
```
You should see: "MediTrust Backend Server running on port 3001"
Keep this window open!

#### Step 4: Start React Frontend
```bash
# Open Command Prompt 4
cd C:\Users\unish\FYP project\frontend
npm start
```
Browser will open automatically to http://localhost:3000
Keep this window open!

---

## Login Credentials

**Email:** unishamahara01@gmail.com  
**Password:** password123

---

## What's Running?

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| MongoDB | 27017 | mongodb://localhost:27017 | Database |
| ML Backend | 5001 | http://localhost:5001 | Machine Learning (Python) |
| Node Backend | 3001 | http://localhost:3001/api | Main API |
| Frontend | 3000 | http://localhost:3000 | User Interface |

---

## How to Stop

Close all 4 command windows (MongoDB, ML Backend, Node Backend, Frontend)

Or press `Ctrl+C` in each window

---

## Troubleshooting

### Problem: "Port already in use"
**Solution:** Something is already running on that port
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Kill all python processes
taskkill /F /IM python.exe

# Then restart
```

### Problem: "MongoDB not found"
**Solution:** Check MongoDB installation path in the batch file
- Default: `C:\Program Files\MongoDB\Server\8.0\bin`
- Update the path in `START_PROJECT_WITH_ML.bat` if different

### Problem: "Python not found"
**Solution:** 
```bash
python --version
```
If error, install Python from https://www.python.org/downloads/
Make sure to check "Add Python to PATH" during installation

### Problem: "ML Backend not working"
**Solution:** Install Python dependencies
```bash
cd ml-backend
pip install -r requirements.txt
```

### Problem: "npm not found"
**Solution:** Install Node.js from https://nodejs.org/

---

## First Time Setup (One Time Only)

If this is your first time running the project:

### 1. Install Node.js Dependencies
```bash
cd frontend
npm install

cd ../backend
npm install
```

### 2. Install Python Dependencies
```bash
cd ml-backend
pip install -r requirements.txt
```

### 3. Train ML Model (First Time)
After starting all services, open browser:
```
http://localhost:5001/train
```
Or use Command Prompt:
```bash
curl -X POST http://localhost:5001/train
```

You should see:
```json
{
  "success": true,
  "message": "Model trained successfully",
  "training_samples": 17,
  "accuracy": 1.0
}
```

---

## Verification Checklist

After starting, verify everything is working:

- [ ] MongoDB running (check Task Manager for mongod.exe)
- [ ] ML Backend shows: "Server running on http://localhost:5001"
- [ ] Node Backend shows: "MediTrust Backend Server running on port 3001"
- [ ] Frontend opens in browser at http://localhost:3000
- [ ] Can login with credentials
- [ ] Dashboard shows AI predictions
- [ ] AI predictions show "ML Enabled: true"

---

## For Your Teacher/Presentation

When demonstrating:

1. **Start the project** using `START_PROJECT_WITH_ML.bat`
2. **Wait for all 4 windows** to show "running" messages
3. **Open browser** to http://localhost:3000
4. **Login** and show the Dashboard
5. **Point out the AI predictions** with ML confidence scores
6. **Explain** that it uses:
   - Python + scikit-learn
   - Random Forest Classifier
   - 10 engineered features
   - Real machine learning (not just rules)

---

## Daily Usage

Every time you want to run your project:

1. Double-click `START_PROJECT_WITH_ML.bat`
2. Wait 10-15 seconds
3. Browser opens automatically
4. Login and use the system

That's it! 🎉

---

## Need Help?

Check these files:
- `ML_SETUP_GUIDE.md` - Detailed ML setup
- `TROUBLESHOOTING_GUIDE.md` - Common issues
- `COMPLETE_STARTUP_GUIDE.md` - Full documentation
