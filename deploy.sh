#!/bin/bash

# Daily Check-In Task Tracker - Deployment Script

echo "🚀 Starting deployment process..."

# Build frontend
echo "📦 Building React frontend..."
cd frontend
npm run build

# Create deployment folder
echo "📁 Creating deployment files..."
cd ..
mkdir -p deployment
cp -r frontend/build deployment/frontend
cp -r backend deployment/backend
cp Procfile deployment/
cp README.md deployment/

# Create production requirements
echo "🐍 Creating production requirements..."
cat > deployment/backend/requirements.txt << EOF
fastapi==0.118.0
uvicorn==0.37.0
firebase-admin==7.1.0
python-dotenv==1.1.1
pydantic==2.11.9
EOF

# Create production environment file
echo "⚙️ Creating production environment template..."
cat > deployment/backend/.env.production << EOF
# Production Environment Variables
FIREBASE_PROJECT_ID=your-production-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-production-private-key-id
FIREBASE_PRIVATE_KEY=your-production-private-key
FIREBASE_CLIENT_EMAIL=your-production-client-email
FIREBASE_CLIENT_ID=your-production-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
EOF

echo "✅ Deployment files ready in ./deployment folder"
echo ""
echo "Next steps:"
echo "1. Upload the deployment folder to your hosting service"
echo "2. Set up environment variables on your hosting platform"
echo "3. Ensure Firebase project is configured for production"
echo "4. Update CORS settings in the backend if needed"
echo ""
echo "🎉 Deployment preparation complete!"
