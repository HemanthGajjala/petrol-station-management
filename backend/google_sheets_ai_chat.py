#!/usr/bin/env python3
"""
Google Sheets AI Chat Integration
This module provides ChatGPT with access to data stored in Google Sheets
"""

import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

# Import the Google Drive integration
from google_drive_integration import GoogleSheetsDataProvider

# OpenAI imports
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GoogleSheetsAIChat:
    """
    AI Chat system that uses Google Sheets as the data source
    """
    
    def __init__(self, openai_api_key: str, credentials_path: str = None, 
                 spreadsheet_name: str = "Petrol Station Data", owner_email: str = "hemanth.gajjala88@gmail.com"):
        self.openai_api_key = openai_api_key
        self.owner_email = owner_email
        self.data_provider = GoogleSheetsDataProvider(credentials_path, spreadsheet_name)
        
        # Initialize OpenAI
        if OPENAI_AVAILABLE:
            openai.api_key = openai_api_key
        
        # System prompt for Google Sheets context
        self.system_prompt = """
You are an AI assistant for a petrol station management system. You have access to real-time data 
stored in Google Sheets that includes:

1. Daily Consolidation: Daily sales, expenses, and financial summary
2. Procurement Data: Fuel purchases and inventory management
3. Customer Credit: Customer receivables and credit transactions
4. HPCL Payments: Payments made to HPCL (fuel supplier)
5. Tank Readings: Current fuel levels in storage tanks
6. Chat History: Previous conversations

When answering questions:
- Always reference that data is from Google Sheets (cloud-based, real-time)
- Provide specific numbers and calculations when possible
- Explain business insights and trends
- Suggest actionable recommendations
- If asked about inventory value, calculate based on latest tank readings and procurement rates

Current data source: Google Sheets (automatically synced from database)
"""
    
    def get_contextual_data(self, user_message: str) -> Dict[str, Any]:
        """Get relevant data from Google Sheets based on user query"""
        context = {
            'timestamp': datetime.now().isoformat(),
            'data_source': 'Google Sheets',
            'spreadsheet_url': self.data_provider.sync_client.get_sheet_url()
        }
        
        # Analyze user message to determine what data to fetch
        message_lower = user_message.lower()
        
        # Always include business summary
        context['business_summary'] = self.data_provider.get_business_summary()
        
        # Fetch specific data based on keywords
        if any(word in message_lower for word in ['inventory', 'stock', 'tank', 'fuel level']):
            context['inventory_data'] = self.data_provider.get_inventory_summary()
            context['tank_readings'] = self.data_provider.query_google_sheets('tank_reading')[-5:]  # Last 5 readings
        
        if any(word in message_lower for word in ['sales', 'revenue', 'daily', 'consolidation']):
            context['daily_data'] = self.data_provider.query_google_sheets('daily_consolidation')[-10:]  # Last 10 days
        
        if any(word in message_lower for word in ['procurement', 'purchase', 'supplier']):
            context['procurement_data'] = self.data_provider.query_google_sheets('procurement_data')[-10:]  # Last 10 procurements
        
        if any(word in message_lower for word in ['credit', 'customer', 'receivable']):
            context['customer_credit'] = self.data_provider.query_google_sheets('customer_credit')[-20:]  # Last 20 transactions
        
        if any(word in message_lower for word in ['hpcl', 'payment', 'supplier payment']):
            context['hpcl_payments'] = self.data_provider.query_google_sheets('hpcl_payments')[-10:]  # Last 10 payments
        
        return context
    
    def calculate_inventory_value(self) -> Dict[str, Any]:
        """Calculate current inventory cash value from Google Sheets data"""
        try:
            # Get latest tank readings
            tank_data = self.data_provider.query_google_sheets('tank_reading')
            latest_tank = tank_data[-1] if tank_data else None
            
            # Get recent procurement data for pricing
            procurement_data = self.data_provider.query_google_sheets('procurement_data')
            
            if not latest_tank or not procurement_data:
                return {"error": "Insufficient data for inventory calculation"}
            
            # Calculate average rates from recent procurements
            recent_procurements = procurement_data[-10:]  # Last 10 procurements
            
            diesel_rates = [float(p.get('rate_per_litre', 0)) for p in recent_procurements 
                          if p.get('fuel_type', '').lower() == 'diesel']
            petrol_rates = [float(p.get('rate_per_litre', 0)) for p in recent_procurements 
                          if p.get('fuel_type', '').lower() == 'petrol']
            
            avg_diesel_rate = sum(diesel_rates) / len(diesel_rates) if diesel_rates else 0
            avg_petrol_rate = sum(petrol_rates) / len(petrol_rates) if petrol_rates else 0
            
            # Get current fuel levels
            diesel_level = float(latest_tank.get('diesel_level', 0))
            petrol_level = float(latest_tank.get('petrol_level', 0))
            
            # Calculate values
            diesel_value = diesel_level * avg_diesel_rate
            petrol_value = petrol_level * avg_petrol_rate
            total_value = diesel_value + petrol_value
            
            return {
                'data_source': 'Google Sheets',
                'calculation_timestamp': datetime.now().isoformat(),
                'tank_reading_date': latest_tank.get('date', 'Unknown'),
                'diesel': {
                    'level_litres': diesel_level,
                    'avg_rate_per_litre': avg_diesel_rate,
                    'total_value': diesel_value
                },
                'petrol': {
                    'level_litres': petrol_level,
                    'avg_rate_per_litre': avg_petrol_rate,
                    'total_value': petrol_value
                },
                'total_inventory_value': total_value,
                'currency': 'INR'
            }
            
        except Exception as e:
            logger.error(f"Error calculating inventory value: {e}")
            return {"error": f"Calculation failed: {str(e)}"}
    
    def chat(self, user_message: str) -> Dict[str, Any]:
        """Process chat message using Google Sheets data"""
        try:
            # Get contextual data from Google Sheets
            context_data = self.get_contextual_data(user_message)
            
            # Special handling for inventory value questions
            if any(phrase in user_message.lower() for phrase in 
                   ['inventory value', 'stock value', 'cash value', 'current inventory']):
                inventory_calc = self.calculate_inventory_value()
                context_data['inventory_calculation'] = inventory_calc
            
            # Prepare context for AI
            context_summary = f"""
Current Data from Google Sheets:
- Spreadsheet URL: {context_data.get('spreadsheet_url', 'N/A')}
- Last Updated: {context_data.get('timestamp')}

Business Summary: {json.dumps(context_data.get('business_summary', {}), indent=2)}

Available Data:
{json.dumps({k: v for k, v in context_data.items() 
            if k not in ['business_summary', 'timestamp', 'spreadsheet_url']}, 
           indent=2, default=str)}
"""
            
            # Create AI prompt
            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "system", "content": f"Current Data Context:\n{context_summary}"},
                {"role": "user", "content": user_message}
            ]
            
            # Call OpenAI API
            if OPENAI_AVAILABLE:
                try:
                    # Try newer OpenAI client
                    client = openai.OpenAI(api_key=self.openai_api_key)
                    response = client.chat.completions.create(
                        model="gpt-4",
                        messages=messages,
                        max_tokens=1500,
                        temperature=0.7
                    )
                    ai_response = response.choices[0].message.content
                    
                except (ImportError, AttributeError):
                    # Fall back to legacy OpenAI client
                    response = openai.ChatCompletion.create(
                        model="gpt-4",
                        messages=messages,
                        max_tokens=1500,
                        temperature=0.7
                    )
                    ai_response = response.choices[0].message.content
                
                return {
                    'success': True,
                    'response': ai_response,
                    'data_source': 'Google Sheets',
                    'spreadsheet_url': context_data.get('spreadsheet_url'),
                    'timestamp': datetime.now().isoformat(),
                    'context_data_summary': {
                        'tables_accessed': [k for k in context_data.keys() 
                                          if k.endswith('_data') or k == 'inventory_calculation'],
                        'record_counts': {k: len(v) if isinstance(v, list) else 1 
                                        for k, v in context_data.items() 
                                        if isinstance(v, (list, dict))}
                    }
                }
            else:
                return {
                    'success': False,
                    'error': 'OpenAI not available',
                    'mock_response': f"Based on Google Sheets data: {user_message}",
                    'data_source': 'Google Sheets',
                    'spreadsheet_url': context_data.get('spreadsheet_url')
                }
                
        except Exception as e:
            logger.error(f"Error in Google Sheets AI chat: {e}")
            return {
                'success': False,
                'error': str(e),
                'data_source': 'Google Sheets (Error)'
            }

def test_google_sheets_ai():
    """Test function for Google Sheets AI integration"""
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    openai_api_key = os.getenv('OPENAI_API_KEY')
    if not openai_api_key:
        print("OPENAI_API_KEY not found in environment")
        return
    
    # Initialize AI chat with Google Sheets
    ai_chat = GoogleSheetsAIChat(openai_api_key)
    
    # Test questions
    test_questions = [
        "How much money is currently sitting in stock (cash value of current inventory)?",
        "What were the sales figures for the last 5 days?",
        "Show me the latest customer credit transactions",
        "What is the current fuel level in our tanks?",
        "Give me a business summary based on recent data"
    ]
    
    for question in test_questions:
        print(f"\n🤖 Question: {question}")
        response = ai_chat.chat(question)
        
        if response.get('success'):
            print(f"✅ Response: {response['response']}")
            print(f"📊 Data Source: {response['data_source']}")
            print(f"🔗 Spreadsheet: {response.get('spreadsheet_url', 'N/A')}")
        else:
            print(f"❌ Error: {response.get('error', 'Unknown error')}")

if __name__ == "__main__":
    test_google_sheets_ai()
