#!/usr/bin/env python3
"""
Upload local database data to Railway deployment
"""
import sqlite3
import json
import requests
import sys
from datetime import datetime

# Railway URL - your actual Railway deployment
RAILWAY_URL = "https://web-production-c24f.up.railway.app"

def upload_to_railway():
    """Upload local data to Railway"""
    conn = sqlite3.connect('instance/petrol_station.db')
    cursor = conn.cursor()
    
    print("🔄 Exporting local data...")
    
    # Get daily consolidation data
    cursor.execute("SELECT * FROM daily_consolidation ORDER BY date")
    daily_columns = [description[0] for description in cursor.description]
    daily_data = cursor.fetchall()
    daily_entries = [dict(zip(daily_columns, row)) for row in daily_data]
    
    conn.close()
    
    print(f"📊 Found {len(daily_entries)} daily entries to upload")
    
    # Upload each daily entry
    success_count = 0
    for entry in daily_entries:
        try:
            # Remove id and created_at as they'll be auto-generated
            upload_data = {k: v for k, v in entry.items() if k not in ['id', 'created_at']}
            
            response = requests.post(
                f"{RAILWAY_URL}/api/daily-consolidation",
                json=upload_data,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                success_count += 1
                print(f"✅ Uploaded entry for {entry['date']}")
            else:
                print(f"❌ Failed to upload {entry['date']}: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Error uploading {entry.get('date', 'unknown')}: {str(e)}")
    
    print(f"\n🎉 Successfully uploaded {success_count}/{len(daily_entries)} entries!")
    print(f"🌐 Check your data at: {RAILWAY_URL}")

if __name__ == "__main__":
    upload_to_railway()
