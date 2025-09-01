#!/usr/bin/env python3
"""
Google Drive Integration for Petrol Station Management System
This module handles real-time synchronization of SQLite data to Google Sheets
and provides ChatGPT access to data stored in Google Drive.
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import pandas as pd

# Google APIs
try:
    import gspread
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    GOOGLE_APIS_AVAILABLE = True
except ImportError as e:
    GOOGLE_APIS_AVAILABLE = False
    print(f"Google APIs not available: {e}")

# Database imports
from sqlalchemy import create_engine, text
import sqlite3

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleDriveDBSync:
    """
    Handles synchronization between SQLite database and Google Sheets
    """
    
    def __init__(self, credentials_path: str = None, spreadsheet_name: str = "Petrol Station Data", owner_email: str = "hemanth.gajjala88@gmail.com"):
        self.credentials_path = credentials_path or "google_credentials.json"
        self.spreadsheet_name = spreadsheet_name
        self.owner_email = owner_email
        self.gc = None
        self.spreadsheet = None
        self.spreadsheet_url = None
        self.db_path = "petrol_station.db"
        
        # Google Sheets scope
        self.scope = [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file'
        ]
        
        # Table mapping for Google Sheets
        self.table_sheets = {
            'daily_consolidation': 'Daily Consolidation',
            'procurement_data': 'Procurement Data', 
            'customer_credit': 'Customer Credit',
            'hpcl_payments': 'HPCL Payments',
            'tank_reading': 'Tank Readings',
            'chat_history': 'Chat History'
        }
        
        self.initialize_google_client()
    
    def initialize_google_client(self):
        """Initialize Google Sheets client"""
        try:
            if not os.path.exists(self.credentials_path):
                logger.error(f"Google credentials file not found: {self.credentials_path}")
                return False
                
            # Authenticate with Google Sheets
            creds = Credentials.from_service_account_file(
                self.credentials_path, scopes=self.scope
            )
            self.gc = gspread.authorize(creds)
            
            # Try to open existing spreadsheet or create new one
            try:
                self.spreadsheet = self.gc.open(self.spreadsheet_name)
                logger.info(f"Connected to existing spreadsheet: {self.spreadsheet_name}")
            except gspread.SpreadsheetNotFound:
                self.spreadsheet = self.gc.create(self.spreadsheet_name)
                logger.info(f"Created new spreadsheet: {self.spreadsheet_name}")
                
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Google client: {e}")
            return False
    
    def get_table_data(self, table_name: str) -> pd.DataFrame:
        """Get data from SQLite table"""
        try:
            engine = create_engine(f'sqlite:///{self.db_path}')
            query = f"SELECT * FROM {table_name}"
            df = pd.read_sql_query(query, engine)
            return df
        except Exception as e:
            logger.error(f"Error reading table {table_name}: {e}")
            return pd.DataFrame()
    
    def sync_table_to_sheet(self, table_name: str, force_update: bool = False):
        """Sync a specific table to Google Sheets"""
        try:
            if not self.spreadsheet:
                logger.error("Google Sheets not initialized")
                return False
                
            # Get data from SQLite
            df = self.get_table_data(table_name)
            if df.empty:
                logger.warning(f"No data found in table: {table_name}")
                return True
            
            sheet_name = self.table_sheets.get(table_name, table_name.title())
            
            # Try to get existing worksheet or create new one
            try:
                worksheet = self.spreadsheet.worksheet(sheet_name)
                if force_update:
                    worksheet.clear()
            except gspread.WorksheetNotFound:
                worksheet = self.spreadsheet.add_worksheet(
                    title=sheet_name, 
                    rows=len(df) + 10, 
                    cols=len(df.columns) + 2
                )
            
            # Convert DataFrame to list format for Google Sheets
            # Handle datetime and date columns
            df_copy = df.copy()
            for col in df_copy.columns:
                if df_copy[col].dtype == 'object':
                    # Try to identify datetime columns
                    try:
                        pd.to_datetime(df_copy[col])
                        df_copy[col] = df_copy[col].astype(str)
                    except:
                        df_copy[col] = df_copy[col].astype(str)
                elif 'datetime' in str(df_copy[col].dtype):
                    df_copy[col] = df_copy[col].astype(str)
            
            # Prepare data for upload
            headers = df_copy.columns.tolist()
            data = [headers] + df_copy.fillna('').values.tolist()
            
            # Update the worksheet
            worksheet.update('A1', data)
            
            # Add metadata
            metadata_row = len(df) + 3
            worksheet.update(f'A{metadata_row}', [
                ['Last Updated:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
                ['Record Count:', len(df)],
                ['Table Name:', table_name]
            ])
            
            logger.info(f"Successfully synced {table_name} to Google Sheets ({len(df)} records)")
            return True
            
        except Exception as e:
            logger.error(f"Error syncing table {table_name}: {e}")
            return False
    
    def sync_all_tables(self, force_update: bool = False):
        """Sync all database tables to Google Sheets"""
        results = {}
        
        for table_name in self.table_sheets.keys():
            logger.info(f"Syncing table: {table_name}")
            results[table_name] = self.sync_table_to_sheet(table_name, force_update)
        
        success_count = sum(1 for success in results.values() if success)
        logger.info(f"Sync completed: {success_count}/{len(results)} tables successful")
        
        return results
    
    def get_sheet_url(self) -> str:
        """Get the Google Sheets URL"""
        if self.spreadsheet:
            return f"https://docs.google.com/spreadsheets/d/{self.spreadsheet.id}"
        return None
    
    def setup_automatic_sync(self, interval_minutes: int = 15):
        """Setup automatic synchronization (this would need a scheduler in production)"""
        logger.info(f"Automatic sync configured for every {interval_minutes} minutes")
        # In production, you'd use APScheduler or similar
        return {
            'interval_minutes': interval_minutes,
            'next_sync': datetime.now() + timedelta(minutes=interval_minutes)
        }

class GoogleSheetsDataProvider:
    """
    Provides data access from Google Sheets for ChatGPT/AI systems
    """
    
    def __init__(self, credentials_path: str = None, spreadsheet_name: str = "Petrol Station Data"):
        self.sync_client = GoogleDriveDBSync(credentials_path, spreadsheet_name)
        
    def get_business_summary(self) -> Dict[str, Any]:
        """Get comprehensive business summary from Google Sheets"""
        try:
            summary = {
                'timestamp': datetime.now().isoformat(),
                'data_source': 'Google Sheets',
                'spreadsheet_url': self.sync_client.get_sheet_url()
            }
            
            # Get data from each sheet
            if self.sync_client.spreadsheet:
                for table_name, sheet_name in self.sync_client.table_sheets.items():
                    try:
                        worksheet = self.sync_client.spreadsheet.worksheet(sheet_name)
                        data = worksheet.get_all_records()
                        
                        if data:
                            summary[f'{table_name}_count'] = len(data)
                            summary[f'{table_name}_latest'] = data[-1] if data else None
                        
                    except Exception as e:
                        logger.warning(f"Could not read {sheet_name}: {e}")
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting business summary: {e}")
            return {'error': str(e)}
    
    def query_google_sheets(self, table_name: str, filters: Dict = None) -> List[Dict]:
        """Query specific data from Google Sheets"""
        try:
            sheet_name = self.sync_client.table_sheets.get(table_name, table_name.title())
            worksheet = self.sync_client.spreadsheet.worksheet(sheet_name)
            data = worksheet.get_all_records()
            
            # Apply basic filters if provided
            if filters and data:
                filtered_data = []
                for record in data:
                    match = True
                    for key, value in filters.items():
                        if key in record and str(record[key]) != str(value):
                            match = False
                            break
                    if match:
                        filtered_data.append(record)
                return filtered_data
            
            return data
            
        except Exception as e:
            logger.error(f"Error querying {table_name}: {e}")
            return []
    
    def get_inventory_summary(self) -> Dict[str, Any]:
        """Get current inventory summary from Google Sheets"""
        try:
            # Get latest tank readings
            tank_data = self.query_google_sheets('tank_reading')
            
            # Get procurement data
            procurement_data = self.query_google_sheets('procurement_data')
            
            # Calculate inventory summary
            summary = {
                'last_tank_reading': tank_data[-1] if tank_data else None,
                'total_procurement_records': len(procurement_data),
                'estimated_inventory_value': 0
            }
            
            # Calculate estimated inventory value
            if tank_data and procurement_data:
                latest_reading = tank_data[-1]
                recent_procurement = [p for p in procurement_data if p.get('date')]
                
                if recent_procurement:
                    avg_rate = sum(float(p.get('rate_per_litre', 0)) for p in recent_procurement[-10:]) / min(10, len(recent_procurement))
                    total_litres = float(latest_reading.get('diesel_level', 0)) + float(latest_reading.get('petrol_level', 0))
                    summary['estimated_inventory_value'] = total_litres * avg_rate
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting inventory summary: {e}")
            return {'error': str(e)}

def setup_google_drive_integration():
    """Setup function to initialize Google Drive integration"""
    
    # Check if credentials exist
    credentials_path = "google_credentials.json"
    
    if not os.path.exists(credentials_path):
        logger.warning(f"Google credentials not found at {credentials_path}")
        logger.info("Please follow these steps to setup Google Drive integration:")
        logger.info("1. Go to Google Cloud Console (console.cloud.google.com)")
        logger.info("2. Create a new project or select existing one")
        logger.info("3. Enable Google Sheets API and Google Drive API")
        logger.info("4. Create a Service Account")
        logger.info("5. Download the JSON credentials file")
        logger.info("6. Rename it to 'google_credentials.json' and place in backend folder")
        
        # Create a template credentials file
        template = {
            "type": "service_account",
            "project_id": "your-project-id",
            "private_key_id": "your-private-key-id",
            "private_key": "-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n",
            "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
            "client_id": "your-client-id",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com"
        }
        
        with open("google_credentials_template.json", "w") as f:
            json.dump(template, f, indent=2)
        
        logger.info("Created google_credentials_template.json - please fill in your actual credentials")
        return None
    
    # Initialize the sync client
    sync_client = GoogleDriveDBSync(credentials_path)
    
    if sync_client.gc:
        logger.info("Google Drive integration initialized successfully!")
        logger.info(f"Spreadsheet URL: {sync_client.get_sheet_url()}")
        return sync_client
    else:
        logger.error("Failed to initialize Google Drive integration")
        return None

if __name__ == "__main__":
    # Test the Google Drive integration
    sync_client = setup_google_drive_integration()
    
    if sync_client:
        # Perform initial sync
        logger.info("Starting initial data sync...")
        results = sync_client.sync_all_tables(force_update=True)
        logger.info(f"Sync results: {results}")
        
        # Test data provider
        data_provider = GoogleSheetsDataProvider()
        summary = data_provider.get_business_summary()
        logger.info(f"Business summary: {summary}")
