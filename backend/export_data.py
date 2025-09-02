#!/usr/bin/env python3
"""
Export local database data to populate Railway database
"""
import sqlite3
import json
import requests
import os
from datetime import datetime

def export_local_data():
    """Export data from local database"""
    conn = sqlite3.connect('instance/petrol_station.db')
    cursor = conn.cursor()
    
    # Get daily consolidation data
    cursor.execute("SELECT * FROM daily_consolidation")
    daily_columns = [description[0] for description in cursor.description]
    daily_data = cursor.fetchall()
    
    # Get tank readings
    cursor.execute("SELECT * FROM tank_readings")
    tank_columns = [description[0] for description in cursor.description]
    tank_data = cursor.fetchall()
    
    # Get procurement data if exists
    try:
        cursor.execute("SELECT * FROM procurement_data")
        proc_columns = [description[0] for description in cursor.description]
        proc_data = cursor.fetchall()
    except sqlite3.OperationalError:
        proc_columns = []
        proc_data = []
    
    conn.close()
    
    print(f"Found {len(daily_data)} daily entries")
    print(f"Found {len(tank_data)} tank readings")
    print(f"Found {len(proc_data)} procurement entries")
    
    # Convert to dictionaries
    daily_entries = [dict(zip(daily_columns, row)) for row in daily_data]
    tank_entries = [dict(zip(tank_columns, row)) for row in tank_data]
    proc_entries = [dict(zip(proc_columns, row)) for row in proc_data]
    
    # Show sample data
    if daily_entries:
        print("\nSample daily entry:")
        print(json.dumps(daily_entries[0], indent=2, default=str))
    
    return daily_entries, tank_entries, proc_entries

if __name__ == "__main__":
    daily, tank, proc = export_local_data()
