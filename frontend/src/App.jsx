import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DailyEntry from './components/DailyEntry';
import ProcurementEntry from './components/ProcurementEntry';
import Analytics from './components/Analytics';
import AIChat from "./components/AIChat";
import AllDataView from './components/AllDataView';
import HPCLLedger from './components/HPCLLedger';
import CustomerCredit from './components/CustomerCredit';
import BusinessIntelligenceStable from './components/BusinessIntelligenceStable';
import BusinessIntelligenceAdvanced from './components/BusinessIntelligenceAdvanced';

function App() {
  const today = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({
    startDate: today,
    endDate: today,
  });

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prevRange => {
      const newRange = { ...prevRange, [name]: value };
      if (name === 'startDate' && newRange.endDate < newRange.startDate) {
        newRange.endDate = newRange.startDate;
      }
      if (name === 'endDate' && newRange.endDate < newRange.startDate) {
        newRange.startDate = newRange.endDate;
      }
      return newRange;
    });
  };

  return (
    <Router>
      <div className="flex h-screen gradient-bg-1">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-background shadow-sm border-b border-custom p-4">
            {/* Header content with new styling */}
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-primary">Petrol Station Management System</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="start-date" className="text-sm font-medium text-secondary">From:</label>
                  <input
                    id="start-date"
                    name="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    className="px-3 py-2 border border-custom rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="end-date" className="text-sm font-medium text-secondary">To:</label>
                  <input
                    id="end-date"
                    name="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    className="px-3 py-2 border border-custom rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-primary"
                  />
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto gradient-bg-2 p-6">
            <Routes>
              <Route path="/" element={<Dashboard dateRange={dateRange} />} />
              <Route path="/daily-entry" element={<DailyEntry selectedDate={dateRange.endDate} />} />
              <Route path="/procurement" element={<ProcurementEntry selectedDate={dateRange.endDate} />} />
              <Route path="/analytics" element={<Analytics selectedDate={dateRange.endDate} />} />
              <Route path="/business-intelligence" element={<BusinessIntelligenceAdvanced />} />
              <Route path="/business-intelligence-stable" element={<BusinessIntelligenceStable />} />
              <Route path="/all-data" element={<AllDataView />} />
              <Route path="/hpcl-ledger" element={<HPCLLedger />} />
              <Route path="/customer-credit" element={<CustomerCredit />} />
              <Route path="/ai-chat" element={<AIChat />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;