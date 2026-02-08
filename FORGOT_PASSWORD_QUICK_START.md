# Forgot Password - Quick Start Guide

## ⚡ Quick Setup (3 Steps)

### Step 1: Get Gmail App Password
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification" (if not enabled)
3. Click "App passwords" under "Signing in to Google"
4. Select "Mail" → "Other" → Enter "MediTrust" → Generate
5. Copy the 16-character password (example: abcd efgh ijkl mnop)

### Step 2: Update Email Password
Open `backend/.env` and replace this line:
```
EMAIL_PASS=your-16-character-app-password-here
```

With your actual app password (remove spaces):
```
EMAIL_PASS=abcdefghijklmnop
```

### Step 3: Restart Backend
The backend server has already been restarted automatically!

## ✅ Ready to Test!

### Test the Feature:
1. Open browser: http://localhost:3000
2. Click "Sign In" → "Forgot Password?"
3. Enter: unishamahara01@gmail.com
4. Click "Send Reset Code"
5. Check your email inbox
6. Copy the 6-digit code
7. Click "Already have a code? Reset Password"
8. Enter email, code, and new password
9. Click "Reset Password"
10. Login with new password!

## 📧 What the Email Looks Like:
```
Subject: Password Reset Code - MediTrust

Hello [Your Name],

You requested to reset your password for your MediTrust account.

Your password reset code is:

    123456

This code will expire in 15 minutes.

If you didn't request this password reset, please ignore this email.
```

## 🔒 Security Features:
- ✅ Codes expire after 15 minutes
- ✅ Single-use codes (deleted after use)
- ✅ Passwords hashed with bcrypt
- ✅ Email validation
- ✅ Minimum 6-character password

## 🎯 Current Status:
- ✅ Backend endpoints created
- ✅ Frontend pages created
- ✅ Email configuration ready
- ✅ Backend server restarted
- ✅ No errors in code
- ⏳ Waiting for Gmail App Password setup

## 📝 Important:
The feature is **fully implemented** but won't send emails until you:
1. Generate Gmail App Password
2. Update EMAIL_PASS in backend/.env
3. (Backend is already restarted)

## 🚀 After Setup:
Once you add the Gmail App Password, the feature will work immediately!
No need to restart anything - just test it!

## 💡 Tips:
- Keep your App Password secure (don't share it)
- The code is case-sensitive
- Check spam folder if email doesn't arrive
- Request new code if it expires

---

**Need help?** Check PASSWORD_RESET_SETUP.md for detailed troubleshooting!
