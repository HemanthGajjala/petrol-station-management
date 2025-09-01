#!/usr/bin/env python3
# Railway entry point for Petrol Station Management System
import os
import sys
import subprocess

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import and run the main Flask app
if __name__ == '__main__':
    os.chdir('backend')
    from app import app
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
