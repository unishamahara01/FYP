# AI Backend - Pharmacy Management System

## Overview
This folder contains all AI/ML implementations using **Linear Regression** and **Google Gemini API**.

## AI Features

### 1. Expiry Prediction (`expiry_prediction.py`)
- **Algorithm**: Linear Regression
- **Purpose**: Predict which medicines are at risk of expiry
- **Features Used**:
  - Days until expiry
  - Current stock quantity
  - Average daily sales
  - Stock-to-sales ratio
  - Days since manufacture
- **Output**: Risk score (0-100), risk level, recommendations

### 2. Demand Prediction (`demand_prediction.py`)
- **Algorithm**: Linear Regression
- **Purpose**: Forecast demand using historical and seasonal trends
- **Features Used**:
  - Day of week
  - Week of month
  - Month
  - Previous week sales
  - Sales trend
- **Output**: 30-day demand forecast, stockout predictions

### 3. Reorder Suggestions (`reorder_suggestions.py`)
- **Algorithm**: Linear Regression + Economic Order Quantity (EOQ)
- **Purpose**: Automated reordering suggestions
- **Calculations**:
  - Reorder Point = (Avg Daily Demand × Lead Time) + Safety Stock
  - EOQ = sqrt((2 × Annual Demand × Ordering Cost) / Holding Cost)
- **Output**: Suggested order quantities, urgency levels

### 4. AI Chatbot (`chatbot.py`)
- **API**: Google Gemini API
- **Purpose**: Medicine information and recommendations
- **Features**:
  - Medicine uses and dosages
  - Side effects information
  - Drug interactions
  - Fallback rule-based responses

## Setup

### 1. Install Dependencies
```bash
cd ai
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Google API key
# Get key from: https://makersuite.google.com/app/apikey
```

### 3. Run Server
```bash
python app.py
```

Server will start on: http://localhost:5001

## API Endpoints

### Health Check
```
GET /health
```

### Train Expiry Model
```
POST /train/expiry
```

### Get Expiry Predictions
```
GET /predict/expiry
```

### Get Demand Predictions
```
GET /predict/demand
```

### Get Reorder Suggestions
```
GET /suggest/reorder
```

### Chatbot
```
POST /chatbot
Body: { "message": "What is Paracetamol used for?" }
```

## Models Folder
Trained models are saved in `models/` directory:
- `expiry_model.pkl` - Expiry prediction model
- `expiry_scaler.pkl` - Feature scaler for expiry
- `demand_model.pkl` - Demand prediction model
- `demand_scaler.pkl` - Feature scaler for demand

## How It Works

### Linear Regression
All predictions use scikit-learn's LinearRegression:
```python
from sklearn.linear_model import LinearRegression

model = LinearRegression()
model.fit(X_train, y_train)
predictions = model.predict(X_test)
```

### Google Gemini API
Chatbot uses Google's Gemini Pro model:
```python
import google.generativeai as genai

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro')
response = model.generate_content(prompt)
```

## File Structure
```
ai/
├── expiry_prediction.py      # Expiry risk prediction
├── demand_prediction.py       # Demand forecasting
├── reorder_suggestions.py     # Reorder automation
├── chatbot.py                 # AI chatbot
├── app.py                     # Flask server
├── requirements.txt           # Python dependencies
├── .env.example              # Environment template
├── README.md                 # This file
└── models/                   # Saved models (auto-created)
```

## Notes
- All AI models use **Linear Regression** (real ML, not fake)
- Models are trained on actual sales and inventory data
- Chatbot uses Google Gemini API (requires API key)
- Models are saved and can be reused without retraining
