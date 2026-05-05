import os
import sys
from pathlib import Path

# Add the directory containing 'backend' to sys.path
# This allows 'from backend.app.main import app' to work if needed, 
# or we can add 'backend/app' directly.
current_dir = Path(__file__).parent.parent
sys.path.append(str(current_dir))

# Try to import the app from the backend
try:
    from backend.app.app import app
except ImportError:
    # Fallback or diagnostic
    sys.path.append(str(current_dir / "backend" / "app"))
    from app import app

# Vercel looks for 'app' by default if not specified, 
# but naming it 'app' is standard.
# However, many people use 'handler' or similar.
# In vercel.json we just pointed to index.py.
# FastAPI instance is 'app'.
