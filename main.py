#!/usr/bin/env python3
# Railway entry point for petrol station management system
# DEBUG VERSION: Critical debugging with separate RUN commands
# This will force execution of each debug step to identify the root cause
import os
import sys

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Set working directory to backend
os.chdir(backend_path)

# Import and run the main Flask app
if __name__ == '__main__':
    from app import app
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
