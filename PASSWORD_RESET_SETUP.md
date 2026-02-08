# Password Reset Feature - Setup Guide

## Overview
The forgot password feature has been successfully implemented! Users can now reset their password by receiving a 6-digit code via email.

## How It Works

### User Flow:
1. User clicks "Forgot Password?" on login page
2. User enters their email address
3. System sends a 6-digit reset code to their email
4. User enters the code and creates a new password
5. User can login with the new password

### Backend Implementation:
- **POST /api/auth/forgot-password** - Generates 6-digit code, stores it in memory, sends email
- **POST /api/auth/reset-password** - Verifies code, updates password in MongoDB
- Reset codes expire after 15 minutes
- Codes are stored in memory (Map) - in production, use Redis or database

### Frontend Pages:
- **ForgotPasswordPage.jsx** - User enters email to receive reset code
- **ResetPasswordPage.jsx** - User enters code and new password
- Both pages have "Back to Login" button and simple design

## Email Configuration Required

### Step 1: Enable Gmail App Password
Since you're using Gmail (unishamahara01@gmail.com), you need to create an App Password:

1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Enable 2-Step Verification if not already enabled
4. After enabling 2FA, go back to Security
5. Under "Signing in to Google", click "App passwords"
6. Select "Mail" and "Other (Custom name)"
7. Enter "MediTrust" as the name
8. Click "Generate"
9. Copy the 16-character password (it will look like: xxxx xxxx xxxx xxxx)

### Step 2: Update .env File
Open `backend/.env` and replace the placeholder:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=unishamahara01@gmail.com
EMAIL_PASS=your-16-character-app-password-here
```

Replace `your-16-character-app-password-here` with the app password you generated (remove spaces).

### Step 3: Restart Backend Server
After updating the .env file, restart your backend server:

```bash
cd backend
npm start
```

## Testing the Feature

### Test Flow:
1. Start both servers (backend on 3001, frontend on 3000)
2. Go to login page
3. Click "Forgot Password?"
4. Enter your email: unishamahara01@gmail.com
5. Check your email inbox for the 6-digit code
6. Click "Already have a code? Reset Password" or go back to forgot password page
7. Enter your email, the 6-digit code, and new password
8. Click "Reset Password"
9. You'll be redirected to login page
10. Login with your new password

### Test Users:
All test users have default password: "password123"
- admin@meditrust.com (Admin)
- pharmacist@meditrust.com (Pharmacist)
- staff@meditrust.com (Staff)
- john.doe@meditrust.com (Pharmacist)
- jane.smith@meditrust.com (Staff)

You can test password reset with any of these emails, but the reset code will be sent to unishamahara01@gmail.com (since that's configured in EMAIL_USER).

## Email Template
The reset email includes:
- Professional MediTrust branding
- Large, centered 6-digit code
- 15-minute expiration notice
- User's full name
- Security notice if they didn't request the reset

## Security Features
- Reset codes expire after 15 minutes
- Codes are single-use (deleted after successful reset)
- Password must be at least 6 characters
- Email validation on both frontend and backend
- Passwords are hashed with bcrypt before storing

## Important Notes
1. **Email Configuration**: The feature won't work until you set up the Gmail App Password
2. **Production**: In production, use Redis or database to store reset codes instead of in-memory Map
3. **Email Provider**: Currently configured for Gmail. For other providers, update EMAIL_HOST and EMAIL_PORT
4. **Rate Limiting**: Consider adding rate limiting to prevent abuse (e.g., max 3 requests per hour per email)

## Troubleshooting

### Email Not Sending:
- Check if EMAIL_PASS is correctly set in .env
- Verify 2-Step Verification is enabled on your Google account
- Make sure you're using App Password, not your regular Gmail password
- Check backend console for email errors

### Code Not Working:
- Codes expire after 15 minutes - request a new one
- Make sure you're entering the exact 6-digit code from email
- Check if email address matches exactly

### Backend Errors:
- Restart backend server after updating .env
- Check MongoDB is running
- Verify all dependencies are installed (nodemailer is in package.json)

## Next Steps (Optional Enhancements)
1. Add rate limiting to prevent spam
2. Store reset codes in database instead of memory
3. Add email verification for new signups
4. Send notification email when password is changed
5. Add "Remember me" functionality on login
6. Implement login attempt notifications (as user requested)

## Files Modified
- `backend/server.js` - Added forgot-password and reset-password endpoints
- `backend/.env` - Added email configuration
- `frontend/src/App.js` - Added routing for forgot/reset password pages
- `frontend/src/pages/ForgotPasswordPage.jsx` - Created
- `frontend/src/pages/ForgotPasswordPage.css` - Created
- `frontend/src/pages/ResetPasswordPage.jsx` - Created
- `frontend/src/pages/ResetPasswordPage.css` - Created
- `frontend/src/pages/LoginPage.jsx` - Added "Forgot Password?" link
