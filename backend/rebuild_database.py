import os
import sys

# Get the absolute path to the backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))

# Add it to the Python path so we can import from app.py
sys.path.append(backend_dir)

print("Starting database rebuild process...")

try:
    # Remove any existing database files
    main_db = os.path.join(backend_dir, 'petrol_station.db')
    instance_db = os.path.join(backend_dir, 'instance', 'petrol_station.db')
    
    if os.path.exists(main_db):
        os.remove(main_db)
        print(f"Removed existing database: {main_db}")
        
    if os.path.exists(instance_db):
        os.remove(instance_db)
        print(f"Removed existing database: {instance_db}")
    
    # Import from the app
    from app import db, app
    
    # Initialize Flask app context
    with app.app_context():
        # Create all tables with the correct schema
        db.create_all()
        print("Created all tables with correct schema.")
        
        # Verify the daily_consolidation table has all columns
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        columns = [column['name'] for column in inspector.get_columns('daily_consolidation')]
        print("\nColumns in daily_consolidation table:")
        for column in columns:
            print(f" - {column}")
        
        # Check if hpcl_payment exists
        if 'hpcl_payment' in columns:
            print("\nSuccess! The hpcl_payment column exists in the database.")
        else:
            print("\nError: hpcl_payment column was not created!")

    print("\nDatabase rebuild complete. You can now start the application.")
except Exception as e:
    print(f"Error during database rebuild: {e}")
    
input("\nPress Enter to continue...")
