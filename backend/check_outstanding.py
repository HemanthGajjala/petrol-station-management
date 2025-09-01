import sqlite3

# Connect to database
conn = sqlite3.connect('petrol_station.db')
cursor = conn.cursor()

# Check recent manual outstanding balance entries
cursor.execute('''
    SELECT date, shift, total_outstanding, hpcl_payment 
    FROM daily_consolidation 
    ORDER BY date DESC 
    LIMIT 10
''')

rows = cursor.fetchall()
print("Recent manual HPCL outstanding balance entries:")
print("Date | Shift | Total Outstanding (Manual) | HPCL Payment")
print("-" * 70)

for row in rows:
    date, shift, outstanding, payment = row
    outstanding_display = outstanding if outstanding is not None else "None"
    payment_display = payment if payment is not None else "None"
    print(f"{date} | {shift} | {outstanding_display} | {payment_display}")

conn.close()
