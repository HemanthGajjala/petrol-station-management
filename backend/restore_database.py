import os
import sqlite3
import shutil
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_database_health():
    """Check if the database exists and has the expected tables"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    main_db_path = os.path.join(script_dir, 'petrol_station.db')
    instance_db_path = os.path.join(script_dir, 'instance', 'petrol_station.db')
    
    # Check if either database file exists
    main_exists = os.path.exists(main_db_path)
    instance_exists = os.path.exists(instance_db_path)
    
    logger.info(f"Main DB exists: {main_exists}")
    logger.info(f"Instance DB exists: {instance_exists}")
    
    if not main_exists and not instance_exists:
        logger.error("No database files found!")
        return False
    
    # Check the tables in the database files
    try:
        # Check main database if it exists
        if main_exists:
            conn = sqlite3.connect(main_db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            logger.info(f"Main DB tables: {tables}")
            has_daily_consolidation = any('daily_consolidation' in table[0].lower() for table in tables)
            conn.close()
            
            if has_daily_consolidation:
                # Check if the table has data
                conn = sqlite3.connect(main_db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM daily_consolidation")
                count = cursor.fetchone()[0]
                logger.info(f"Main DB daily_consolidation record count: {count}")
                conn.close()
                
                return count > 0
        
        # Check instance database if it exists
        if instance_exists:
            conn = sqlite3.connect(instance_db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            logger.info(f"Instance DB tables: {tables}")
            has_daily_consolidation = any('daily_consolidation' in table[0].lower() for table in tables)
            conn.close()
            
            if has_daily_consolidation:
                # Check if the table has data
                conn = sqlite3.connect(instance_db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM daily_consolidation")
                count = cursor.fetchone()[0]
                logger.info(f"Instance DB daily_consolidation record count: {count}")
                conn.close()
                
                return count > 0
                
        return False
    except Exception as e:
        logger.error(f"Error checking database health: {str(e)}")
        return False

def fix_database():
    """Add the hpcl_payment column if it's missing but don't delete any data"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    main_db_path = os.path.join(script_dir, 'petrol_station.db')
    instance_db_path = os.path.join(script_dir, 'instance', 'petrol_station.db')
    
    # Determine which database to use
    db_path = None
    if os.path.exists(main_db_path):
        db_path = main_db_path
    elif os.path.exists(instance_db_path):
        db_path = instance_db_path
    
    if not db_path:
        logger.error("No database file found to fix!")
        return False
    
    logger.info(f"Attempting to fix database: {db_path}")
    
    try:
        # Create backup first
        backup_path = f"{db_path}.bak-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        shutil.copy2(db_path, backup_path)
        logger.info(f"Created backup at: {backup_path}")
        
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if the table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='daily_consolidation'")
        if not cursor.fetchone():
            logger.error("daily_consolidation table doesn't exist!")
            conn.close()
            return False
        
        # Check if the column already exists
        cursor.execute("PRAGMA table_info(daily_consolidation)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'hpcl_payment' not in columns:
            logger.info("Adding hpcl_payment column to daily_consolidation table")
            cursor.execute("ALTER TABLE daily_consolidation ADD COLUMN hpcl_payment FLOAT DEFAULT 0.0")
            conn.commit()
            logger.info("Column added successfully")
        else:
            logger.info("hpcl_payment column already exists")
            
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"Error fixing database: {str(e)}")
        return False

def main():
    logger.info("Starting database restoration process")
    
    # Check if the database is healthy
    is_healthy = check_database_health()
    logger.info(f"Database health check: {'OK' if is_healthy else 'Failed'}")
    
    if not is_healthy:
        logger.warning("Database appears to be corrupted or missing data")
        
    # Try to fix the database
    fixed = fix_database()
    logger.info(f"Database fix attempt: {'Successful' if fixed else 'Failed'}")
    
    if fixed:
        logger.info("Database should now work correctly with the HPCL payment column added")
    else:
        logger.error("Could not fix the database. Manual restoration may be required.")
    
    return fixed

if __name__ == "__main__":
    success = main()
    print(f"\nDatabase restoration {'SUCCESSFUL' if success else 'FAILED'}")
    if success:
        print("You can now start the backend server and use the application")
    else:
        print("Please contact support for manual database recovery assistance")
