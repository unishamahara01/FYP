# Email Verification Setup Guide 📧

## Overview
MediTrust now has **Email OTP (One-Time Password) Verification** system for user registration!

---

## 🎯 How It Works

### User Flow:
1. **Signup** → User enters name, email, password, role
2. **OTP Sent** → System generates 6-digit code and sends to email
3. **Verification Page** → User enters the 6-digit code
4. **Account Created** → After verification, account is activated
5. **Login** → Only verified users can login

---

## 📧 Email Configuration

### Option 1: Gmail (Recommended for Demo)

1. **Create/Use Gmail Account**
2. **Enable 2-Factor Authentication**:
   - Go to Google Account → Security
   - Enable 2-Step Verification

3. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "MediTrust"
   - Copy the 16-character password

4. **Update backend/.env file**:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

### Option 2: Development Mode (No Email Setup)

If you don't want to set up email, the system will:
- ✅ Still generate OTP codes
- ✅ Log OTP to console (check backend terminal)
- ✅ Work perfectly for demonstration

**To use**: Just leave EMAIL_USER and EMAIL_PASS empty in .env

---

## 🚀 Testing the System

### Test Signup Flow:

1. **Start Servers**:
```bash
cd backend && npm start
cd frontend && npm start
```

2. **Go to Signup Page**:
   - Open http://localhost:3000
   - Click "Sign Up"

3. **Fill Registration Form**:
   - Full Name: Test User
   - Email: your-email@gmail.com
   - Password: password123
   - Role: Pharmacist

4. **Check for OTP**:
   - **If email configured**: Check your email inbox
   - **If not configured**: Check backend console/terminal

5. **Enter OTP Code**:
   - You'll see 6 input boxes
   - Enter the 6-digit code
   - Code expires in 10 minutes

6. **Account Created**:
   - After verification, you're logged in automatically
   - Dashboard appears based on your role

---

## 🎨 OTP Verification Page Features

### Beautiful UI:
- **Left Side**: Purple gradient with email icon
- **Right Side**: 6-digit OTP input boxes
- **Timer**: Shows remaining time (10 minutes)
- **Resend**: Can request new code after expiry
- **Auto-focus**: Automatically moves to next input
- **Paste Support**: Can paste 6-digit code

### User Experience:
- ✅ Real-time validation
- ✅ Error messages
- ✅ Success feedback
- ✅ Loading states
- ✅ Countdown timer
- ✅ Resend functionality

---

## 🔒 Security Features

### OTP System:
- **6-digit random code**: Hard to guess
- **10-minute expiry**: Limited time window
- **One-time use**: Code deleted after verification
- **Email-specific**: Each email has unique code

### Login Protection:
- ❌ Unverified users cannot login
- ✅ Only verified users can access system
- ✅ Clear error message for unverified accounts

---

## 📝 Backend Endpoints

### New Endpoints:

1. **POST /api/auth/register**
   - Sends OTP to email
   - Returns: `{ requiresVerification: true, email }`

2. **POST /api/auth/verify-otp**
   - Body: `{ email, otp }`
   - Verifies code and creates account
   - Returns: `{ user, token }`

3. **POST /api/auth/resend-otp**
   - Body: `{ email }`
   - Sends new OTP code
   - Returns: `{ message }`

### Updated Endpoints:

4. **POST /api/auth/login**
   - Now checks if user is verified
   - Blocks unverified users

---

## 🎓 Demo for Teacher

### Scenario 1: With Email Setup

1. **Show Signup**:
   - Fill form with real email
   - Click "Sign Up"
   - Show "Code sent to email" message

2. **Show Email**:
   - Open email inbox
   - Show beautiful verification email
   - Point out 6-digit code

3. **Show Verification**:
   - Enter code in 6 boxes
   - Show timer counting down
   - Show success message

4. **Show Login Protection**:
   - Try to login before verification (blocked)
   - After verification (works)

### Scenario 2: Without Email Setup

1. **Show Signup**:
   - Fill form
   - Click "Sign Up"

2. **Show Console**:
   - Open backend terminal
   - Show OTP logged: "OTP for email@test.com is: 123456"

3. **Show Verification**:
   - Enter code from console
   - Works perfectly!

---

## 📧 Email Template

The verification email includes:
- **MediTrust branding**
- **Purple gradient design**
- **Large 6-digit code**
- **Expiry warning (10 minutes)**
- **Security notice**
- **Professional layout**

---

## 🐛 Troubleshooting

### Issue: "Email not sent"
**Solution**: 
- Check EMAIL_USER and EMAIL_PASS in .env
- Make sure App Password is correct (not regular password)
- Check backend console for OTP code

### Issue: "Invalid verification code"
**Solution**:
- Make sure you're entering correct 6 digits
- Check if code expired (10 minutes)
- Request new code with "Resend"

### Issue: "Code expired"
**Solution**:
- Click "Resend Code" button
- New code will be sent
- Timer resets to 10 minutes

### Issue: Existing users can't login
**Solution**:
- All existing users are marked as `verified: true`
- They can login normally
- Only new signups require verification

---

## 📊 Database Schema (In-Memory)

### User Object:
```javascript
{
  id: 1,
  fullName: "Test User",
  email: "test@example.com",
  password: "hashed_password",
  role: "Pharmacist",
  verified: true,  // NEW FIELD
  permissions: [...],
  createdAt: Date
}
```

### OTP Store (Temporary):
```javascript
{
  email: {
    otp: "123456",
    expiresAt: timestamp,
    userData: { fullName, email, password, role }
  }
}
```

---

## ✅ Current Status

### Completed:
- ✅ Backend OTP generation
- ✅ Email sending (nodemailer)
- ✅ OTP verification endpoint
- ✅ Resend OTP endpoint
- ✅ Frontend OTP page
- ✅ Beautiful email template
- ✅ Timer countdown
- ✅ Login protection
- ✅ Auto-focus inputs
- ✅ Paste support

### Ready for Demo:
- ✅ Works with or without email setup
- ✅ Beautiful UI/UX
- ✅ Professional email template
- ✅ Secure implementation
- ✅ User-friendly flow

---

## 🎉 Summary

You now have a **complete email verification system** that:
1. Sends OTP codes to user email
2. Beautiful verification page
3. Secure 10-minute expiry
4. Resend functionality
5. Login protection
6. Works for demonstration (even without email setup)

**Perfect for showing your teacher!** 🌟

---

## 📞 Quick Start

1. **Optional**: Setup Gmail App Password in `backend/.env`
2. **Start servers**: `npm start` in both backend and frontend
3. **Test signup**: Create new account
4. **Check OTP**: Email or console
5. **Verify**: Enter 6-digit code
6. **Done**: Account created and logged in!

**Note**: Existing users (admin@meditrust.com, etc.) are already verified and can login normally.
