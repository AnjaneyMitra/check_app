from fastapi import FastAPI, HTTPException, Depends, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore, auth
from datetime import datetime, timezone
import os
import random
import string
from dotenv import load_dotenv

load_dotenv()

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    try:
        if os.path.exists("service-account-key.json"):
            cred = credentials.Certificate("service-account-key.json")
            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized with service account key")
        else:
            project_id = os.getenv('FIREBASE_PROJECT_ID')
            if project_id and project_id != 'your-firebase-project-id':
                firebase_admin.initialize_app(options={'projectId': project_id})
                print(f"✅ Firebase initialized for project: {project_id}")
            else:
                raise ValueError("Firebase project ID not configured in .env file")
    except Exception as e:
        print(f"❌ Firebase Admin initialization failed: {e}")
        try:
            firebase_admin.initialize_app(options={'projectId': os.getenv('FIREBASE_PROJECT_ID', 'checkapp-47c6a')})
        except:
            pass

db = firestore.client()
app = FastAPI(title="Daily Check-In Task Tracker API - Multi-Partner & Groups", version="2.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enhanced Pydantic models
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    priority: Optional[str] = Field("medium", pattern="^(low|medium|high)$")
    group_id: Optional[str] = None

class TaskUpdate(BaseModel):
    completed: bool

class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_id: str
    priority: Optional[str] = "medium"
    group_id: Optional[str] = None

class UserCreate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    username: Optional[str] = Field(None, min_length=3, max_length=50)

class User(BaseModel):
    id: str
    email: str
    display_name: Optional[str] = None
    username: Optional[str] = None
    created_at: datetime
    friend_count: Optional[int] = 0
    group_count: Optional[int] = 0

class FriendRequest(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    status: str  # pending, accepted, rejected
    created_at: datetime
    from_user: Optional[Dict[str, Any]] = None

class GroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    is_private: Optional[bool] = False

class Group(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    host_id: str
    invite_code: str
    is_private: bool
    member_count: int
    created_at: datetime
    host: Optional[Dict[str, Any]] = None

class GroupMember(BaseModel):
    user_id: str
    role: str  # host, member
    joined_at: datetime
    user: Optional[Dict[str, Any]] = None

class GroupTaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    priority: Optional[str] = Field("medium", pattern="^(low|medium|high)$")

class GroupTask(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    priority: str
    created_by: str
    created_at: datetime
    group_id: str

class MotivationalNote(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    message: str
    created_at: datetime
    read: bool = False
    group_id: Optional[str] = None

class GroupMessage(BaseModel):
    id: str
    user_id: str
    message: str
    created_at: datetime
    group_id: str
    user: Optional[Dict[str, Any]] = None

# Authentication dependency
async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization format")
        
        token = authorization.split(" ")[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        print(f"❌ Auth error: {e}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# Helper functions
def get_today_date():
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def get_user_tasks_collection(user_id: str, date: str):
    return db.collection("users").document(user_id).collection("daily_tasks").document(date).collection("tasks")

async def get_user_data(user_id: str):
    """Get basic user data for responses"""
    user_doc = db.collection("users").document(user_id).get()
    if user_doc.exists:
        data = user_doc.to_dict()
        return {
            "id": user_id,
            "email": data.get("email"),
            "display_name": data.get("display_name"),
            "username": data.get("username")
        }
    return None

# Routes
@app.get("/")
async def root():
    return {"message": "Daily Check-In Task Tracker API - Multi-Partner & Groups", "version": "2.0.0"}

# User Management
@app.post("/api/users/setup")
async def setup_user(user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    """Set up or update user profile"""
    try:
        user_id = current_user['uid']
        email = current_user['email']
        display_name = user_data.display_name or current_user.get('name', email.split('@')[0])
        
        # Check if username is taken
        if user_data.username:
            existing_user = db.collection("users").where("username", "==", user_data.username).limit(1).get()
            if existing_user and len(existing_user) > 0 and existing_user[0].id != user_id:
                raise HTTPException(status_code=400, detail="Username already taken")
        
        user_profile = {
            "email": email,
            "display_name": display_name,
            "username": user_data.username,
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
        
        db.collection("users").document(user_id).set(user_profile, merge=True)
        user_profile["id"] = user_id
        
        return {"message": "User profile updated successfully", "user": user_profile}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error setting up user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile with stats"""
    try:
        user_id = current_user['uid']
        user_doc = db.collection("users").document(user_id).get()
        
        if not user_doc.exists:
            return {"user": None}
        
        user_data = user_doc.to_dict()
        
        # Get friend count
        friend_count = len(db.collection("friendships").where("user_id", "==", user_id).get())
        
        # Get group count
        group_count = len(db.collection("groups").where("host_id", "==", user_id).get())
        group_count += len(db.collection_group("members").where("user_id", "==", user_id).get())
        
        user_data.update({
            "id": user_id,
            "friend_count": friend_count,
            "group_count": group_count
        })
        
        return {"user": user_data}
    except Exception as e:
        print(f"❌ Error getting user profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/search")
async def search_users(
    query: str = Query(..., min_length=1), 
    current_user: dict = Depends(get_current_user)
):
    """Search users by email or username"""
    try:
        user_id = current_user['uid']
        users = []
        
        # Search by email
        email_results = db.collection("users").where("email", ">=", query).where("email", "<=", query + "\uf8ff").limit(10).get()
        
        # Search by username if provided
        username_results = []
        if "@" not in query:  # Only search username if it's not an email format
            username_results = db.collection("users").where("username", ">=", query).where("username", "<=", query + "\uf8ff").limit(10).get()
        
        # Combine and deduplicate results
        all_docs = list(email_results) + list(username_results)
        seen_ids = set()
        
        for doc in all_docs:
            if doc.id not in seen_ids and doc.id != user_id:
                data = doc.to_dict()
                users.append({
                    "id": doc.id,
                    "email": data.get("email"),
                    "display_name": data.get("display_name"),
                    "username": data.get("username")
                })
                seen_ids.add(doc.id)
        
        return {"users": users[:10]}  # Limit to 10 results
    except Exception as e:
        print(f"❌ Error searching users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Friend Management
@app.post("/api/friends/request")
async def send_friend_request(friend_email: str, current_user: dict = Depends(get_current_user)):
    """Send a friend request"""
    try:
        user_id = current_user['uid']
        
        # Find user by email
        friend_docs = db.collection("users").where("email", "==", friend_email).limit(1).get()
        if not friend_docs:
            raise HTTPException(status_code=404, detail="User not found")
        
        friend_id = friend_docs[0].id
        if friend_id == user_id:
            raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")
        
        # Check if friendship already exists
        existing_friendship = db.collection("friendships").where("user_id", "==", user_id).where("friend_id", "==", friend_id).limit(1).get()
        if existing_friendship:
            raise HTTPException(status_code=400, detail="Already friends")
        
        # Check for existing pending request
        existing_request = db.collection("friend_requests").where("from_user_id", "==", user_id).where("to_user_id", "==", friend_id).where("status", "==", "pending").limit(1).get()
        if existing_request:
            raise HTTPException(status_code=400, detail="Friend request already sent")
        
        # Create friend request
        request_data = {
            "from_user_id": user_id,
            "to_user_id": friend_id,
            "status": "pending",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = db.collection("friend_requests").add(request_data)
        request_data["id"] = doc_ref[1].id
        
        return {"message": "Friend request sent successfully", "request": request_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending friend request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/friends/requests")
async def get_friend_requests(current_user: dict = Depends(get_current_user)):
    """Get pending friend requests"""
    try:
        user_id = current_user['uid']
        
        # Get incoming requests
        incoming_requests = db.collection("friend_requests").where("to_user_id", "==", user_id).where("status", "==", "pending").get()
        
        requests = []
        for doc in incoming_requests:
            data = doc.to_dict()
            data["id"] = doc.id
            
            # Get sender info
            sender_data = await get_user_data(data["from_user_id"])
            data["from_user"] = sender_data
            
            requests.append(data)
        
        return {"requests": requests}
    except Exception as e:
        print(f"❌ Error getting friend requests: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/friends/requests/{request_id}")
async def respond_to_friend_request(request_id: str, action: str, current_user: dict = Depends(get_current_user)):
    """Accept or reject a friend request"""
    try:
        user_id = current_user['uid']
        
        if action not in ["accept", "reject"]:
            raise HTTPException(status_code=400, detail="Invalid action. Use 'accept' or 'reject'")
        
        # Get the request
        request_doc = db.collection("friend_requests").document(request_id).get()
        if not request_doc.exists:
            raise HTTPException(status_code=404, detail="Friend request not found")
        
        request_data = request_doc.to_dict()
        if request_data["to_user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to respond to this request")
        
        # Update request status
        db.collection("friend_requests").document(request_id).update({
            "status": "accepted" if action == "accept" else "rejected",
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        
        # If accepted, create friendship
        if action == "accept":
            friendship_data = {
                "user_id": user_id,
                "friend_id": request_data["from_user_id"],
                "created_at": firestore.SERVER_TIMESTAMP
            }
            db.collection("friendships").add(friendship_data)
            
            # Create reverse friendship
            reverse_friendship_data = {
                "user_id": request_data["from_user_id"],
                "friend_id": user_id,
                "created_at": firestore.SERVER_TIMESTAMP
            }
            db.collection("friendships").add(reverse_friendship_data)
        
        return {"message": f"Friend request {action}ed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error responding to friend request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/friends")
async def get_friends(current_user: dict = Depends(get_current_user)):
    """Get user's friends list"""
    try:
        user_id = current_user['uid']
        
        friendships = db.collection("friendships").where("user_id", "==", user_id).get()
        
        friends = []
        for doc in friendships:
            friendship_data = doc.to_dict()
            friend_data = await get_user_data(friendship_data["friend_id"])
            if friend_data:
                friends.append(friend_data)
        
        return {"friends": friends}
    except Exception as e:
        print(f"❌ Error getting friends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/friends/progress")
async def get_friends_progress(current_user: dict = Depends(get_current_user)):
    """Get today's progress for all friends"""
    try:
        user_id = current_user['uid']
        today = get_today_date()
        
        friendships = db.collection("friendships").where("user_id", "==", user_id).get()
        
        friends_progress = []
        for doc in friendships:
            friendship_data = doc.to_dict()
            friend_id = friendship_data["friend_id"]
            
            # Get friend info
            friend_data = await get_user_data(friend_id)
            if not friend_data:
                continue
            
            # Get friend's tasks for today
            friend_tasks = get_user_tasks_collection(friend_id, today).get()
            
            tasks = []
            for task_doc in friend_tasks:
                task_data = task_doc.to_dict()
                task_data["id"] = task_doc.id
                tasks.append(task_data)
            
            completed_tasks = len([t for t in tasks if t.get("completed", False)])
            total_tasks = len(tasks)
            completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            friends_progress.append({
                "friend": friend_data,
                "tasks": tasks,
                "stats": {
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "completion_percentage": round(completion_percentage)
                }
            })
        
        return {"friends_progress": friends_progress}
    except Exception as e:
        print(f"❌ Error getting friends progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Group Management
@app.post("/api/groups")
async def create_group(group_data: GroupCreate, current_user: dict = Depends(get_current_user)):
    """Create a new group"""
    try:
        user_id = current_user['uid']
        invite_code = generate_invite_code()
        
        group_info = {
            "name": group_data.name,
            "description": group_data.description,
            "host_id": user_id,
            "invite_code": invite_code,
            "is_private": group_data.is_private,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        # Create group
        group_ref = db.collection("groups").add(group_info)
        group_id = group_ref[1].id
        
        # Add host as first member
        member_data = {
            "user_id": user_id,
            "role": "host",
            "joined_at": firestore.SERVER_TIMESTAMP
        }
        db.collection("groups").document(group_id).collection("members").document(user_id).set(member_data)
        
        group_info["id"] = group_id
        return {"message": "Group created successfully", "group": group_info}
    except Exception as e:
        print(f"❌ Error creating group: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/groups/join")
async def join_group(invite_code: str, current_user: dict = Depends(get_current_user)):
    """Join a group using invite code"""
    try:
        user_id = current_user['uid']
        
        # Find group by invite code
        groups = db.collection("groups").where("invite_code", "==", invite_code).limit(1).get()
        if not groups:
            raise HTTPException(status_code=404, detail="Invalid invite code")
        
        group_doc = groups[0]
        group_id = group_doc.id
        
        # Check if already a member
        existing_member = db.collection("groups").document(group_id).collection("members").document(user_id).get()
        if existing_member.exists:
            raise HTTPException(status_code=400, detail="Already a member of this group")
        
        # Add as member
        member_data = {
            "user_id": user_id,
            "role": "member",
            "joined_at": firestore.SERVER_TIMESTAMP
        }
        db.collection("groups").document(group_id).collection("members").document(user_id).set(member_data)
        
        return {"message": "Successfully joined group", "group_id": group_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error joining group: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/groups")
async def get_user_groups(current_user: dict = Depends(get_current_user)):
    """Get all groups user is a member of"""
    try:
        user_id = current_user['uid']
        
        # Get all group memberships
        member_docs = db.collection_group("members").where("user_id", "==", user_id).get()
        
        groups = []
        for member_doc in member_docs:
            group_id = member_doc.reference.parent.parent.id
            group_doc = db.collection("groups").document(group_id).get()
            
            if group_doc.exists:
                group_data = group_doc.to_dict()
                group_data["id"] = group_id
                
                # Get member count
                members = db.collection("groups").document(group_id).collection("members").get()
                group_data["member_count"] = len(members)
                
                # Get host info
                group_data["host"] = await get_user_data(group_data["host_id"])
                
                groups.append(group_data)
        
        return {"groups": groups}
    except Exception as e:
        print(f"❌ Error getting user groups: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/groups/{group_id}")
async def get_group_details(group_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed group information"""
    try:
        user_id = current_user['uid']
        
        # Verify user is a member
        member_doc = db.collection("groups").document(group_id).collection("members").document(user_id).get()
        if not member_doc.exists:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        
        # Get group info
        group_doc = db.collection("groups").document(group_id).get()
        if not group_doc.exists:
            raise HTTPException(status_code=404, detail="Group not found")
        
        group_data = group_doc.to_dict()
        group_data["id"] = group_id
        
        # Get members
        member_docs = db.collection("groups").document(group_id).collection("members").get()
        members = []
        for doc in member_docs:
            member_data = doc.to_dict()
            member_data["user"] = await get_user_data(member_data["user_id"])
            members.append(member_data)
        
        group_data["members"] = members
        group_data["member_count"] = len(members)
        
        return {"group": group_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting group details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced Task Management
@app.post("/api/tasks")
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    """Create a new personal task"""
    try:
        user_id = current_user['uid']
        today = get_today_date()
        
        task_data = {
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "completed": False,
            "created_at": firestore.SERVER_TIMESTAMP,
            "user_id": user_id,
            "group_id": task.group_id
        }
        
        doc_ref = get_user_tasks_collection(user_id, today).add(task_data)
        task_data["id"] = doc_ref[1].id
        
        return {"message": "Task created successfully", "task": task_data}
    except Exception as e:
        print(f"❌ Error creating task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tasks/today")
async def get_today_tasks(current_user: dict = Depends(get_current_user)):
    """Get all personal tasks for today"""
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
        print(f"❌ Error getting today's tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Group Task Management
@app.post("/api/groups/{group_id}/tasks")
async def create_group_task(group_id: str, task: GroupTaskCreate, current_user: dict = Depends(get_current_user)):
    """Create a group task (host only)"""
    try:
        user_id = current_user['uid']
        
        # Verify user is group host
        group_doc = db.collection("groups").document(group_id).get()
        if not group_doc.exists:
            raise HTTPException(status_code=404, detail="Group not found")
        
        group_data = group_doc.to_dict()
        if group_data["host_id"] != user_id:
            raise HTTPException(status_code=403, detail="Only group host can create group tasks")
        
        task_data = {
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "created_by": user_id,
            "group_id": group_id,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = db.collection("groups").document(group_id).collection("tasks").add(task_data)
        task_data["id"] = doc_ref[1].id
        
        return {"message": "Group task created successfully", "task": task_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating group task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/groups/{group_id}/tasks")
async def get_group_tasks(group_id: str, current_user: dict = Depends(get_current_user)):
    """Get all tasks for a group"""
    try:
        user_id = current_user['uid']
        
        # Verify user is group member
        member_doc = db.collection("groups").document(group_id).collection("members").document(user_id).get()
        if not member_doc.exists:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        
        tasks = []
        task_docs = db.collection("groups").document(group_id).collection("tasks").get()
        
        for doc in task_docs:
            task_data = doc.to_dict()
            task_data["id"] = doc.id
            tasks.append(task_data)
        
        return {"tasks": tasks, "group_id": group_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting group tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/groups/{group_id}/progress")
async def get_group_progress(group_id: str, current_user: dict = Depends(get_current_user)):
    """Get progress of all group members on group tasks"""
    try:
        user_id = current_user['uid']
        
        # Verify user is group member
        member_doc = db.collection("groups").document(group_id).collection("members").document(user_id).get()
        if not member_doc.exists:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        
        today = get_today_date()
        
        # Get all group members
        member_docs = db.collection("groups").document(group_id).collection("members").get()
        
        # Get group tasks
        group_task_docs = db.collection("groups").document(group_id).collection("tasks").get()
        group_tasks = [{"id": doc.id, **doc.to_dict()} for doc in group_task_docs]
        
        members_progress = []
        for member_doc in member_docs:
            member_data = member_doc.to_dict()
            member_id = member_data["user_id"]
            
            # Get member info
            member_info = await get_user_data(member_id)
            if not member_info:
                continue
            
            # Get member's personal tasks that are related to group tasks
            member_tasks = get_user_tasks_collection(member_id, today).where("group_id", "==", group_id).get()
            
            tasks = []
            for task_doc in member_tasks:
                task_data = task_doc.to_dict()
                task_data["id"] = task_doc.id
                tasks.append(task_data)
            
            completed_tasks = len([t for t in tasks if t.get("completed", False)])
            total_tasks = len(tasks)
            completion_percentage = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            
            members_progress.append({
                "member": member_info,
                "role": member_data["role"],
                "tasks": tasks,
                "stats": {
                    "total_tasks": total_tasks,
                    "completed_tasks": completed_tasks,
                    "completion_percentage": round(completion_percentage)
                }
            })
        
        return {
            "group_id": group_id,
            "group_tasks": group_tasks,
            "members_progress": members_progress
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting group progress: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced Motivational Notes
@app.post("/api/motivational-notes")
async def send_motivational_note(
    message: str, 
    to_user_id: str, 
    group_id: Optional[str] = None, 
    current_user: dict = Depends(get_current_user)
):
    """Send a motivational note to a friend or group member"""
    try:
        user_id = current_user['uid']
        
        if to_user_id == user_id:
            raise HTTPException(status_code=400, detail="Cannot send note to yourself")
        
        # Verify relationship (friend or group member)
        if group_id:
            # Check if both users are in the same group
            sender_member = db.collection("groups").document(group_id).collection("members").document(user_id).get()
            recipient_member = db.collection("groups").document(group_id).collection("members").document(to_user_id).get()
            
            if not (sender_member.exists and recipient_member.exists):
                raise HTTPException(status_code=403, detail="Both users must be in the same group")
        else:
            # Check if users are friends
            friendship = db.collection("friendships").where("user_id", "==", user_id).where("friend_id", "==", to_user_id).limit(1).get()
            if not friendship:
                raise HTTPException(status_code=403, detail="Can only send notes to friends")
        
        note_data = {
            "from_user_id": user_id,
            "to_user_id": to_user_id,
            "message": message,
            "group_id": group_id,
            "read": False,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = db.collection("motivational_notes").add(note_data)
        note_data["id"] = doc_ref[1].id
        
        return {"message": "Motivational note sent successfully", "note": note_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending motivational note: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/motivational-notes")
async def get_motivational_notes(current_user: dict = Depends(get_current_user)):
    """Get motivational notes for current user"""
    try:
        user_id = current_user['uid']
        
        notes = []
        note_docs = db.collection("motivational_notes").where("to_user_id", "==", user_id).order_by("created_at", direction=firestore.Query.DESCENDING).limit(50).get()
        
        for doc in note_docs:
            note_data = doc.to_dict()
            note_data["id"] = doc.id
            
            # Get sender info
            sender_info = await get_user_data(note_data["from_user_id"])
            note_data["from_user"] = sender_info
            
            notes.append(note_data)
        
        return {"notes": notes}
    except Exception as e:
        print(f"❌ Error getting motivational notes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Group Messaging
@app.post("/api/groups/{group_id}/messages")
async def send_group_message(group_id: str, message: str, current_user: dict = Depends(get_current_user)):
    """Send a message to group chat"""
    try:
        user_id = current_user['uid']
        
        # Verify user is group member
        member_doc = db.collection("groups").document(group_id).collection("members").document(user_id).get()
        if not member_doc.exists:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        
        message_data = {
            "user_id": user_id,
            "message": message,
            "group_id": group_id,
            "created_at": firestore.SERVER_TIMESTAMP
        }
        
        doc_ref = db.collection("groups").document(group_id).collection("messages").add(message_data)
        message_data["id"] = doc_ref[1].id
        
        # Get user info
        message_data["user"] = await get_user_data(user_id)
        
        return {"message": "Message sent successfully", "group_message": message_data}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending group message: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/groups/{group_id}/messages")
async def get_group_messages(group_id: str, limit: int = 50, current_user: dict = Depends(get_current_user)):
    """Get group chat messages"""
    try:
        user_id = current_user['uid']
        
        # Verify user is group member
        member_doc = db.collection("groups").document(group_id).collection("members").document(user_id).get()
        if not member_doc.exists:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        
        messages = []
        message_docs = db.collection("groups").document(group_id).collection("messages").order_by("created_at", direction=firestore.Query.DESCENDING).limit(limit).get()
        
        for doc in reversed(list(message_docs)):  # Reverse to get chronological order
            message_data = doc.to_dict()
            message_data["id"] = doc.id
            
            # Get user info
            message_data["user"] = await get_user_data(message_data["user_id"])
            
            messages.append(message_data)
        
        return {"messages": messages, "group_id": group_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting group messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
