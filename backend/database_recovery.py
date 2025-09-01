import os
import sqlite3
import shutil
import glob
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def find_databases():
    """Find all database files in the current directory and instance folder"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    main_db_path = os.path.join(script_dir, 'petrol_station.db')
    instance_db_path = os.path.join(script_dir, 'instance', 'petrol_station.db')
    
    db_paths = []
    if os.path.exists(main_db_path):
        db_paths.append(("Main DB", main_db_path))
    
    if os.path.exists(instance_db_path):
        db_paths.append(("Instance DB", instance_db_path))
    
    # Find backup files
    backup_pattern = os.path.join(script_dir, 'petrol_station.db.bak-*')
    instance_backup_pattern = os.path.join(script_dir, 'instance', 'petrol_station.db.bak-*')
    
    backups = []
    for path in glob.glob(backup_pattern):
        backups.append(("Main Backup", path))
    
    for path in glob.glob(instance_backup_pattern):
        backups.append(("Instance Backup", path))
    
    # Sort backups by modification time (newest first)
    backups.sort(key=lambda x: os.path.getmtime(x[1]), reverse=True)
    
    return db_paths, backups

def check_database(db_path):
    """Check if the database is valid and has the expected tables with data"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        tables = [table[0] for table in tables]
        
        if 'daily_consolidation' not in tables:
            logger.warning(f"daily_consolidation table missing in {db_path}")
            conn.close()
            return False, 0, []
        
        # Check if the table has data
        cursor.execute("SELECT COUNT(*) FROM daily_consolidation")
        count = cursor.fetchone()[0]
        
        # Get column info
        cursor.execute("PRAGMA table_info(daily_consolidation)")
        columns = [column[1] for column in cursor.fetchall()]
        
        conn.close()
        return True, count, columns
    except Exception as e:
        logger.error(f"Error checking database {db_path}: {str(e)}")
        return False, 0, []

def create_backup(db_path):
    """Create a backup of the database"""
    try:
        backup_path = f"{db_path}.bak-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        shutil.copy2(db_path, backup_path)
        logger.info(f"Created backup at: {backup_path}")
        return backup_path
    except Exception as e:
        logger.error(f"Error creating backup: {str(e)}")
        return None

def restore_from_backup(backup_path, target_path):
    """Restore database from backup"""
    try:
        shutil.copy2(backup_path, target_path)
        logger.info(f"Restored {target_path} from {backup_path}")
        return True
    except Exception as e:
        logger.error(f"Error restoring from backup: {str(e)}")
        return False

def add_hpcl_column(db_path):
    """Add the hpcl_payment column to the database"""
    try:
        # Create backup first
        backup_path = create_backup(db_path)
        if not backup_path:
            return False
        
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if the column already exists
        cursor.execute("PRAGMA table_info(daily_consolidation)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'hpcl_payment' not in columns:
            logger.info("Adding hpcl_payment column to daily_consolidation table")
            cursor.execute("ALTER TABLE daily_consolidation ADD COLUMN hpcl_payment FLOAT DEFAULT 0.0")
            conn.commit()
            logger.info("Column added successfully")
            
            # Verify data is still intact
            cursor.execute("SELECT COUNT(*) FROM daily_consolidation")
            count = cursor.fetchone()[0]
            logger.info(f"Table has {count} records after modification")
            
            if count == 0:
                logger.error("Data lost during column addition! Restoring from backup...")
                conn.close()
                restore_from_backup(backup_path, db_path)
                return False
        else:
            logger.info("hpcl_payment column already exists")
        
        conn.close()
        return True
    except Exception as e:
        logger.error(f"Error adding hpcl_payment column: {str(e)}")
        if backup_path:
            logger.info("Attempting to restore from backup...")
            restore_from_backup(backup_path, db_path)
        return False

def main():
    print("\n===== PETROL STATION DATABASE RECOVERY TOOL =====\n")
    print("This tool will help you recover your database or add the HPCL payment column safely.\n")
    
    # Find databases and backups
    db_paths, backups = find_databases()
    
    if not db_paths and not backups:
        print("No database files or backups found!")
        return
    
    print("Available database files:")
    for i, (db_type, path) in enumerate(db_paths):
        valid, count, columns = check_database(path)
        has_hpcl = 'hpcl_payment' in columns
        status = f"{'VALID' if valid else 'INVALID'}, {count} records, HPCL column: {'YES' if has_hpcl else 'NO'}"
        print(f"{i+1}. {db_type}: {path} - {status}")
    
    print("\nAvailable backups:")
    if not backups:
        print("No backups found.")
    else:
        for i, (backup_type, path) in enumerate(backups):
            valid, count, columns = check_database(path)
            modified_time = datetime.fromtimestamp(os.path.getmtime(path)).strftime('%Y-%m-%d %H:%M:%S')
            status = f"{'VALID' if valid else 'INVALID'}, {count} records, Modified: {modified_time}"
            print(f"{i+1}. {backup_type}: {path} - {status}")
    
    print("\nWhat would you like to do?")
    print("1. Add HPCL payment column to existing database (safe)")
    print("2. Restore from a backup")
    print("3. Exit")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == "1" and db_paths:
        if len(db_paths) == 1:
            db_to_update = db_paths[0][1]
        else:
            db_choice = input(f"Which database to update? (1-{len(db_paths)}): ").strip()
            try:
                db_index = int(db_choice) - 1
                if 0 <= db_index < len(db_paths):
                    db_to_update = db_paths[db_index][1]
                else:
                    print("Invalid choice.")
                    return
            except ValueError:
                print("Invalid input.")
                return
        
        print(f"Adding HPCL payment column to {db_to_update}...")
        if add_hpcl_column(db_to_update):
            print("\nDatabase updated successfully!")
        else:
            print("\nFailed to update database.")
    
    elif choice == "2" and backups:
        backup_choice = input(f"Which backup to restore? (1-{len(backups)}): ").strip()
        try:
            backup_index = int(backup_choice) - 1
            if 0 <= backup_index < len(backups):
                backup_to_restore = backups[backup_index][1]
            else:
                print("Invalid choice.")
                return
        except ValueError:
            print("Invalid input.")
            return
        
        target_choice = input("Restore to:\n1. Main database\n2. Instance database\nChoice: ").strip()
        if target_choice == "1":
            script_dir = os.path.dirname(os.path.abspath(__file__))
            target_path = os.path.join(script_dir, 'petrol_station.db')
        elif target_choice == "2":
            script_dir = os.path.dirname(os.path.abspath(__file__))
            target_path = os.path.join(script_dir, 'instance', 'petrol_station.db')
            # Ensure directory exists
            os.makedirs(os.path.dirname(target_path), exist_ok=True)
        else:
            print("Invalid choice.")
            return
        
        print(f"Restoring {backup_to_restore} to {target_path}...")
        if restore_from_backup(backup_to_restore, target_path):
            print("\nDatabase restored successfully!")
        else:
            print("\nFailed to restore database.")
    
    elif choice == "3":
        print("Exiting...")
    
    else:
        print("Invalid choice or no databases/backups available.")

if __name__ == "__main__":
    main()
