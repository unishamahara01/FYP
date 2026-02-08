# Machine Learning Setup Guide

## What Changed?

Your system now uses **REAL Machine Learning** instead of rule-based algorithms!

### Before (Rule-Based)
- Fixed weighted scoring
- No learning from data
- JavaScript only

### After (ML-Based)
- Random Forest Classifier
- Learns from historical data
- Python + scikit-learn

## Installation Steps

### Step 1: Check Python Installation

Open Command Prompt and run:
```bash
python --version
```

You should see Python 3.8 or higher. If not installed:
1. Download from: https://www.python.org/downloads/
2. During installation, CHECK "Add Python to PATH"
3. Restart computer

### Step 2: Install ML Dependencies

```bash
cd ml-backend
pip install -r requirements.txt
```

This installs:
- Flask (web server)
- scikit-learn (ML library)
- pandas (data processing)
- pymongo (MongoDB connection)

### Step 3: Start ML Backend

**Option A: Using batch file**
```bash
start-ml-backend.bat
```

**Option B: Manual**
```bash
cd ml-backend
python app.py
```

You should see:
```
🤖 ML Backend Server Starting...
📊 Machine Learning: Random Forest Classifier
🔗 MongoDB: mongodb://localhost:27017/meditrust
🚀 Server running on http://localhost:5000
```

### Step 4: Train the Model

Open a new Command Prompt:
```bash
curl -X POST http://localhost:5000/train
```

Or use browser: http://localhost:5000/train

You should see:
```json
{
  "success": true,
  "message": "Model trained successfully",
  "training_samples": 17,
  "accuracy": 0.94
}
```

### Step 5: Test ML Predictions

```bash
curl http://localhost:5000/predict
```

Or browser: http://localhost:5000/predict

## How to Run Complete System

You need 3 servers running:

1. **MongoDB** (Port 27017)
   ```bash
   mongod
   ```

2. **Node.js Backend** (Port 3001)
   ```bash
   cd backend
   node server.js
   ```

3. **Python ML Backend** (Port 5000)
   ```bash
   cd ml-backend
   python app.py
   ```

4. **React Frontend** (Port 3000)
   ```bash
   cd frontend
   npm start
   ```

## ML Features Explained

The ML model analyzes 10 features:

1. **Days until expiry** - How soon will it expire?
2. **Product age** - How old is the product?
3. **Shelf life** - Total lifespan of product
4. **Shelf life remaining %** - Percentage of life left
5. **Stock quantity** - How many units in stock?
6. **Product value** - Total value (price × quantity)
7. **Sales velocity** - How fast is it selling?
8. **Days to sell** - Time needed to sell current stock
9. **Will expire before sold?** - Binary prediction
10. **Stock level** - Low/Medium/High category

## ML Algorithm: Random Forest

- **Type**: Supervised Learning (Classification)
- **Algorithm**: Random Forest with 100 decision trees
- **Input**: 10 numerical features per product
- **Output**: Risk probability (0-100%)
- **Training**: Learns from your product and sales data

### Why Random Forest?

✅ Handles non-linear relationships
✅ Resistant to overfitting
✅ Provides feature importance
✅ Works well with small datasets
✅ Gives probability scores

## Retraining the Model

Retrain weekly or when:
- New products added
- Sales patterns change
- Accuracy drops

```bash
curl -X POST http://localhost:5000/train
```

## Troubleshooting

### Error: "python is not recognized"
- Python not installed or not in PATH
- Solution: Install Python and add to PATH

### Error: "No module named flask"
- Dependencies not installed
- Solution: `pip install -r requirements.txt`

### Error: "Model not trained"
- Model needs training first
- Solution: Call `/train` endpoint

### Error: "Connection refused on port 5000"
- ML backend not running
- Solution: Start `python app.py`

### Error: "Not enough data to train"
- Need at least 5 products
- Solution: Add more products with expiry dates

## Verification

Check if ML is working:

1. **Health Check**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"model_trained": true, "ml_backend": "Python Flask"}`

2. **Check Dashboard**
   - Login to your system
   - Dashboard should show AI predictions
   - Look for "ML Confidence" scores

3. **Check Console**
   - Node.js backend should log: "✅ Using ML predictions from Python backend"

## For Your Teacher/Presentation

You can now demonstrate:

✅ **Real Machine Learning** - Not just rules
✅ **Python + scikit-learn** - Industry-standard ML
✅ **Random Forest Algorithm** - Ensemble learning
✅ **Feature Engineering** - 10 extracted features
✅ **Model Training** - Learns from data
✅ **Confidence Scores** - ML probability outputs
✅ **Matches Proposal** - Python ML backend as specified

## Architecture

```
Frontend (React)
    ↓
Node.js Backend (Port 3001)
    ↓
Python ML Backend (Port 5000)
    ↓
MongoDB (Port 27017)
```

## Next Steps

After ML Expiry Prediction works:
1. Implement ML Demand Forecasting
2. Add Time Series analysis
3. Implement automated reordering
