import os
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from .db.database import engine, Base
from .routes import auth, projects, tasks, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Team Task Manager API")



# CORS middleware - allow all origins for Railway deployment
FRONTEND_URL = os.getenv("FRONTEND_URL", "*")
origins = [FRONTEND_URL] if FRONTEND_URL != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if FRONTEND_URL != "*" else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers — all under /api prefix so they don't clash with frontend mount
app.include_router(auth.router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(tasks.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

# Serve React frontend
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        # Allow API routes to be handled by their respective routers
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
            
        # Check if requested path is a file in the dist folder
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
            
        # For any other path, serve index.html for React Router (SPA)
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
            
        raise HTTPException(status_code=404, detail="Frontend build not found")
else:
    @app.get("/")
    def read_root():
        return {"message": "Backend is running. Frontend build not found."}
