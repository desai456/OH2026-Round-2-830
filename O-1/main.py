import sys
import os

# Ensure project root directory is on Python path
sys.path.insert(0, os.path.dirname(__file__))

from backend.main import app
