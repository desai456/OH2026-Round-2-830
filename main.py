import sys
import os

# Ensure O-1 directory and O-1/backend are on Python path
current_dir = os.path.dirname(__file__)
o1_dir = os.path.join(current_dir, 'O-1')
sys.path.insert(0, o1_dir)
sys.path.insert(0, os.path.join(o1_dir, 'backend'))

from backend.main import app
