# Google OAuth Setup Guide - Quick Start

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" → Name it "MediTrust" → Create

### Step 2: Enable APIs
1. Go to "APIs & Services" → "Library"
2. Search and enable: "Google Identity" API

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Configure Consent Screen":
   - Choose "External" → Create
   - App name: "MediTrust"
   - User support email: Your college email
   - Developer email: Your college email
   - Save and Continue (skip optional fields)
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Choose "Web application":
   - Name: "MediTrust"
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3001/api/auth/google/callback`
   - Create

### Step 4: Copy Credentials
1. Copy the "Client ID" and "Client Secret"
2. Update `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-here
   ```
3. Update `frontend/.env`:
   ```env
   REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   ```

### Step 5: Restart Servers
```bash
# Stop both servers (Ctrl+C)
# Restart backend
cd backend && npm start

# Restart frontend  
cd frontend && npm start
```

## Step 5: Install Dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

## Step 6: Test the Integration

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm start`
3. Try logging in with Google on the login page

## Features Enabled

✅ **Google Sign-In Button**: Professional Google OAuth button
✅ **Account Selection**: Shows available Gmail accounts on device
✅ **One-Tap Sign-In**: Automatic sign-in for returning users
✅ **Account Linking**: Links Google accounts to existing email accounts
✅ **Profile Pictures**: Uses Google profile pictures as avatars
✅ **Secure Authentication**: JWT tokens with Google verification

## Security Notes

- Never commit your actual Google credentials to version control
- Use environment variables for all sensitive data
- In production, update authorized origins to your actual domain
- Enable HTTPS in production for secure authentication

## Troubleshooting

- **"Invalid Client ID"**: Check that GOOGLE_CLIENT_ID matches exactly
- **"Redirect URI mismatch"**: Ensure callback URL is added to Google Console
- **"Access blocked"**: Configure OAuth consent screen properly
- **Button not showing**: Check browser console for JavaScript errors