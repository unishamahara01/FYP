# ML Backend - Expiry Prediction with Machine Learning

## Overview
This is the Python-based Machine Learning backend for the Pharmacy Management System. It uses **Random Forest Classifier** to predict medicine expiry risks based on historical data.

## Features
- **Real Machine Learning**: Uses scikit-learn Random Forest algorithm
- **Feature Engineering**: Extracts 10 features from product data
- **Training**: Learns from your actual product and sales data
- **Prediction**: Provides ML-based risk scores with confidence levels

## ML Features Used
1. Days until expiry
2. Product age (days since manufacture)
3. Total shelf life
4. Percentage of shelf life remaining
5. Current stock quantity
6. Product value (price × quantity)
7. Sales velocity (daily sales rate)
8. Days to sell current stock
9. Will expire before being sold (binary)
10. Stock level category

## Installation

### Step 1: Install Python
Make sure Python 3.8+ is installed:
```bash
python --version
```

### Step 2: Install Dependencies
```bash
cd ml-backend
pip install -r requirements.txt
```

### Step 3: Start ML Server
```bash
python app.py
```

Server will run on: http://localhost:5000

## API Endpoints

### 1. Train Model
**POST** `/train`

Trains the ML model on current product data.

Response:
```json
{
  "success": true,
  "message": "Model trained successfully",
  "training_samples": 17,
  "accuracy": 0.94,
  "high_risk_count": 8,
  "low_risk_count": 9
}
```

### 2. Predict Expiry Risk
**GET** `/predict`

Returns ML predictions for all products.

Response:
```json
{
  "totalAnalyzed": 17,
  "criticalRisk": 8,
  "highRisk": 3,
  "mediumRisk": 4,
  "totalValueAtRisk": 126102,
  "predictions": [...],
  "modelType": "Random Forest Classifier",
  "mlEnabled": true
}
```

### 3. Health Check
**GET** `/health`

Check if ML backend is running.

## How It Works

1. **Feature Extraction**: Extracts 10 numerical features from each product
2. **Label Creation**: Creates training labels based on expiry risk rules
3. **Model Training**: Trains Random Forest with 100 trees
4. **Prediction**: Uses trained model to predict risk probability (0-100%)
5. **Recommendation**: Generates actionable recommendations

## ML Algorithm: Random Forest

- **Type**: Ensemble Learning (Classification)
- **Trees**: 100 decision trees
- **Max Depth**: 10 levels
- **Class Weight**: Balanced (handles imbalanced data)
- **Output**: Risk probability (0-1) converted to score (0-100)

## Advantages Over Rule-Based

| Feature | Rule-Based | ML-Based |
|---------|-----------|----------|
| Learning | No | Yes - learns from data |
| Accuracy | Fixed rules | Improves with more data |
| Adaptability | Manual updates | Automatic adaptation |
| Confidence | No confidence score | Provides probability |
| Complex Patterns | Limited | Detects hidden patterns |

## Usage in Node.js Backend

Update your Node.js server to call ML backend:

```javascript
// Call ML prediction endpoint
const mlResponse = await fetch('http://localhost:5000/predict');
const mlData = await mlResponse.json();
```

## Training the Model

The model should be retrained:
- When new products are added
- After significant sales activity
- Weekly for best accuracy
- When prediction accuracy drops

## Files
- `app.py` - Main Flask application
- `requirements.txt` - Python dependencies
- `models/` - Saved ML models (created after training)
  - `expiry_model.pkl` - Trained Random Forest model
  - `scaler.pkl` - Feature scaler

## Troubleshooting

**Error: Model not trained**
- Solution: Call `/train` endpoint first

**Error: Not enough data**
- Solution: Need at least 5 products with expiry dates

**Error: MongoDB connection failed**
- Solution: Make sure MongoDB is running on localhost:27017
