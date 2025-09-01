#!/usr/bin/env python3
"""
Google Drive Setup and Configuration Script
Sets up Google Drive integration with your email: hemanth.gajjala88@gmail.com
"""

import os
import json
import webbrowser
from pathlib import Path

def create_google_credentials_guide():
    """Create a guide for setting up Google credentials"""
    
    guide = """
# Google Drive Integration Setup Guide

## Step 1: Create Google Cloud Project

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing project
3. Name: "Petrol Station Management"

## Step 2: Enable Required APIs

Go to "APIs & Services" > "Library" and enable:
- Google Sheets API
- Google Drive API

## Step 3: Create Service Account (Recommended)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Name: "petrol-station-sync"
4. Click "Create and Continue"
5. Skip role assignment (click "Continue")
6. Click "Done"

## Step 4: Create Service Account Key

1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create New Key"
4. Select "JSON" format
5. Download the file
6. Rename it to "google_credentials.json"
7. Place it in the backend folder

## Step 5: Share Spreadsheet

The system will automatically create a spreadsheet and share it with your email:
hemanth.gajjala88@gmail.com

## Alternative: OAuth2 Setup (If you prefer user authentication)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Desktop application"
4. Download the JSON file
5. Rename to "credentials.json"
6. Place in backend folder

## File Structure Expected:

backend/
├── google_credentials.json  (Service Account - Recommended)
└── credentials.json        (OAuth2 - Alternative)

## Test the Setup

Run: python setup_google_drive.py

This will:
✅ Test Google authentication
✅ Create spreadsheet
✅ Share with hemanth.gajjala88@gmail.com
✅ Sync all database tables
✅ Test AI chat with Google Sheets data
"""
    
    with open('GOOGLE_SETUP_GUIDE.md', 'w') as f:
        f.write(guide)
    
    print("📝 Created GOOGLE_SETUP_GUIDE.md")
    print("   Please follow the steps in this guide to set up Google Drive integration")

def setup_environment():
    """Set up the environment for Google Drive integration"""
    
    # Create .env file template
    env_template = """# Google Drive Integration Environment Variables
GOOGLE_CREDENTIALS_PATH=google_credentials.json
GOOGLE_SPREADSHEET_NAME=Petrol Station Data
OWNER_EMAIL=hemanth.gajjala88@gmail.com
OPENAI_API_KEY=your_openai_api_key_here

# Google Sheets Configuration
AUTO_SYNC_INTERVAL_MINUTES=5
ENABLE_REAL_TIME_SYNC=true
"""
    
    if not os.path.exists('.env'):
        with open('.env', 'w') as f:
            f.write(env_template)
        print("📝 Created .env file template")
        print("   Please update the OPENAI_API_KEY in the .env file")
    
    # Create credentials placeholder
    if not os.path.exists('google_credentials.json') and not os.path.exists('credentials.json'):
        placeholder = {
            "type": "service_account",
            "project_id": "your-project-id",
            "private_key_id": "your-private-key-id", 
            "private_key": "-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n",
            "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
            "client_id": "your-client-id",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
        }
        
        with open('google_credentials_template.json', 'w') as f:
            json.dump(placeholder, f, indent=2)
        
        print("📝 Created google_credentials_template.json")
        print("   Replace with your actual Google credentials file")

def test_google_integration():
    """Test Google Drive integration"""
    try:
        from google_drive_integration import GoogleDriveDBSync
        from google_sheets_ai_chat import GoogleSheetsAIChat
        
        print("🔄 Testing Google Drive Integration...")
        
        # Test Google Drive sync
        sync = GoogleDriveDBSync(owner_email="hemanth.gajjala88@gmail.com")
        
        if sync.authenticate():
            print("✅ Google Drive authentication successful")
            
            # Test spreadsheet creation/access
            if sync.setup_or_access_spreadsheet():
                print("✅ Spreadsheet setup successful")
                print(f"   URL: {sync.get_sheet_url()}")
                
                # Test data sync
                if sync.sync_all_tables():
                    print("✅ Data synchronization successful")
                    
                    # Test AI chat
                    openai_key = os.getenv('OPENAI_API_KEY')
                    if openai_key:
                        ai_chat = GoogleSheetsAIChat(openai_key, owner_email="hemanth.gajjala88@gmail.com")
                        response = ai_chat.chat_with_sheets("What is our current inventory value?")
                        print("✅ AI Chat with Google Sheets successful")
                        print(f"   Sample response: {response[:100]}...")
                    else:
                        print("⚠️  OpenAI API key not found - AI chat not tested")
                else:
                    print("❌ Data synchronization failed")
            else:
                print("❌ Spreadsheet setup failed")
        else:
            print("❌ Google Drive authentication failed")
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Please install required packages: pip install -r requirements_google.txt")
    except Exception as e:
        print(f"❌ Test failed: {e}")

def main():
    """Main setup function"""
    print("🚀 Google Drive Integration Setup")
    print("="*50)
    
    print("\\n1. Creating setup guide...")
    create_google_credentials_guide()
    
    print("\\n2. Setting up environment...")
    setup_environment()
    
    print("\\n3. Opening Google Cloud Console...")
    try:
        webbrowser.open('https://console.cloud.google.com/')
        print("   ✅ Opened in web browser")
    except:
        print("   ⚠️  Please manually visit: https://console.cloud.google.com/")
    
    print("\\n4. Next Steps:")
    print("   📋 Follow GOOGLE_SETUP_GUIDE.md")
    print("   🔐 Download and place google_credentials.json")
    print("   🔑 Update OPENAI_API_KEY in .env file")
    print("   🧪 Run: python setup_google_drive.py --test")
    
    print("\\n" + "="*50)
    print("Your email: hemanth.gajjala88@gmail.com")
    print("Spreadsheet will be automatically shared with this email")

if __name__ == "__main__":
    import sys
    
    if "--test" in sys.argv:
        test_google_integration()
    else:
        main()
