# Daily Check-In Task Tracker

A collaborative web application designed for two people to stay accountable and consistent in completing their daily goals. Built with React, Python (FastAPI), and Firebase.

## Features

- **Two-User Focused**: Designed specifically for accountability partners
- **Daily Task Management**: Add, complete, and track daily tasks
- **Real-Time Sync**: See your partner's progress updates instantly
- **Motivational Notes**: Send encouragement to your partner
- **Progress History**: Track completion rates and streaks over time
- **Automatic Daily Reset**: Tasks reset at midnight, archived to history
- **Modern UI**: Beautiful, responsive design with smooth animations

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Styled Components** for styling
- **React Router** for navigation
- **Firebase SDK** for authentication and real-time data
- **Axios** for API communication

### Backend
- **Python FastAPI** for REST APIs
- **Firebase Admin SDK** for server-side Firebase operations
- **Pydantic** for data validation
- **Uvicorn** as ASGI server

### Database & Auth
- **Firebase Firestore** for real-time database
- **Firebase Authentication** for user management

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- Firebase project with Firestore and Authentication enabled

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google Sign-In)
3. Enable Firestore Database
4. Get your Firebase config and service account key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example` and add your Firebase credentials

5. Add your Firebase service account key as `service-account-key.json` in the backend directory

6. Start the development server:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update `src/firebase/config.ts` with your Firebase configuration

4. Start the development server:
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

## Usage

1. **Sign Up/Sign In**: Create accounts for both partners
2. **Connect Partners**: Go to Settings and add your partner's email
3. **Add Daily Tasks**: Use the Dashboard to add tasks for the day
4. **Track Progress**: Mark tasks as complete and see real-time updates
5. **Send Encouragement**: Leave motivational notes for your partner
6. **View History**: Check the History page to see past performance

## API Endpoints

- `POST /api/users/setup` - Link with accountability partner
- `GET /api/user/profile` - Get user and partner profile
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/today` - Get today's tasks
- `GET /api/tasks/partner/today` - Get partner's today tasks
- `PUT /api/tasks/{task_id}` - Update task completion status
- `DELETE /api/tasks/{task_id}` - Delete a task
- `POST /api/motivational-notes` - Send motivational note
- `GET /api/motivational-notes` - Get received notes
- `GET /api/history` - Get task completion history

## Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Update environment variables for production Firebase config

### Backend (Railway/Render/Heroku)
1. Create a `Procfile` with: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
2. Deploy to your preferred platform
3. Set environment variables for Firebase credentials

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ for accountability and personal growth.
