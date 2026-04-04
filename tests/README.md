# MediTrust Testing Suite

This folder contains comprehensive testing documentation and tools for the MediTrust Pharmacy Management System.

## 📁 Files in This Folder

1. **TESTING_GUIDE.md** - Complete testing guide with all test cases
2. **MediTrust_Postman_Collection.json** - Postman collection for API testing
3. **TEST_EXECUTION_CHECKLIST.md** - Checklist for systematic test execution
4. **README.md** - This file

## 🚀 Quick Start

### Step 1: Setup Environment
```bash
# Start MongoDB
mongod

# Start Backend Server
cd backend
npm start

# Start AI/ML Server
cd ai
python app.py

# Start Frontend
cd frontend
npm start
```

### Step 2: Import Postman Collection
1. Open Postman
2. Click "Import" button
3. Select `MediTrust_Postman_Collection.json`
4. Collection will be imported with all test cases

### Step 3: Run Tests
1. Open Postman collection
2. Run "Login - Admin" to get authentication token
3. Token will be automatically saved to collection variables
4. Run other tests in sequence

## 📊 Test Coverage

### Backend API Tests (Postman)
- ✅ Authentication (Login, Register, Token validation)
- ✅ Products & Inventory (CRUD operations, Low stock)
- ✅ Orders (Create, Read, Update, Delete)
- ✅ Dashboard & Analytics (Stats, Charts, Forecasts)
- ✅ Admin Features (Users, Departments, Pharmacies)
- ✅ Customers & Suppliers (CRUD operations)
- ✅ Purchase Orders & Reorder Suggestions
- ✅ Email Notifications

### AI/ML Feature Tests
- ✅ ML Backend Health Check
- ✅ Model Training (Ridge Regression)
- ✅ Expiry Predictions (Risk scores, Levels, Recommendations)
- ✅ Automatic Discount Calculation (Based on risk score)
- ✅ Demand Forecasting (30-day predictions, Stockout risk)
- ✅ Promotion Management (Apply/Remove discounts)
- ✅ AI Chatbot (Medicine information)

### Frontend UI Tests (Manual)
- ✅ Login Page
- ✅ Pharmacist Dashboard
- ✅ AI Analytics Page (Expiry & Demand tabs)
- ✅ Inventory Management
- ✅ Order Management
- ✅ Admin Dashboard (All tabs)
- ✅ QR Code Features

### Performance & Security Tests
- ✅ Load Testing (100+ products, 500+ orders)
- ✅ Response Time Validation
- ✅ Authentication Security
- ✅ Input Validation
- ✅ Role-Based Access Control

## 🎯 Key Test Scenarios

### AI Feature Testing Priority

#### 1. Expiry Prediction Accuracy
```
Test: Add product expiring in 10 days
Expected: Risk Level = "Critical", Risk Score > 80
Discount: Automatically calculated as (riskScore/100) × 30
```

#### 2. Automatic Discount Calculation
```
Risk Score 100 → 30% discount
Risk Score 90  → 27% discount
Risk Score 85  → 26% discount
Risk Score 70  → 21% discount
Risk Score 50  → 15% discount

Formula: (riskScore / 100) × 30
```

#### 3. Demand Forecasting
```
Test: Create 30 days of sales history
Expected: Predicted 30-day demand calculated
Stockout Risk: High/Medium/Low based on current stock
```

#### 4. Smart Reorder Suggestions
```
Test: Product quantity below reorder point
Expected: Appears in reorder suggestions
Suggested Qty: Calculated based on demand
```

## 📝 Test Execution Order

1. **Authentication Tests** - Get valid tokens
2. **Product Tests** - Create test data
3. **AI Model Training** - Train with test data
4. **AI Prediction Tests** - Validate predictions
5. **Discount Calculation Tests** - Verify formula
6. **Order Tests** - Test order flow
7. **Admin Tests** - Test admin features
8. **Frontend Tests** - Manual UI testing
9. **Performance Tests** - Load and speed tests
10. **Security Tests** - Vulnerability checks

## 🔍 How to Use Postman Collection

### Variables
The collection uses these variables:
- `baseUrl`: http://localhost:3001 (Backend)
- `aiUrl`: http://localhost:5001 (AI/ML)
- `token`: Auto-saved after login
- `productId`: Auto-saved from product tests
- `orderId`: Auto-saved from order tests

### Test Scripts
Each request includes test scripts that:
- Validate response status codes
- Check response data structure
- Verify business logic
- Auto-save IDs for subsequent tests

### Running Tests
1. **Individual Test**: Click request → Send
2. **Folder Test**: Right-click folder → Run
3. **Collection Test**: Click collection → Run

## 📈 Expected Results

### Success Criteria
- ✅ All API endpoints return correct status codes
- ✅ AI model trains with >80% accuracy
- ✅ Expiry predictions show correct risk levels
- ✅ Automatic discounts calculate correctly
- ✅ Demand forecasts are reasonable
- ✅ All CRUD operations work
- ✅ Email notifications send successfully
- ✅ Frontend displays data correctly
- ✅ Role-based access enforced
- ✅ Performance meets requirements

### Pass Rate Target
- **Minimum**: 95% (138/145 tests)
- **Target**: 100% (145/145 tests)

## 🐛 Bug Reporting

When you find a bug, document:
1. Test number and name
2. Steps to reproduce
3. Expected result
4. Actual result
5. Screenshots (if UI bug)
6. Error messages
7. Severity (Critical/High/Medium/Low)

## 📞 Support

For testing questions or issues:
- Check TESTING_GUIDE.md for detailed instructions
- Review Postman test scripts for validation logic
- Use TEST_EXECUTION_CHECKLIST.md for systematic testing

## 🎓 For Defense Presentation

### Key Points to Demonstrate

1. **AI Expiry Prediction**
   - Show products with different risk levels
   - Demonstrate automatic discount calculation
   - Explain Ridge Regression algorithm

2. **AI Demand Forecasting**
   - Show predicted 30-day demand
   - Demonstrate stockout risk calculation
   - Explain time series analysis

3. **Smart Reorder System**
   - Show reorder suggestions
   - Demonstrate purchase order creation
   - Show stock fulfillment

4. **Admin vs Pharmacist**
   - Show role-based access
   - Demonstrate Admin has same AI features
   - Show stats cards only on Users tab

5. **Automatic Features**
   - Discount calculation based on risk
   - Low stock email alerts
   - AI model retraining

## ✅ Pre-Defense Checklist

- [ ] All servers running
- [ ] Database seeded with demo data
- [ ] AI model trained
- [ ] Postman collection tested
- [ ] Frontend working smoothly
- [ ] All features demonstrated
- [ ] Screenshots prepared
- [ ] Backup plan ready

---

**Good luck with your testing and defense! 🎉**
