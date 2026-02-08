# 🏥 MediTrust - Intelligent Pharmacy Management System

A comprehensive, AI-powered pharmacy management system built with the MERN stack (MongoDB, Express, React, Node.js) and Python ML backend.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D5.0-green)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features
- 📊 **Real-time Dashboard** - Live inventory tracking and sales analytics
- 💊 **Inventory Management** - Complete medicine stock control
- 🛒 **Order Management** - Streamlined order processing
- 👥 **Customer Management** - Customer database and history
- 🏢 **Supplier Management** - Supplier tracking and relationships
- 📈 **Reports & Analytics** - Comprehensive business insights

### AI-Powered Features
- 🤖 **AI Chatbot** - Intelligent assistant for inventory queries
- 🔮 **Expiry Prediction** - ML-based expiry risk analysis
- 📊 **Demand Forecasting** - Predictive analytics for stock planning
- ⚠️ **Smart Alerts** - Automated low stock and expiry warnings

### Security & Authentication
- 🔐 **Role-Based Access Control** (Admin, Pharmacist, Staff)
- 🔑 **JWT Authentication** - Secure token-based auth
- 🔒 **Password Reset** - Email-based password recovery
- ✉️ **Email Verification** - OTP-based account verification
- 🌐 **Google OAuth** - Social login integration

### User Experience
- 🎨 **Modern UI/UX** - Clean, professional interface
- 📱 **Responsive Design** - Works on all devices
- 🌙 **Professional Theme** - Healthcare-focused design
- ⚡ **Fast Performance** - Optimized for speed

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Recharts** - Data visualization
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Bcrypt** - Password hashing

### ML Backend
- **Python 3.x** - Programming language
- **Flask** - Web framework
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing
- **Scikit-learn** - Machine learning

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **Git** - [Download](https://git-scm.com/downloads)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/meditrust.git
cd meditrust
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Install ML Backend Dependencies

```bash
cd ../ml-backend
pip install -r requirements.txt
```

## ⚙️ Configuration

### 1. Backend Environment Variables

Create `backend/.env` file:

```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/meditrust

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2. Frontend Environment Variables

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ML_API_URL=http://localhost:5000
```

### 3. ML Backend Environment Variables

Create `ml-backend/.env` file:

```env
FLASK_ENV=development
MONGODB_URI=mongodb://localhost:27017/meditrust
```

## 🏃 Running the Application

### Option 1: Run All Services (Recommended)

```bash
# From project root
START_PROJECT.bat
```

This will start:
- Backend server (Port 3001)
- Frontend (Port 3000)
- MongoDB (Port 27017)

### Option 2: Run with ML Backend

```bash
START_PROJECT_WITH_ML.bat
```

This starts all services including the ML backend (Port 5000).

### Option 3: Run Services Individually

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

**ML Backend:**
```bash
cd ml-backend
python app.py
```

## 📁 Project Structure

```
meditrust/
├── backend/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── server.js           # Entry point
├── frontend/               # React frontend
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       └── services/      # API services
├── ml-backend/            # Python ML backend
│   ├── models/           # ML models
│   └── app.py            # Flask app
├── docs/                 # Documentation
└── README.md
```

## 🔌 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/sales/forecast` - Get sales forecast

### AI Features
- `GET /api/ai/expiry-prediction` - Get expiry predictions
- `POST /api/ai/chat` - Chat with AI assistant

## 📸 Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Inventory Management
![Inventory](docs/screenshots/inventory.png)

### AI Chatbot
![Chatbot](docs/screenshots/chatbot.png)

## 🔧 Useful Commands

### Database Management
```bash
# Check database status
check-database.bat

# Clear all data (fresh start)
clear-all-data.bat

# Setup MongoDB
setup-mongodb.bat
```

### Development
```bash
# Backend tests
cd backend
npm test

# Frontend build
cd frontend
npm run build
```

## 📚 Documentation

Detailed documentation available in the `/docs` folder:

- [Complete Setup Guide](COMPLETE_STARTUP_GUIDE.md)
- [Database Documentation](DATABASE_DOCUMENTATION.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- MongoDB for the database
- React team for the amazing framework
- All contributors who helped with this project

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

## 🔗 Links

- [Live Demo](https://your-demo-url.com)
- [Documentation](https://your-docs-url.com)
- [Report Bug](https://github.com/yourusername/meditrust/issues)
- [Request Feature](https://github.com/yourusername/meditrust/issues)

---

Made with ❤️ for healthcare professionals
