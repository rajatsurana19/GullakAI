import sys
import os

# Insert backend directory to python search path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "..", "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Ensure Vercel environment flag
os.environ.setdefault("VERCEL", "1")

from app.main import app
