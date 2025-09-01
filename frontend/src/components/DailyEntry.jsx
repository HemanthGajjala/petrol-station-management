import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Save, Calculator, AlertCircle, Droplet } from 'lucide-react';

// Business constants and utilities - embedded directly to avoid import issues
const TANK_CAPACITIES = {
  'HSD': 15000,
  'MS': 15000,
  'XMS': 8000,
  'ATF': 8000
};

// Utility function to calculate tank fill percentage
const calculateTankFillPercentage = (currentLevel, tankName) => {
  const capacity = TANK_CAPACITIES[tankName];
  if (!capacity || !currentLevel) return 0;
  
  const percentage = (currentLevel / capacity) * 100;
  return Math.min(Math.max(percentage, 0), 100); // Clamp between 0-100%
};

// Helper function to get appropriate color class based on fill percentage
const getTankFillColorClass = (percentage) => {
  if (percentage <= 20) return 'text-red-600 bg-red-50';
  if (percentage <= 40) return 'text-orange-600 bg-orange-50';
  if (percentage <= 60) return 'text-yellow-600 bg-yellow-50';
  return 'text-green-600 bg-green-50';
};

const DailyEntry = ({ selectedDate }) => {
  const [formData, setFormData] = useState({
    date: selectedDate,
    shift: 'Day',
    manager: '',
    ms_rate: '',
    ms_quantity: '',
    ms_amount: 0,
    hsd_rate: '',
    hsd_quantity: '',
    hsd_amount: 0,
    power_rate: '',
    power_quantity: '',
    power_amount: 0,
    hsd1_tank: '',
    hsd2_tank: '',
    ms1_tank: '',
    ms2_tank: '',
    power1_tank: '',
    total_outstanding: '',
    hpcl_payment: '',
    cash_collections: '',
    card_collections: '',
    paytm_collections: '',
    hp_transactions: '',
    manager_notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [businessDayInfo, setBusinessDayInfo] = useState(null);

  // Fetch business day information when component mounts
  useEffect(() => {
    const fetchBusinessDayInfo = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/business-day-info');
        const data = await response.json();
        if (data.success) {
          setBusinessDayInfo(data.data);
          // Auto-suggest shift based on current time
          setFormData(prev => ({
            ...prev,
            shift: data.data.suggested_shift
          }));
        }
      } catch (error) {
        console.error('Error fetching business day info:', error);
      }
    };
    
    fetchBusinessDayInfo();
  }, []);

  useEffect(() => {
    setFormData(prev => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      const ms_rate = parseFloat(updated.ms_rate) || 0;
      const ms_quantity = parseFloat(updated.ms_quantity) || 0;
      const hsd_rate = parseFloat(updated.hsd_rate) || 0;
      const hsd_quantity = parseFloat(updated.hsd_quantity) || 0;
      const power_rate = parseFloat(updated.power_rate) || 0;
      const power_quantity = parseFloat(updated.power_quantity) || 0;
      
      updated.ms_amount = ms_rate * ms_quantity;
      updated.hsd_amount = hsd_rate * hsd_quantity;
      updated.power_amount = power_rate * power_quantity;
      
      return updated;
    });
  };

  const calculateTotals = () => {
    const totalFuelSales = (parseFloat(formData.ms_amount) || 0) + (parseFloat(formData.hsd_amount) || 0) + (parseFloat(formData.power_amount) || 0);
    const totalCollections = (parseFloat(formData.cash_collections) || 0) + (parseFloat(formData.card_collections) || 0) + (parseFloat(formData.paytm_collections) || 0) + (parseFloat(formData.hp_transactions) || 0);
    const variance = totalFuelSales - totalCollections;
    
    return { totalFuelSales, totalCollections, variance };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    console.log('Form data before conversion:', formData);

    // Convert all number fields from strings to numbers before sending
    const dataToSend = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => {
            const numericFields = [
                'ms_rate', 'ms_quantity', 'ms_amount', 
                'hsd_rate', 'hsd_quantity', 'hsd_amount', 
                'power_rate', 'power_quantity', 'power_amount',
                'hsd1_tank', 'hsd2_tank', 'ms1_tank', 'ms2_tank', 'power1_tank',
                'total_outstanding', 'hpcl_payment', 'cash_collections', 'card_collections', 
                'paytm_collections', 'hp_transactions'
            ];
            if (numericFields.includes(key)) {
                // Use parseFloat to convert, default to 0 if it's an empty string or invalid
                const numValue = parseFloat(value) || 0;
                return [key, numValue];
            }
            return [key, value];
        })
    );
    
    console.log('Converted data to send:', dataToSend);

    try {
      const response = await fetch('http://localhost:5000/api/daily-consolidation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend), 
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('API response:', result);
      
      if (result.success) {
        setMessage('Daily entry saved successfully!');
        // Add this to check if HPCL credit was saved correctly
        console.log('HPCL credit outstanding saved as:', dataToSend.total_outstanding);
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const { totalFuelSales, totalCollections, variance } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Daily Entry</h2>
        <Badge className="bg-blue-100 text-blue-800">
          {new Date(selectedDate).toLocaleDateString('en-IN')}
        </Badge>
      </div>

      {/* Business Day Information */}
      {businessDayInfo && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Business Day Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-800">
                  <span className="font-medium">Current Business Day:</span> {new Date(businessDayInfo.current_business_day).toLocaleDateString('en-IN')}
                </p>
                <p className="text-blue-700 mt-1">
                  <span className="font-medium">Suggested Shift:</span> {businessDayInfo.suggested_shift} Shift
                </p>
              </div>
              <div>
                <p className="text-blue-700">
                  <span className="font-medium">Business Day Cycle:</span> 8:30 AM to 8:30 AM (next day)
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  All data for the selected date includes both Day Shift (8:30 AM - 8:30 PM) and Night Shift (8:30 PM - 8:30 AM next day)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select
                value={formData.shift}
                onChange={(e) => handleInputChange('shift', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="Day">Day Shift (8:30 AM - 8:30 PM)</option>
                <option value="Night">Night Shift (8:30 PM - 8:30 AM)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => handleInputChange('manager', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Manager name"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Fuel Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Consolidated Fuel Sales Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4 font-medium">Fuel Type</th>
                    <th className="text-left py-2 px-4 font-medium">Rate (₹/Lt.)</th>
                    <th className="text-left py-2 px-4 font-medium">Quantity (Liters)</th>
                    <th className="text-left py-2 px-4 font-medium">Total Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">MS (Petrol)</td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.ms_rate}
                        onChange={(e) => handleInputChange('ms_rate', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.ms_quantity}
                        onChange={(e) => handleInputChange('ms_quantity', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.ms_amount.toFixed(2)}
                        readOnly
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">HSD (Diesel)</td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.hsd_rate}
                        onChange={(e) => handleInputChange('hsd_rate', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.hsd_quantity}
                        onChange={(e) => handleInputChange('hsd_quantity', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.hsd_amount.toFixed(2)}
                        readOnly
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50"
                      />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">POWER (Premium)</td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.power_rate}
                        onChange={(e) => handleInputChange('power_rate', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.power_quantity}
                        onChange={(e) => handleInputChange('power_quantity', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        step="0.01"
                        value={formData.power_amount.toFixed(2)}
                        readOnly
                        className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50"
                      />
                    </td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="py-2 px-4 font-bold">TOTAL FUEL SALES</td>
                    <td className="py-2 px-4"></td>
                    <td className="py-2 px-4"></td>
                    <td className="py-2 px-4 font-bold">₹ {totalFuelSales.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tank Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Droplet className="h-5 w-5 mr-2" />
              Fuel Tank Status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HSD1 Tank <span className="text-xs text-gray-500">(Capacity: {(TANK_CAPACITIES.hsd1_tank/1000).toFixed(1)}KL)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hsd1_tank}
                  onChange={(e) => handleInputChange('hsd1_tank', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Liters"
                />
                {formData.hsd1_tank && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Fill Level</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        getTankFillColorClass(calculateTankFillPercentage(formData.hsd1_tank, 'hsd1_tank'))
                      }`}>
                        {calculateTankFillPercentage(formData.hsd1_tank, 'hsd1_tank').toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={calculateTankFillPercentage(formData.hsd1_tank, 'hsd1_tank')}
                      className={`h-2 ${
                        getTankFillColorClass(calculateTankFillPercentage(formData.hsd1_tank, 'hsd1_tank'))
                      }`}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  HSD2 Tank <span className="text-xs text-gray-500">(Capacity: {(TANK_CAPACITIES.hsd2_tank/1000).toFixed(1)}KL)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hsd2_tank}
                  onChange={(e) => handleInputChange('hsd2_tank', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Liters"
                />
                {formData.hsd2_tank && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Fill Level</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        getTankFillColorClass(calculateTankFillPercentage(formData.hsd2_tank, 'hsd2_tank'))
                      }`}>
                        {calculateTankFillPercentage(formData.hsd2_tank, 'hsd2_tank').toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={calculateTankFillPercentage(formData.hsd2_tank, 'hsd2_tank')}
                      className={`h-2 ${
                        getTankFillColorClass(calculateTankFillPercentage(formData.hsd2_tank, 'hsd2_tank'))
                      }`}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MS1 Tank <span className="text-xs text-gray-500">(Capacity: {(TANK_CAPACITIES.ms1_tank/1000).toFixed(1)}KL)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ms1_tank}
                  onChange={(e) => handleInputChange('ms1_tank', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Liters"
                />
                {formData.ms1_tank && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Fill Level</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        getTankFillColorClass(calculateTankFillPercentage(formData.ms1_tank, 'ms1_tank'))
                      }`}>
                        {calculateTankFillPercentage(formData.ms1_tank, 'ms1_tank').toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={calculateTankFillPercentage(formData.ms1_tank, 'ms1_tank')}
                      className={`h-2 ${
                        getTankFillColorClass(calculateTankFillPercentage(formData.ms1_tank, 'ms1_tank'))
                      }`}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MS2 Tank <span className="text-xs text-gray-500">(Capacity: {(TANK_CAPACITIES.ms2_tank/1000).toFixed(1)}KL)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ms2_tank}
                  onChange={(e) => handleInputChange('ms2_tank', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Liters"
                />
                {formData.ms2_tank && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Fill Level</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        getTankFillColorClass(calculateTankFillPercentage(formData.ms2_tank, 'ms2_tank'))
                      }`}>
                        {calculateTankFillPercentage(formData.ms2_tank, 'ms2_tank').toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={calculateTankFillPercentage(formData.ms2_tank, 'ms2_tank')}
                      className={`h-2 ${
                        getTankFillColorClass(calculateTankFillPercentage(formData.ms2_tank, 'ms2_tank'))
                      }`}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  POWER1 Tank <span className="text-xs text-gray-500">(Capacity: {(TANK_CAPACITIES.power1_tank/1000).toFixed(1)}KL)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.power1_tank}
                  onChange={(e) => handleInputChange('power1_tank', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Liters"
                />
                {formData.power1_tank && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium">Fill Level</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        getTankFillColorClass(calculateTankFillPercentage(formData.power1_tank, 'power1_tank'))
                      }`}>
                        {calculateTankFillPercentage(formData.power1_tank, 'power1_tank').toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={calculateTankFillPercentage(formData.power1_tank, 'power1_tank')}
                      className={`h-2 ${
                        getTankFillColorClass(calculateTankFillPercentage(formData.power1_tank, 'power1_tank'))
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t text-sm text-gray-600">
              <p>Tank capacities: HSD1 (16,000 KL), HSD2 (22,000 KL), MS1 (9,000 KL), MS2 (9,000 KL), POWER1 (9,000 KL)</p>
            </div>
          </CardContent>
        </Card>

        {/* HPCL Credit */}
        <Card>
          <CardHeader>
            <CardTitle>HPCL Credit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Outstanding (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_outstanding}
                  onChange={(e) => handleInputChange('total_outstanding', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Outstanding amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Payment Made to HPCL Today (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hpcl_payment}
                  onChange={(e) => handleInputChange('hpcl_payment', e.target.value)}
                  className="w-full px-3 py-2 border border-custom rounded-md bg-background text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Payment amount"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collections */}
        <Card>
          <CardHeader>
            <CardTitle>Total Collections Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cash Collections (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cash_collections}
                  onChange={(e) => handleInputChange('cash_collections', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Collections (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.card_collections}
                  onChange={(e) => handleInputChange('card_collections', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paytm Collections (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.paytm_collections}
                  onChange={(e) => handleInputChange('paytm_collections', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HP Transactions (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.hp_transactions}
                  onChange={(e) => handleInputChange('hp_transactions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="text-lg font-semibold">Grand Total Collections: ₹ {totalCollections.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Variance Calculation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Variance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-md">
                <div className="text-sm text-gray-600">Fuel Sales Total</div>
                <div className="text-xl font-bold text-green-600">₹ {totalFuelSales.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-md">
                <div className="text-sm text-gray-600">Collections Total</div>
                <div className="text-xl font-bold text-blue-600">₹ {totalCollections.toFixed(2)}</div>
              </div>
              <div className={`p-4 rounded-md ${variance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="text-sm text-gray-600">Variance (Sales - Collections)</div>
                <div className={`text-xl font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹ {variance.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manager Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Manager's Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.manager_notes}
              onChange={(e) => handleInputChange('manager_notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="4"
              placeholder="Add any notes or observations..."
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Daily Entry
              </div>
            )}
          </Button>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}

export default DailyEntry;