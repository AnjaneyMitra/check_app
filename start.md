# 🚀 Starting the Daily Check-In Task Tracker

This guide provides step-by-step instructions to start both the backend and frontend servers for the Daily Check-In Task Tracker application.

## Prerequisites

Before starting the application, make sure you have:
- Python 3.8+ installed
- Node.js 16+ and npm installed
- Firebase project configured (see `FIREBASE_SETUP.md`)
- Environment variables set up (`.env` file in backend directory)

## Starting the Application

### 1. Start the Backend (FastAPI Server)

Open a terminal and navigate to the backend directory:

```bash
cd /Applications/Vscode/check_app/backend
```

Activate the Python virtual environment:

```bash
# Create virtual environment if it doesn't exist
python -m venv venv

# Activate the virtual environment
source venv/bin/activate
```

Install dependencies (if not already installed):

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ **Backend will be running at: http://localhost:8000**
- API documentation available at: http://localhost:8000/docs
- Alternative docs at: http://localhost:8000/redoc

### 2. Start the Frontend (React App)

Open a **new terminal** and navigate to the frontend directory:

```bash
cd /Applications/Vscode/check_app/frontend
```

Install dependencies (if not already installed):

```bash
npm install
```

Start the React development server:

```bash
npm start
```

✅ **Frontend will be running at: http://localhost:3000**

## Quick Start Commands

For convenience, here are the commands to run in separate terminals:

**Terminal 1 (Backend):**
```bash
cd /Applications/Vscode/check_app/backend && source venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd /Applications/Vscode/check_app/frontend && npm start
```

## Stopping the Application

To stop the servers:
- **Backend**: Press `Ctrl+C` in the backend terminal
- **Frontend**: Press `Ctrl+C` in the frontend terminal

To deactivate the Python virtual environment:
```bash
deactivate
```

## Troubleshooting

### Backend Issues
- **Port 8000 already in use**: Kill the process using `lsof -ti:8000 | xargs kill -9`
- **Missing dependencies**: Run `pip install -r requirements.txt` in the activated venv
- **Environment variables**: Check that `.env` file exists with Firebase credentials

### Frontend Issues
- **Port 3000 already in use**: The app will prompt to use a different port
- **Missing dependencies**: Run `npm install` in the frontend directory
- **Firebase errors**: Check `src/firebase/config.ts` configuration

### Database Issues
- **Firestore connection**: Verify Firebase project settings in `.env`
- **Authentication**: Check Firebase Authentication is enabled in console
- **Security rules**: Ensure `firestore.rules` are deployed

## Development Tips

1. **Hot Reload**: Both servers support hot reload - changes will automatically refresh
2. **Logs**: Check terminal outputs for error messages and debugging info
3. **Network**: Both servers are accessible from other devices on your network
4. **API Testing**: Use the FastAPI docs at http://localhost:8000/docs to test endpoints

## Production Deployment

For production deployment, see `deploy.sh` and `README.md` for detailed instructions.

---

**Happy coding! 🎉**
