# Firebase Setup Guide for Daily Check-In Task Tracker

This guide will help you set up Firebase Authentication, Firestore Database, and Security Rules for your Daily Check-In Task Tracker application.

## 🚀 Firebase Project Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `daily-checkin-tracker` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Select your Analytics account and create the project

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication > Sign-in method**
2. Enable the following sign-in providers:
   - **Email/Password**: Enable and configure
   - **Google**: Enable and configure
     - Add your domain to authorized domains
     - Download the configuration file

### 3. Create Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Start in **test mode** (we'll add security rules later)
4. Choose a location closest to your users
5. Click **Done**

### 4. Configure Web App

1. Go to **Project Settings** (gear icon) > **General** tab
2. Scroll to **Your apps** section
3. Click **Add app** > **Web** (</>) icon
4. Register your app with a nickname
5. Copy the Firebase configuration object
6. Replace the config in `frontend/src/firebase/config.ts`

## 🔒 Firestore Security Rules

### Deploy Security Rules

1. Copy the contents of `firestore.rules` to your Firebase Console:
   - Go to **Firestore Database > Rules** tab
   - Replace the default rules with our custom rules
   - Click **Publish**

2. Or use Firebase CLI (recommended):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```

### Rule Explanation

Our security rules ensure:

#### **User Data Protection**
- Users can only read/write their own profile data
- Partners can view each other's profiles and tasks
- Email addresses cannot be changed after registration
- Proper validation of user profile fields

#### **Task Security**
- Users can only create/modify their own tasks
- Partners can view each other's tasks (read-only)
- Task data validation (title length, user ownership)
- Date format validation for daily task organization

#### **History Protection**
- Users can only create/update their own history
- Partners can view each other's history
- History entries cannot be deleted (data integrity)
- Completion percentage validation

#### **Motivational Notes**
- Users can only send notes to their linked partner
- Notes are private between partners
- Recipients can mark notes as read
- Message length validation (max 500 characters)

## 📊 Firestore Database Structure

```
/users/{userId}
├── email: string
├── display_name: string
├── partner_id: string
├── created_at: timestamp
│
├── /daily_tasks/{date}/tasks/{taskId}
│   ├── title: string
│   ├── description: string (optional)
│   ├── completed: boolean
│   ├── user_id: string
│   ├── created_at: timestamp
│   └── updated_at: timestamp (optional)
│
└── /history/{date}
    ├── date: string (YYYY-MM-DD)
    ├── total_tasks: number
    ├── completed_tasks: number
    ├── completion_percentage: number
    └── created_at: timestamp

/motivational_notes/{noteId}
├── from_user_id: string
├── to_user_id: string
├── message: string
├── created_at: timestamp
└── read: boolean (optional)
```

## 🔧 Environment Configuration

### Frontend Environment

Update `frontend/src/firebase/config.ts`:
```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id",
  measurementId: "your-measurement-id" // Optional
};
```

### Backend Environment

Create `backend/.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FRONTEND_URL=http://localhost:3000
```

### Service Account Key

1. Go to **Project Settings > Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Rename it to `service-account-key.json`
5. Place it in the `backend/` directory
6. **Never commit this file to version control**

## 🌐 Production Setup

### Frontend Deployment (Vercel/Netlify)

1. Build the React app: `npm run build`
2. Deploy the `build` folder
3. Set environment variables in your hosting platform
4. Update Firebase authorized domains

### Backend Deployment (Railway/Render/Heroku)

1. Set all environment variables from `.env`
2. Upload service account key securely
3. Update CORS origins in `main.py`
4. Deploy with `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

### Firebase Security

1. **Remove test mode** from Firestore rules
2. **Add production domains** to Firebase Authentication
3. **Enable App Check** for additional security (optional)
4. **Set up monitoring** and alerts

## 🔍 Testing Rules

Use Firebase Emulator Suite for local testing:

```bash
firebase init emulators
firebase emulators:start --only firestore
```

Test your rules with the Firebase Console Rules Playground or write unit tests.

## 📚 Security Best Practices

1. **Never expose** service account keys in client code
2. **Validate all data** on both client and server side
3. **Use least privilege** principle in security rules
4. **Monitor usage** and set up billing alerts
5. **Regular security audits** of rules and access patterns
6. **Enable audit logs** for production environments

## 🆘 Troubleshooting

### Common Issues

1. **Permission denied**: Check if rules match your data structure
2. **Authentication failed**: Verify Firebase config and API keys
3. **CORS errors**: Update allowed origins in backend
4. **Rate limiting**: Implement proper pagination and caching

### Debug Commands

```bash
# Check Firestore rules
firebase firestore:rules:get

# Test rules locally
firebase emulators:start --only firestore

# View logs
firebase functions:log
```

---

This setup ensures your Daily Check-In Task Tracker is secure, scalable, and ready for production use! 🚀
