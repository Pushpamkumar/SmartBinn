# Firebase Setup Guide

## Prerequisites
- Google account
- Node.js 18+ installed
- Firebase CLI (`npm install -g firebase-tools`)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `smartdustbin-demo`
4. Accept terms and create project
5. Wait for project initialization

## Step 2: Enable Required Services

### Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Enable **Email/Password** provider:
   - Click "Email/Password"
   - Toggle "Enable"
   - Save
4. Click **Users** tab → **Add user**
   - Create admin account:
     - Email: `admin@smartdustbin.com`
     - Password: `demo@123456`
   - Create worker account:
     - Email: `worker@smartdustbin.com`
     - Password: `demo@123456`

### Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Select location closest to you
4. Start in **Production mode**
5. Click **Create**
6. Go to **Rules** tab and replace with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
   (Production: Use rules from DATABASE_SCHEMA.md)
7. Click **Publish**

### Cloud Storage (optional, for images)
1. Go to **Storage**
2. Click **Get started**
3. Select your location
4. Click **Done**

## Step 3: Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Select **General** tab
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Enter app name: `SmartDustbin Web`
6. Register app
7. Copy the Firebase config object

## Step 4: Configure Environment Variables

1. In your project root, rename `.env.local.example` to `.env.local`
2. Replace with your Firebase config:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## Step 5: Initialize Firestore Data

### Option A: Using Firebase Console
1. In **Firestore Database**, click **+ Collection**
2. Name it `bins`
3. Add sample documents manually

### Option B: Using script (Recommended)
Create `scripts/init-db.js`:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Add sample bins
const bins = [
  {
    latitude: 28.7041,
    longitude: 77.1025,
    fillPercentage: 45,
    status: 'available',
    location: 'Delhi, India',
    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
  },
  // Add more bins...
];

async function initDB() {
  const batch = db.batch();
  bins.forEach((bin) => {
    const ref = db.collection('bins').doc();
    batch.set(ref, bin);
  });
  await batch.commit();
  console.log('Database initialized!');
  process.exit(0);
}

initDB();
```

Run: `node scripts/init-db.js`

## Step 6: Set Up Firebase CLI (optional)

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select: Firestore, Functions, Hosting
# Link to your project
```

## Step 7: Deploy (Production)

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Cloud Functions (if using)
```bash
firebase deploy --only functions
```

### Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

## Step 8: Test Authentication

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/login`
3. Use credentials:
   - Email: `admin@smartdustbin.com`
   - Password: `demo@123456`
4. Should redirect to dashboard

## Firestore Emulator (Development)

For local testing without cloud costs:

```bash
# Install emulator
npm install -D firebase-emulators-suite

# Start emulator
firebase emulators:start

# In code, connect to emulator (lib/firebase.ts already has option)
```

## Common Issues

### Authentication Not Working
- ✅ Verify email/password providers are enabled
- ✅ Check environment variables are set
- ✅ Clear browser storage: DevTools → Application → Storage → Clear all

### Firestore Rules Errors
- ✅ Ensure rules allow `read: if request.auth != null`
- ✅ Check user is authenticated via Firebase Auth
- ✅ Use Firebase Console to debug: Firestore → Debugging

### CORS Issues
- ✅ Ensure Firebase config has correct domain
- ✅ Check browser console for specific error
- ✅ Try clearing cache and restarting development server

## Next Steps

1. ✅ Set up Google Maps API (see GOOGLE_MAPS_SETUP.md)
2. ✅ Configure notification settings in settings page
3. ✅ Add real bin sensors (IoT integration)
4. ✅ Set up Cloud Functions for automated alerts
5. ✅ Configure email service for notifications

## Cost Monitoring

Monitor costs in Firebase Console:
- **Analytics:** Dashboard → Overview
- **Billing:** Settings → Billing
- **Quotas:** Settings → Quotas

Free tier includes:
- 1GB stored data (Firestore)
- 50k read/write operations
- 1GB network egress per month

Set budget alerts to avoid surprise charges!
