# MediTrust Pharmacy Management System

A comprehensive pharmacy management system with AI-powered features for inventory optimization, expiry prediction, and demand forecasting.

## Features

### Core Functionality
- **User Authentication & Authorization** - Secure login with role-based access (Admin, Pharmacist)
- **Product Management** - Complete CRUD operations for medicine inventory
- **Inventory Tracking** - Real-time stock monitoring and management
- **Order Management** - Process customer orders and track sales
- **Sales Analytics** - Dashboard with comprehensive sales insights

### AI-Powered Features
- **Expiry Prediction** - Machine learning model to predict product expiry risk
- **Demand Forecasting** - AI-based demand prediction for optimal inventory planning
- **Smart Reorder Suggestions** - Automated reorder recommendations using EOQ formula
- **AI Chatbot** - Intelligent assistant for medicine information queries

### Additional Features
- **Customer Loyalty System** - Points-based rewards program
- **Low Stock Alerts** - Automated notifications for inventory management
- **Payment Integration** - eSewa payment gateway integration
- **QR Code Payments** - Quick payment processing via QR codes

## Technology Stack

### Frontend
- React.js
- React Router
- Axios
- Chart.js for data visualization
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Nodemailer for email notifications

### AI/ML Service
- Python Flask
- Scikit-learn (Ridge Regression)
- Google Gemini API for chatbot
- Pandas & NumPy for data processing

## Project Structure

```
meditrust-pharmacy/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── ai/               # Python AI/ML service
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### AI Service Setup
```bash
cd ai
pip install -r requirements.txt
python app.py
```

## Environment Variables

Create `.env` files in respective directories:

### Backend `.env`
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### AI Service `.env`
```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

## Testing

The system includes comprehensive testing:
- Unit tests for backend APIs
- Integration tests for AI features
- Manual black box testing for all features

Run tests:
```bash
cd backend
npm test
```

## Author

**Unisha Mahara**
- Student ID: 2432225
- University of Wolverhampton / Herald College
- Final Year Project - 2026

## License

This project is developed as part of academic requirements.
