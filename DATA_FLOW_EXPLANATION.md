# 📊 Data Flow Explanation - Where Dashboard Data Comes From

## 🔄 Complete Data Flow

### Step 1: Data is Stored in MongoDB
When you ran `node seedAllData.js`, it created:
- **179 Orders** in the `orders` collection
- **179 Sales** in the `sales` collection
- **8 Products** in the `products` collection
- **4 Customers** in the `customers` collection
- **3 Suppliers** in the `suppliers` collection

### Step 2: Backend API Fetches from MongoDB
**File**: `backend/server.js` (lines 903-1050)

#### API Endpoint 1: Dashboard Stats
```javascript
GET /api/dashboard/stats
```
**What it does:**
- Counts total products in MongoDB → `totalSKUs`
- Counts products expiring within 90 days → `expiringItems`
- Counts products below reorder level → `predictedShortages`
- Sums today's sales from `sales` collection → `todaysSales`

**MongoDB Query Example:**
```javascript
const totalProducts = await Product.countDocuments();
// Returns: 8 (because we have 8 products in database)

const todaySales = await Sale.aggregate([
  { $match: { date: { $gte: today } } },
  { $group: { _id: null, total: { $sum: "$amount" } } }
]);
// Returns: Sum of all sales made today
```

#### API Endpoint 2: Sales Forecast
```javascript
GET /api/sales/forecast
```
**What it does:**
- Queries `sales` collection for last 6 months (Jan-Jun 2025)
- Groups sales by month
- Calculates total for each month
- Adds 10% prediction for forecast line

**MongoDB Query:**
```javascript
const salesData = await Sale.aggregate([
  { $match: { year: 2025, month: { $in: months } } },
  { $group: { _id: "$month", actual: { $sum: "$amount" } } }
]);
```

**Example Result:**
```javascript
[
  { month: "Jan", actual: 2145, predicted: 2360 },
  { month: "Feb", actual: 1890, predicted: 2079 },
  { month: "Mar", actual: 2234, predicted: 2457 },
  // ... etc
]
```

### Step 3: Frontend Fetches from Backend API
**File**: `frontend/src/pages/Dashboard.jsx` (lines 8-30)

```javascript
useEffect(() => {
  fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
  const token = localStorage.getItem('authToken');
  
  // 1. Fetch stats from MongoDB via API
  const statsRes = await fetch('http://localhost:3001/api/dashboard/stats', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const statsData = await statsRes.json();
  setStats(statsData); // Updates state with real data
  
  // 2. Fetch sales forecast from MongoDB via API
  const salesRes = await fetch('http://localhost:3001/api/sales/forecast', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const salesForecast = await salesRes.json();
  setSalesData(salesForecast); // Updates chart with real data
};
```

### Step 4: Dashboard Displays the Data
**File**: `frontend/src/pages/Dashboard.jsx` (lines 100-200)

#### Stats Cards Display:
```javascript
<div className="stat-value">{stats.totalSKUs.toLocaleString()}</div>
// Shows: 8 (from MongoDB Product.countDocuments())

<div className="stat-value">{stats.expiringItems}</div>
// Shows: Number of products expiring within 90 days (from MongoDB)

<div className="stat-value">{stats.predictedShortages}</div>
// Shows: Number of low stock items (from MongoDB)

<div className="stat-value">₨{stats.todaysSales.toLocaleString()}</div>
// Shows: Today's total sales (from MongoDB Sale collection)
```

#### Sales Chart Display:
```javascript
<LineChart data={salesData}>
  <Line dataKey="actual" stroke="#667eea" name="Actual Sales (₨)" />
  <Line dataKey="predicted" stroke="#48bb78" name="Predicted Sales (₨)" />
</LineChart>
```
The `salesData` comes from MongoDB `sales` collection, grouped by month.

---

## 🎯 Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Products   │  │    Sales     │  │    Orders    │      │
│  │  (8 items)   │  │ (179 records)│  │ (179 records)│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────────────┐
                    │  BACKEND API  │
                    │  server.js    │
                    └───────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│ GET /api/        │                  │ GET /api/sales/  │
│ dashboard/stats  │                  │ forecast         │
└──────────────────┘                  └──────────────────┘
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│ Returns:         │                  │ Returns:         │
│ - totalSKUs: 8   │                  │ [                │
│ - expiringItems  │                  │   {month: "Jan", │
│ - lowStock       │                  │    actual: 2145} │
│ - todaysSales    │                  │   ...            │
└──────────────────┘                  └──────────────────┘
        ↓                                       ↓
        └───────────────────┬───────────────────┘
                            ↓
                    ┌───────────────┐
                    │   FRONTEND    │
                    │ Dashboard.jsx │
                    └───────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────┐
│  Stats Cards     │                  │  Sales Chart     │
│  Display Real    │                  │  Shows Real      │
│  MongoDB Data    │                  │  MongoDB Sales   │
└──────────────────┘                  └──────────────────┘
```

---

## 🔍 How to Verify Data is from MongoDB

### Method 1: Check MongoDB Compass
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Open `meditrust` database
4. Click on `sales` collection
5. You'll see 179 sales records
6. The chart shows the sum of these sales grouped by month

### Method 2: Check Browser Console
1. Open dashboard in browser
2. Press F12 to open Developer Tools
3. Go to "Network" tab
4. Refresh the page
5. You'll see two API calls:
   - `dashboard/stats` → Returns real counts from MongoDB
   - `sales/forecast` → Returns real sales data from MongoDB

### Method 3: Check Backend Logs
When the dashboard loads, the backend logs show:
```
GET /api/dashboard/stats 200
GET /api/sales/forecast 200
```

---

## 📈 Example: Sales Chart Data Source

### In MongoDB (sales collection):
```javascript
// January 2025 sales (example)
{ order: ObjectId(...), amount: 145, date: 2025-01-05, month: "January" }
{ order: ObjectId(...), amount: 230, date: 2025-01-12, month: "January" }
{ order: ObjectId(...), amount: 180, date: 2025-01-18, month: "January" }
// ... more January sales
// Total January: ₨2,145
```

### Backend API Groups It:
```javascript
// GET /api/sales/forecast returns:
[
  { month: "Jan", actual: 2145, predicted: 2360 },
  { month: "Feb", actual: 1890, predicted: 2079 },
  // ...
]
```

### Frontend Displays It:
The chart shows:
- Blue line (Actual): ₨2,145 for January
- Green dashed line (Predicted): ₨2,360 for January (10% higher)

---

## ✅ Summary

**Your dashboard data comes from:**

1. **MongoDB Database** (`meditrust`)
   - 179 sales records
   - 8 products
   - 4 customers
   - 3 suppliers

2. **Backend API** (`backend/server.js`)
   - Queries MongoDB
   - Calculates stats
   - Returns JSON data

3. **Frontend Dashboard** (`frontend/src/pages/Dashboard.jsx`)
   - Fetches from API
   - Displays in cards and charts
   - Updates in real-time

**Everything is connected and working!** 🎉

---

**To prove it to your teacher:**
1. Open MongoDB Compass → Show 179 sales records
2. Open Dashboard → Show the chart
3. Explain: "The chart data comes from these 179 sales in MongoDB"
4. Change data in MongoDB → Refresh dashboard → Data updates!

---

**Created**: January 18, 2026
**Status**: ✅ FULLY CONNECTED TO MONGODB
