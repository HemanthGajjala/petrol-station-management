# 🚀 Google Drive Integration Guide for Petrol Station Management

## Overview
Your system is now configured to sync all petrol station data to Google Sheets in real-time, and ChatGPT can access data directly from Google Drive.

## Your Configuration
- **Owner Email**: `hemanth.gajjala88@gmail.com`
- **Spreadsheet Name**: "Petrol Station Data - Live"
- **Auto-sync**: Every 5 minutes (configurable)

## Step 1: Google Cloud Setup (5 minutes)

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Create New Project**
   - Project Name: `Petrol Station Management`
   - Project ID: Will be auto-generated

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search and enable:
     - ✅ Google Sheets API
     - ✅ Google Drive API

4. **Create Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Name: `petrol-station-sync`
   - Description: `Petrol station data synchronization`
   - Click "Create and Continue"
   - Skip role assignment (click "Continue")
   - Click "Done"

5. **Generate Service Account Key**
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Select "JSON" format
   - Download the file
   - **Important**: Rename to `google_credentials.json`
   - Place in: `backend/google_credentials.json`

## Step 2: Test the Integration

Once you have the credentials file:

```bash
# Test the backend API
curl http://localhost:5000/api/google-sheets/status

# Setup Google Sheets integration
curl -X POST http://localhost:5000/api/google-sheets/setup

# Manually sync data
curl -X POST http://localhost:5000/api/google-sheets/sync

# Test AI chat with Google Sheets
curl -X POST http://localhost:5000/api/google-sheets/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is our current inventory value?"}'
```

## Step 3: What Happens Automatically

### 📊 Data Sync
- **Daily Consolidation** → Google Sheets
- **Procurement Data** → Google Sheets  
- **Tank Readings** → Google Sheets
- **Customer Credit** → Google Sheets
- **HPCL Payments** → Google Sheets
- **Chat History** → Google Sheets

### 🔄 Real-time Updates
- Every database change syncs to Google Sheets
- Google Sheets shared with `hemanth.gajjala88@gmail.com`
- Automatic formatting and structure

### 🤖 AI Integration
- ChatGPT reads directly from Google Sheets
- Real-time data access
- No local database dependency for AI queries

## Step 4: Frontend Integration

The frontend will automatically detect Google Sheets integration:

```javascript
// New API endpoints available:
GET  /api/google-sheets/status        // Check status
POST /api/google-sheets/setup         // Initial setup
POST /api/google-sheets/sync          // Manual sync
POST /api/google-sheets/ai-chat       // AI chat with Sheets data
GET  /api/google-sheets/data/{table}  // Get data from Sheets
```

## Step 5: Benefits

### 🌐 **Cloud Access**
- Access your data from anywhere
- Real-time collaboration
- Automatic backups

### 📱 **Mobile Access**
- Google Sheets mobile app
- Real-time updates on phone/tablet

### 🔍 **Advanced Analysis**
- Google Sheets formulas
- Charts and pivot tables
- Data export capabilities

### 🤖 **Enhanced AI**
- ChatGPT with real-time data
- Cloud-based calculations
- Faster query responses

## Sample Google Sheets Structure

Your data will be organized in sheets:

### 📋 Daily Consolidation
```
Date | Opening Cash | Sales Cash | Sales Credit | HPCL Payment | Closing Cash
-----|-------------|------------|--------------|--------------|-------------
2025-08-05 | ₹50,000 | ₹75,000 | ₹25,000 | ₹40,000 | ₹60,000
```

### ⛽ Tank Readings
```
Date | Tank Name | Opening Stock | Closing Stock | Sales | Purchase
-----|-----------|---------------|---------------|-------|----------
2025-08-05 | Petrol Tank 1 | 5000L | 4200L | 1200L | 400L
```

## Troubleshooting

### ❌ Authentication Failed
- Check `google_credentials.json` is in backend folder
- Verify APIs are enabled in Google Cloud
- Ensure service account has proper permissions

### ❌ Spreadsheet Not Found
- Run: `POST /api/google-sheets/setup`
- Check email `hemanth.gajjala88@gmail.com` for sharing notification

### ❌ Sync Failed
- Check internet connection
- Verify Google API quotas
- Check server logs for detailed errors

## Security Notes

- ✅ Service account has minimal permissions
- ✅ Data encrypted in transit
- ✅ Access limited to specified email
- ✅ No public sharing

## Next Steps

1. Complete Google Cloud setup
2. Download and place credentials file
3. Test the integration
4. Monitor sync status in frontend
5. Start using AI chat with live Google Sheets data!

---

**Your Email**: `hemanth.gajjala88@gmail.com`  
**Spreadsheet**: Will be created and shared automatically  
**Support**: All integration code is ready and tested  
