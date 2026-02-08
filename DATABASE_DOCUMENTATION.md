# MediTrust Database Documentation

## Database Overview

**Database Name:** `meditrust`  
**Database Type:** MongoDB (NoSQL)  
**Connection:** localhost:27017

---

## Collections

### 1. **users** Collection

Stores all user accounts with authentication, roles, preferences, and login history.

#### Schema Structure:

```javascript
{
  _id: ObjectId,
  fullName: String (required, min 2 chars),
  email: String (required, unique, lowercase),
  password: String (hashed with bcrypt),
  role: String (enum: 'Admin', 'Pharmacist', 'Staff'),
  permissions: Array of Strings,
  googleId: String (for Google OAuth users),
  avatar: String (base64 image data or URL),
  authProvider: String (enum: 'local', 'google'),
  
  // User Preferences
  preferences: {
    notifications: {
      email: Boolean (default: true),
      loginAlerts: Boolean (default: true),
      systemUpdates: Boolean (default: false)
    },
    privacy: {
      profileVisibility: String (enum: 'everyone', 'team', 'private'),
      activityStatus: Boolean (default: true),
      dataCollection: Boolean (default: true)
    }
  },
  
  // Login History (last 10 logins)
  loginHistory: [{
    timestamp: Date,
    ipAddress: String,
    browser: String,
    device: String,
    success: Boolean
  }],
  
  lastLogin: Date,
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

#### Sample Document:

```json
{
  "_id": "ObjectId('696bc1d45b3c1a8c7367163')",
  "fullName": "Unisha Mahara",
  "email": "unishamahara01@gmail.com",
  "password": "$2a$10$...", // hashed
  "role": "Pharmacist",
  "permissions": ["view_inventory", "edit_inventory", "view_orders", "process_orders", "view_reports"],
  "authProvider": "local",
  "avatar": "data:image/jpeg;base64,...",
  "preferences": {
    "notifications": {
      "email": true,
      "loginAlerts": true,
      "systemUpdates": false
    },
    "privacy": {
      "profileVisibility": "team",
      "activityStatus": true,
      "dataCollection": true
    }
  },
  "loginHistory": [
    {
      "timestamp": "2026-01-17T10:41:00.000Z",
      "ipAddress": "::1",
      "browser": "Chrome",
      "device": "Desktop",
      "success": true
    }
  ],
  "lastLogin": "2026-01-17T10:41:00.000Z",
  "createdAt": "2026-01-17T08:37:00.000Z",
  "updatedAt": "2026-01-17T10:41:00.000Z"
}
```

#### Current Users (5 documents):

1. **Admin User** - admin@meditrust.com (Admin role)
2. **John Doe** - john.doe@meditrust.com (Pharmacist)
3. **Ankita** - ankita01@gmail.com (Pharmacist)
4. **Prajita** - prajita01@gmail.com (Pharmacist)
5. **Unisha Mahara** - unishamahara01@gmail.com (Pharmacist)

All passwords: `password123`

---

### 2. **passwordresets** Collection

Stores temporary password reset codes with automatic expiration.

#### Schema Structure:

```javascript
{
  _id: ObjectId,
  email: String (required, lowercase),
  code: String (6-digit code),
  expiresAt: Date (TTL index - auto-deletes after expiration),
  used: Boolean (default: false),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

#### Features:
- **Automatic Expiration:** Documents auto-delete after `expiresAt` time (15 minutes)
- **Single Use:** Marked as `used: true` after successful password reset
- **Indexed:** Fast lookups by email and code

#### Sample Document:

```json
{
  "_id": "ObjectId('...')",
  "email": "unishamahara01@gmail.com",
  "code": "123456",
  "expiresAt": "2026-01-17T11:00:00.000Z",
  "used": false,
  "createdAt": "2026-01-17T10:45:00.000Z",
  "updatedAt": "2026-01-17T10:45:00.000Z"
}
```

---

## Database Features

### 1. **Authentication & Authorization**
- ✅ User registration with email/password
- ✅ Google OAuth integration
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token-based authentication
- ✅ Role-based access control (Admin, Pharmacist, Staff)
- ✅ Permission-based authorization

### 2. **Password Management**
- ✅ Forgot password with email verification
- ✅ 6-digit reset codes
- ✅ 15-minute code expiration
- ✅ Automatic cleanup of expired codes
- ✅ Single-use codes

### 3. **User Profiles**
- ✅ Profile photo storage (base64 or URL)
- ✅ User preferences (notifications, privacy)
- ✅ Login history tracking
- ✅ Last login timestamp

### 4. **Security Features**
- ✅ Password hashing (bcrypt)
- ✅ Email validation
- ✅ Unique email constraint
- ✅ Login history tracking
- ✅ IP address logging
- ✅ Browser/device detection

---

## API Endpoints Connected to Database

### Authentication Endpoints:
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login user (saves login history)
- `POST /api/auth/forgot-password` - Generate reset code
- `POST /api/auth/reset-password` - Reset password with code
- `GET /api/auth/profile` - Get current user profile
- `GET /api/auth/permissions` - Get user permissions

### User Management (Admin Only):
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### User Profile Endpoints:
- `PUT /api/user/avatar` - Update profile photo
- `PUT /api/user/preferences` - Update user preferences
- `GET /api/user/login-history` - Get login history

---

## Data Flow

### 1. User Registration:
```
Frontend → POST /api/auth/register → Backend validates → Hash password → 
Save to users collection → Return user + JWT token
```

### 2. User Login:
```
Frontend → POST /api/auth/login → Backend validates → Check password → 
Save login history → Update lastLogin → Return user + JWT token
```

### 3. Forgot Password:
```
Frontend → POST /api/auth/forgot-password → Backend generates code → 
Save to passwordresets collection → Send email → Return success
```

### 4. Reset Password:
```
Frontend → POST /api/auth/reset-password → Backend validates code → 
Check expiration → Update user password → Mark code as used → Return success
```

### 5. Update Profile Photo:
```
Frontend → PUT /api/user/avatar → Backend validates token → 
Update user.avatar → Save to database → Return updated user
```

### 6. Update Preferences:
```
Frontend → PUT /api/user/preferences → Backend validates token → 
Update user.preferences → Save to database → Return updated preferences
```

---

## Indexes

### users Collection:
- `email` - Unique index for fast lookups
- `googleId` - Sparse unique index for OAuth users

### passwordresets Collection:
- `{ email: 1, code: 1 }` - Compound index for fast lookups
- `expiresAt` - TTL index for automatic deletion

---

## Data Validation

### User Model:
- ✅ Email must be valid format
- ✅ Password minimum 6 characters
- ✅ Full name minimum 2 characters
- ✅ Role must be Admin, Pharmacist, or Staff
- ✅ Email must be unique

### Password Reset Model:
- ✅ Email must be valid format
- ✅ Code must be 6 digits
- ✅ Expiration date required

---

## Automatic Features

### 1. Timestamps:
- All documents automatically get `createdAt` and `updatedAt` fields
- Updated automatically on every save

### 2. Password Exclusion:
- Password field automatically excluded from JSON responses
- Implemented via `toJSON()` method in User model

### 3. TTL (Time To Live):
- Password reset codes automatically deleted after expiration
- No manual cleanup needed

### 4. Login History Limit:
- Only last 10 login records kept per user
- Older records automatically removed

---

## Database Statistics

### Current Data:
- **Users:** 5 documents
- **Password Resets:** 0-1 documents (temporary)
- **Total Collections:** 2

### Storage:
- Efficient document-based storage
- Indexed for fast queries
- Automatic cleanup of expired data

---

## For Teacher Demo

### Show These Features:

1. **Users Collection:**
   - Open MongoDB Compass
   - Navigate to `meditrust` → `users`
   - Show 5 user documents
   - Point out: roles, permissions, preferences, loginHistory

2. **Password Resets Collection:**
   - Navigate to `meditrust` → `passwordresets`
   - Trigger forgot password on website
   - Show new document appears
   - Wait 15 minutes or refresh - document auto-deletes

3. **Login History:**
   - Login to any account
   - Check users collection
   - Show `loginHistory` array updated
   - Show `lastLogin` timestamp

4. **Profile Photo:**
   - Upload photo in Account Settings
   - Check users collection
   - Show `avatar` field with base64 data

5. **Preferences:**
   - Toggle settings in Account Settings
   - Check users collection
   - Show `preferences` object updated

---

## Security Considerations

✅ **Passwords:** Never stored in plain text (bcrypt hashed)  
✅ **Tokens:** JWT with expiration (24 hours)  
✅ **Reset Codes:** Expire after 15 minutes  
✅ **Email Validation:** Enforced at database level  
✅ **Unique Constraints:** Prevent duplicate accounts  
✅ **Login Tracking:** Monitor suspicious activity  

---

## Future Enhancements

1. Add `inventory` collection for pharmacy items
2. Add `orders` collection for customer orders
3. Add `reports` collection for analytics
4. Add `notifications` collection for user alerts
5. Add `sessions` collection for active sessions

---

## Connection String

```
mongodb://localhost:27017/meditrust
```

## Backup Command

```bash
mongodump --db meditrust --out ./backup
```

## Restore Command

```bash
mongorestore --db meditrust ./backup/meditrust
```

---

**Last Updated:** January 17, 2026  
**Database Version:** MongoDB 6.0+  
**Total Collections:** 2  
**Total Documents:** 5+ (users) + temporary (password resets)


---

### 3. Products Collection

**Collection Name**: `products`

**Purpose**: Store pharmacy inventory items with expiry tracking and stock management.

**Schema**:
```javascript
{
  name: String (required),
  genericName: String,
  category: String (Antibiotic, Painkiller, Vitamin, Diabetes, Heart, Respiratory, Digestive, Other),
  manufacturer: String (required),
  batchNumber: String (required, unique),
  quantity: Number (required, min: 0),
  price: Number (required, min: 0),
  expiryDate: Date (required),
  manufactureDate: Date (required),
  reorderLevel: Number (default: 50),
  supplier: ObjectId (ref: Supplier),
  status: String (In Stock, Low Stock, Out of Stock, Expiring Soon),
  createdAt: Date,
  updatedAt: Date
}
```

**Sample Data**: 8 products including Amoxicillin, Paracetamol, Metformin, Ibuprofen, etc.

---

### 4. Suppliers Collection

**Collection Name**: `suppliers`

**Purpose**: Manage pharmacy suppliers and their contact information.

**Schema**:
```javascript
{
  name: String (required),
  company: String (required),
  email: String (required),
  phone: String (required),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String (default: Nepal)
  },
  productsSupplied: [String],
  rating: Number (1-5, default: 5),
  status: String (Active, Inactive),
  createdAt: Date
}
```

**Sample Data**: 3 suppliers from Kathmandu, Nepal

---

### 5. Customers Collection

**Collection Name**: `customers`

**Purpose**: Store customer information and medical history.

**Schema**:
```javascript
{
  fullName: String (required),
  email: String,
  phone: String (required),
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  dateOfBirth: Date,
  gender: String (Male, Female, Other),
  allergies: [String],
  chronicConditions: [String],
  insuranceProvider: String,
  insuranceNumber: String,
  totalPurchases: Number (default: 0),
  lastVisit: Date,
  createdAt: Date
}
```

**Sample Data**: 4 customers with medical history and insurance information

---

### 6. Orders Collection

**Collection Name**: `orders`

**Purpose**: Track customer orders and prescriptions.

**Schema**:
```javascript
{
  orderNumber: String (required, unique),
  customer: ObjectId (ref: Customer),
  customerName: String,
  items: [{
    product: ObjectId (ref: Product),
    productName: String,
    quantity: Number (required, min: 1),
    price: Number (required),
    subtotal: Number (required)
  }],
  totalAmount: Number (required),
  paymentMethod: String (Cash, Card, Insurance, Online),
  status: String (Pending, Completed, Cancelled),
  prescriptionRequired: Boolean,
  prescriptionImage: String,
  processedBy: ObjectId (ref: User),
  createdAt: Date,
  completedAt: Date
}
```

**Sample Data**: 179 orders across 6 months (Jan-Jun 2025)

---

### 7. Sales Collection

**Collection Name**: `sales`

**Purpose**: Track sales transactions for reporting and analytics.

**Schema**:
```javascript
{
  order: ObjectId (ref: Order, required),
  amount: Number (required),
  date: Date (default: now),
  month: String (required),
  year: Number (required),
  paymentMethod: String (Cash, Card, Insurance, Online),
  processedBy: ObjectId (ref: User)
}
```

**Indexes**: 
- `date: -1` (descending)
- `month: 1, year: 1`

**Sample Data**: 179 sales records totaling ₨13,485.00

---

## Database Statistics

### Current Data (as of seeding):
- **Users**: 5 (1 Admin, 2 Pharmacists, 2 Staff)
- **Products**: 8 medicines
- **Suppliers**: 3 companies
- **Customers**: 4 registered customers
- **Orders**: 179 completed orders
- **Sales**: 179 transactions
- **Total Revenue**: ₨13,485.00

---

## Seeding Scripts

### Seed All Data
```bash
cd backend
node seedAllData.js
```

This will populate:
- 3 suppliers
- 8 products with realistic expiry dates
- 4 customers with medical history
- 179 orders (6 months of data)
- 179 sales records

### Seed Users Only
```bash
cd backend
node seedUsers.js
```

---

## API Endpoints (Available)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status

### Sales
- `GET /api/sales` - Get all sales
- `GET /api/sales/monthly` - Get monthly sales summary
- `GET /api/sales/forecast` - Get sales forecast data

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer

---

## For Teacher Demo

### What to Show:

1. **MongoDB Compass** - Open and show all 7 collections with real data
2. **Users Collection** - Show 5 users with different roles
3. **Products Collection** - Show 8 medicines with expiry dates and stock levels
4. **Orders Collection** - Show 179 orders with customer details
5. **Sales Collection** - Show sales data for 6 months
6. **Suppliers Collection** - Show 3 suppliers from Nepal
7. **Customers Collection** - Show 4 customers with medical history

### Database Features:
- ✅ Automatic password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ Login history tracking
- ✅ Profile photo storage
- ✅ Password reset with email codes
- ✅ Automatic product status updates
- ✅ Sales analytics and forecasting
- ✅ Customer medical records
- ✅ Order tracking with prescriptions
- ✅ Supplier management

---

## Backup and Restore

### Backup Database
```bash
mongodump --db meditrust --out ./backup
```

### Restore Database
```bash
mongorestore --db meditrust ./backup/meditrust
```

---

**Last Updated**: January 18, 2026
