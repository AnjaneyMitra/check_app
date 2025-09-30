from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import firebase_admin
from firebase_admin import credentials, firestore, auth
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    # For development, you can use the Firebase emulator or service account key
    # For production, use environment variables or service account key
    try:
        cred = credentials.Certificate("service-account-key.json")
        firebase_admin.initialize_app(cred)
    except FileNotFoundError:
        # Fallback for development - you'll need to add your Firebase config
        firebase_admin.initialize_app()

# Initialize Firestore
db = firestore.client()

app = FastAPI(title="Daily Check-In Task Tracker API", version="1.0.0")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None

class TaskUpdate(BaseModel):
    completed: bool

class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    completed: bool
    created_at: datetime
    user_id: str

class User(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    partner_id: Optional[str] = None

class MotivationalNote(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    message: str
    created_at: datetime

# Authentication dependency
async def get_current_user(authorization: str = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        # Extract token from "Bearer <token>"
        token = authorization.split(" ")[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

# Helper functions
def get_today_date():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")

def get_user_tasks_collection(user_id: str, date: str):
    return db.collection("users").document(user_id).collection("daily_tasks").document(date).collection("tasks")

def get_user_history_collection(user_id: str):
    return db.collection("users").document(user_id).collection("history")

# Routes
@app.get("/")
async def root():
    return {"message": "Daily Check-In Task Tracker API"}

@app.post("/api/users/setup")
async def setup_user(partner_email: str, current_user: dict = Depends(get_current_user)):
    """Set up user profile and link with partner"""
    try:
        user_id = current_user['uid']
        email = current_user['email']
        display_name = current_user.get('name', email.split('@')[0])
        
        # Find partner by email
        partner_user = auth.get_user_by_email(partner_email)
        partner_id = partner_user.uid
        
        # Create or update user document
        user_doc = db.collection("users").document(user_id)
        user_doc.set({
            "email": email,
            "display_name": display_name,
            "partner_id": partner_id,
            "created_at": firestore.SERVER_TIMESTAMP
        }, merge=True)
        
        # Update partner's document to link back
        partner_doc = db.collection("users").document(partner_id)
        partner_doc.set({
            "partner_id": user_id
        }, merge=True)
        
        return {"message": "User setup completed", "partner_id": partner_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile and partner info"""
    try:
        user_id = current_user['uid']
        user_doc = db.collection("users").document(user_id).get()
        
        if not user_doc.exists:
            return {"user": None, "partner": None}
        
        user_data = user_doc.to_dict()
        partner_data = None
        
        if user_data.get('partner_id'):
            partner_doc = db.collection("users").document(user_data['partner_id']).get()
            if partner_doc.exists:
                partner_data = partner_doc.to_dict()
                partner_data['id'] = user_data['partner_id']
        
        user_data['id'] = user_id
        return {"user": user_data, "partner": partner_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/tasks")
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Create a new task for today"""
    try:
        user_id = current_user['uid']
        today = get_today_date()
        
        task_data = {
            "title": task.title,
            "description": task.description,
            "completed": False,
            "created_at": firestore.SERVER_TIMESTAMP,
            "user_id": user_id
        }
        
        doc_ref = get_user_tasks_collection(user_id, today).add(task_data)
        task_data["id"] = doc_ref[1].id
        
        return task_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/tasks/today")
async def get_today_tasks(current_user: dict = Depends(get_current_user)):
    """Get all tasks for today"""
    try:
        user_id = current_user['uid']
        today = get_today_date()
        
        tasks = []
        docs = get_user_tasks_collection(user_id, today).stream()
        
        for doc in docs:
            task_data = doc.to_dict()
            task_data["id"] = doc.id
            tasks.append(task_data)
        
        return {"tasks": tasks, "date": today}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/tasks/partner/today")
async def get_partner_today_tasks(current_user: dict = Depends(get_current_user)):
    """Get partner's tasks for today"""
    try:
        user_id = current_user['uid']
        
        # Get partner ID
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists or not user_doc.to_dict().get('partner_id'):
            raise HTTPException(status_code=404, detail="Partner not found")
        
        partner_id = user_doc.to_dict()['partner_id']
        today = get_today_date()
        
        tasks = []
        docs = get_user_tasks_collection(partner_id, today).stream()
        
        for doc in docs:
            task_data = doc.to_dict()
            task_data["id"] = doc.id
            tasks.append(task_data)
        
        return {"tasks": tasks, "date": today, "partner_id": partner_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: str, task_update: TaskUpdate, current_user: dict = Depends(get_current_user)):
    """Update a task (mark as completed/incomplete)"""
    try:
        user_id = current_user['uid']
        today = get_today_date()
        
        task_ref = get_user_tasks_collection(user_id, today).document(task_id)
        task_doc = task_ref.get()
        
        if not task_doc.exists:
            raise HTTPException(status_code=404, detail="Task not found")
        
        task_ref.update({
            "completed": task_update.completed,
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        
        return {"message": "Task updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a task"""
    try:
        user_id = current_user['uid']
        today = get_today_date()
        
        task_ref = get_user_tasks_collection(user_id, today).document(task_id)
        task_doc = task_ref.get()
        
        if not task_doc.exists:
            raise HTTPException(status_code=404, detail="Task not found")
        
        task_ref.delete()
        return {"message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/motivational-notes")
async def send_motivational_note(message: str, current_user: dict = Depends(get_current_user)):
    """Send a motivational note to partner"""
    try:
        user_id = current_user['uid']
        
        # Get partner ID
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists or not user_doc.to_dict().get('partner_id'):
            raise HTTPException(status_code=404, detail="Partner not found")
        
        partner_id = user_doc.to_dict()['partner_id']
        
        note_data = {
            "from_user_id": user_id,
            "to_user_id": partner_id,
            "message": message,
            "created_at": firestore.SERVER_TIMESTAMP,
            "read": False
        }
        
        doc_ref = db.collection("motivational_notes").add(note_data)
        note_data["id"] = doc_ref[1].id
        
        return note_data
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/motivational-notes")
async def get_motivational_notes(current_user: dict = Depends(get_current_user)):
    """Get motivational notes for current user"""
    try:
        user_id = current_user['uid']
        
        notes = []
        docs = db.collection("motivational_notes").where("to_user_id", "==", user_id).order_by("created_at", direction=firestore.Query.DESCENDING).limit(10).stream()
        
        for doc in docs:
            note_data = doc.to_dict()
            note_data["id"] = doc.id
            notes.append(note_data)
        
        return {"notes": notes}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/history")
async def get_user_history(current_user: dict = Depends(get_current_user)):
    """Get user's task completion history"""
    try:
        user_id = current_user['uid']
        
        history = []
        docs = get_user_history_collection(user_id).order_by("date", direction=firestore.Query.DESCENDING).limit(30).stream()
        
        for doc in docs:
            history_data = doc.to_dict()
            history.append(history_data)
        
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/admin/reset-daily-tasks")
async def reset_daily_tasks():
    """Admin endpoint to reset daily tasks (called by cron job)"""
    try:
        # This would typically be called by a scheduled job
        # For demo purposes, we'll make it a manual endpoint
        
        users_ref = db.collection("users")
        users = users_ref.stream()
        
        yesterday = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        
        for user_doc in users:
            user_id = user_doc.id
            user_data = user_doc.to_dict()
            
            # Get yesterday's tasks
            tasks_ref = get_user_tasks_collection(user_id, yesterday)
            tasks = tasks_ref.stream()
            
            total_tasks = 0
            completed_tasks = 0
            
            for task_doc in tasks:
                task_data = task_doc.to_dict()
                total_tasks += 1
                if task_data.get('completed', False):
                    completed_tasks += 1
            
            if total_tasks > 0:
                # Archive to history
                completion_percentage = (completed_tasks / total_tasks) * 100
                
                history_data = {
                    "date": yesterday,
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "completion_percentage": completion_percentage,
                    "created_at": firestore.SERVER_TIMESTAMP
                }
                
                get_user_history_collection(user_id).document(yesterday).set(history_data)
        
        return {"message": "Daily tasks reset completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
