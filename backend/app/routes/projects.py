from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..models import models
from ..schemas import schemas
from .auth import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])

def check_admin(user: models.User):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

@router.post("/", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    check_admin(current_user)
    new_project = models.Project(
        name=project.name,
        description=project.description,
        created_by=current_user.id
    )
    # Admin is automatically a member
    new_project.members.append(current_user)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.get("/", response_model=List[schemas.Project])
def get_projects(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role == "admin":
        return db.query(models.Project).all()
    return current_user.projects

@router.post("/{project_id}/add-member")
def add_member(
    project_id: int, 
    member: schemas.AddMember, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    check_admin(current_user)
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    user_to_add = db.query(models.User).filter(models.User.email == member.email).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_to_add in project.members:
        return {"message": "User is already a member"}
    
    project.members.append(user_to_add)
    db.commit()
    return {"message": f"User {member.email} added to project"}
