from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from ..db.database import get_db
from ..models import models
from ..schemas import schemas
from .auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Task)
    if current_user.role != "admin":
        query = query.filter(models.Task.assigned_to == current_user.id)
    
    tasks = query.all()
    
    total = len(tasks)
    completed = len([t for t in tasks if t.status == "done"])
    pending = len([t for t in tasks if t.status != "done"])
    overdue = len([t for t in tasks if t.due_date and t.due_date < datetime.now() and t.status != "done"])
    
    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "overdue_tasks": overdue
    }
