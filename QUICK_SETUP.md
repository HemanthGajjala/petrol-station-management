🚀 **QUICK SETUP - You're Here Now!**

Since you're already in Google Cloud Console with project `gen-lang-client-0911198255`, here's what to do:

## 🔥 **STEP 1: Enable APIs (2 clicks)**

**Click this link to go directly to APIs:**
👉 https://console.cloud.google.com/apis/library?project=gen-lang-client-0911198255

1. Search "Google Sheets API" → Enable
2. Search "Google Drive API" → Enable

## 🔥 **STEP 2: Create Service Account (3 clicks)**

**Click this link to go directly to Credentials:**
👉 https://console.cloud.google.com/apis/credentials?project=gen-lang-client-0911198255

1. Click "CREATE CREDENTIALS" → "Service account"
2. Name: `petrol-station-sync` → CREATE AND CONTINUE → CONTINUE → DONE
3. Click on the service account email → KEYS tab → ADD KEY → Create new key → JSON → CREATE

## 🔥 **STEP 3: Download & Install**

1. **Download** the JSON file
2. **Rename** to `google_credentials.json`
3. **Copy** to: `C:\Users\GHemanthReddy\PMS\New folder (2)\petrol_station_clean\backend\`

## 🔥 **STEP 4: Test**

Open PowerShell:
```
curl -X POST http://localhost:5000/api/google-sheets/setup
```

**That's it!** Your data will automatically sync to Google Sheets and be shared with hemanth.gajjala88@gmail.com

---

**Your backend is already running and waiting for the credentials file!**
