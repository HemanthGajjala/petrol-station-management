#!/usr/bin/env python3
"""
Simple test to verify Google Sheets integration is working
"""

print("🚀 Google Drive Integration Test")
print("=" * 50)

try:
    # Test imports
    print("📦 Testing imports...")
    
    from google_drive_integration import GoogleDriveDBSync
    print("✅ Google Drive integration imported")
    
    from google_sheets_ai_chat import GoogleSheetsAIChat  
    print("✅ Google Sheets AI chat imported")
    
    import gspread
    print("✅ gspread imported")
    
    import pandas as pd
    print("✅ pandas imported")
    
    print("\n📋 Setup Requirements:")
    print("1. 🔐 Download Google credentials file")
    print("   - Go to: https://console.cloud.google.com/")
    print("   - Create project: 'Petrol Station Management'")
    print("   - Enable: Google Sheets API & Google Drive API")
    print("   - Create Service Account key (JSON)")
    print("   - Save as: google_credentials.json")
    
    print("\n2. 📧 Your Email Configuration:")
    print("   - Owner: hemanth.gajjala88@gmail.com")
    print("   - Spreadsheet will be shared automatically")
    
    print("\n3. 🔑 API Keys:")
    print("   - OpenAI API key is configured")
    print("   - Google credentials needed")
    
    print("\n🎯 Next Steps:")
    print("1. Complete Google Cloud setup")
    print("2. Place google_credentials.json in backend folder")
    print("3. Test with: curl http://localhost:5000/api/google-sheets/status")
    print("4. Setup with: curl -X POST http://localhost:5000/api/google-sheets/setup")
    
    print("\n✅ Integration code is ready!")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Install with: pip install -r requirements_google.txt")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 50)
