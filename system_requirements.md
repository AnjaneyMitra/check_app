# Daily Check-In Task Tracker

The Daily Check-In Task Tracker is a collaborative web application designed for two people to stay accountable and consistent in completing their daily goals. It provides a simple daily task list that resets automatically each day, while also maintaining a history of task completion that can be tracked by both participants.

## Core Concept

The app enables two users (partners, friends, colleagues, or accountability buddies) to:

- Set and track daily tasks
- See each other's progress in real-time
- View historical data to analyze past performance and consistency
- Start fresh each day with a new tracker while maintaining archived records

## Key Features

### Two-User Focused

- Designed specifically for two participants
- Both users log in securely and are paired together
- Each user can view their own and the other's daily progress

### Daily Task Management

- Users can add tasks at the start of the day
- Each task has a status (pending ⏳ or completed ✅)
- Progress updates sync in real-time using Firebase

### Accountability & Check-Ins

- Users can see live updates when their partner completes a task
- Encouragement features: leave motivational notes or quick reactions

### Automatic Daily Reset

- At midnight (or configurable reset time), the current day's tasks reset
- Completed tasks are archived into history before reset

### Task History & Tracking

- Both users can access a history dashboard
- Shows each day's completed vs. pending tasks
- Includes streaks, percentage completion, and comparative progress
- History is visible to both parties for transparency

### Notifications & Reminders (Optional)

- Firebase Cloud Messaging for reminders
- Daily summary notifications (e.g., "You completed 4/5 tasks today")

## Tech Stack

### Frontend (Client)

- **React.js** for a dynamic and responsive UI
- Components for task input, daily progress, and history dashboard
- Axios/Fetch for API calls to backend

### Backend (Server)

- **Python** (FastAPI or Flask) for REST APIs
- Handles authentication, task management, and daily resets
- Exposes endpoints for creating, updating, and fetching tasks/history

### Database & Realtime

- **Firebase Firestore** for storing tasks, user profiles, and history
- Realtime sync so both users always see up-to-date progress

### Authentication

- **Firebase Authentication** (Google/Email login)
- Each user is securely paired with their accountability partner

### Hosting & Deployment

- React frontend hosted on **Firebase Hosting** or **Vercel**
- Python backend hosted on **Railway/Render/Heroku** or **Firebase Functions**
- Firestore provides real-time database and scaling

## User Flow

1. **Login** – Both users authenticate via Firebase Auth
2. **Task Entry** – Each user adds daily tasks in the React UI
3. **Real-Time Progress** – As users complete tasks, updates are visible instantly
4. **Check-In** – Users see partner's completion status and add encouragement if desired
5. **Daily Reset & Archive** – At reset time, tasks are cleared from the active list and stored in history
6. **History Dashboard** – Users can review past days, compare performance, and track streaks

## Benefits

- Encourages daily accountability between two people
- Helps build habits with visible progress tracking
- Transparency through shared history builds trust
- Simple, modern, and scalable with React + Python + Firebase
- Can be extended later with gamification (badges, rewards), analytics, or social features