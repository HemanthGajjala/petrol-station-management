#!/usr/bin/env python3
"""
Upload tank readings and procurement data to Railway
"""
import sqlite3
import json
import requests
from datetime import datetime

RAILWAY_URL = "https://web-production-c24f.up.railway.app"

def upload_tank_readings():
    """Upload tank readings"""
    conn = sqlite3.connect('instance/petrol_station.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM tank_readings ORDER BY date")
    columns = [description[0] for description in cursor.description]
    data = cursor.fetchall()
    entries = [dict(zip(columns, row)) for row in data]
    
    conn.close()
    
    print(f"📊 Uploading {len(entries)} tank readings...")
    
    success_count = 0
    for entry in entries:
        try:
            upload_data = {k: v for k, v in entry.items() if k not in ['id', 'created_at']}
            
            response = requests.post(
                f"{RAILWAY_URL}/api/tank-readings",
                json=upload_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                success_count += 1
                print(f"✅ Tank reading for {entry['date']}")
            else:
                print(f"❌ Failed tank reading {entry['date']}: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print(f"🎉 Tank readings: {success_count}/{len(entries)} uploaded!")

def upload_procurement():
    """Upload procurement data"""
    conn = sqlite3.connect('instance/petrol_station.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM procurement_data ORDER BY invoice_date")
    columns = [description[0] for description in cursor.description]
    data = cursor.fetchall()
    entries = [dict(zip(columns, row)) for row in data]
    
    conn.close()
    
    print(f"📊 Uploading {len(entries)} procurement entries...")
    
    success_count = 0
    for entry in entries:
        try:
            upload_data = {k: v for k, v in entry.items() if k not in ['id', 'created_at']}
            
            response = requests.post(
                f"{RAILWAY_URL}/api/procurement",
                json=upload_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                success_count += 1
                print(f"✅ Procurement {entry.get('invoice_number', 'entry')}")
            else:
                print(f"❌ Failed procurement: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print(f"🎉 Procurement: {success_count}/{len(entries)} uploaded!")

if __name__ == "__main__":
    upload_tank_readings()
    upload_procurement()
    print(f"\n🌐 All data uploaded! Check: {RAILWAY_URL}/all-data")
