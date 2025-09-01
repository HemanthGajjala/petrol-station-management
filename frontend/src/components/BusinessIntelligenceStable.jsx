import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Safe chart imports with fallbacks
let BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer;
let LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart;

try {
  const recharts = require('recharts');
  ({
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
  } = recharts);
} catch (error) {
  console.warn('Recharts not available, using enhanced tables and progress bars');
}

import { 
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, Fuel, Calendar,
  Brain, Zap, Target, Clock, BarChart3, MessageSquare, Send, Bot,
  Lightbulb, Activity, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Users, Truck, CreditCard, ShoppingCart, Gauge, Award, AlertCircle
} from 'lucide-react';

const BusinessIntelligence = () => {
  const [loading, setLoading] = useState(true);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [businessData, setBusinessData] = useState({
    stockForecast: [],
    salesTrends: [],
    managerPerformance: [],
    cashFlow: [],
    profitAnalysis: [],
    anomalies: [],
    inventoryValue: {},
    quickMetrics: {},
    hourlyPatterns: [],
    customerInsights: [],
    fuelEfficiency: []
  });

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A65', '#81C784'];
  
  useEffect(() => {
    fetchBusinessIntelligence();
    checkChartsAvailability();
  }, []);

  const checkChartsAvailability = () => {
    setChartsLoaded(!!BarChart && !!ResponsiveContainer);
  };

  const fetchBusinessIntelligence = async () => {
    setLoading(true);
    try {
      // Enhanced pre-loaded business intelligence data
      setBusinessData({
        stockForecast: [
          { fuel: 'Petrol (MS)', currentStock: 8500, dailyConsumption: 1200, daysRemaining: 7, status: 'warning', optimalOrder: 15000, lastRefill: '2025-08-01' },
          { fuel: 'Diesel (HSD)', currentStock: 12000, dailyConsumption: 1800, daysRemaining: 6, status: 'critical', optimalOrder: 25000, lastRefill: '2025-07-28' },
          { fuel: 'Power', currentStock: 3500, dailyConsumption: 400, daysRemaining: 8, status: 'good', optimalOrder: 8000, lastRefill: '2025-08-03' }
        ],
        salesTrends: [
          { date: '2025-08-01', petrol: 1150, diesel: 1650, power: 380, total: 3180, revenue: 185000, profit: 12500 },
          { date: '2025-08-02', petrol: 1320, diesel: 1890, power: 420, total: 3630, revenue: 210000, profit: 14200 },
          { date: '2025-08-03', petrol: 980, diesel: 1450, power: 350, total: 2780, revenue: 165000, profit: 11100 },
          { date: '2025-08-04', petrol: 1420, diesel: 2100, power: 480, total: 4000, revenue: 235000, profit: 15800 },
          { date: '2025-08-05', petrol: 1280, diesel: 1750, power: 390, total: 3420, revenue: 198000, profit: 13300 },
          { date: '2025-08-06', petrol: 1380, diesel: 1950, power: 440, total: 3770, revenue: 215000, profit: 14500 },
          { date: '2025-08-07', petrol: 1180, diesel: 1620, power: 370, total: 3170, revenue: 178000, profit: 12000 }
        ],
        managerPerformance: [
          { manager: 'Gangadhar', shifts: 28, avgSales: 185000, variance: 2.3, efficiency: 95, customerRating: 4.8, disputes: 1 },
          { manager: 'Kumar', shifts: 22, avgSales: 168000, variance: 4.1, efficiency: 88, customerRating: 4.5, disputes: 3 },
          { manager: 'Rajesh', shifts: 25, avgSales: 172000, variance: 3.2, efficiency: 91, customerRating: 4.6, disputes: 2 }
        ],
        cashFlow: [
          { date: '2025-08-01', collections: 185000, hpclPayment: 50000, netCash: 135000, creditSales: 12000, expenses: 8000 },
          { date: '2025-08-02', collections: 210000, hpclPayment: 75000, netCash: 135000, creditSales: 15000, expenses: 9500 },
          { date: '2025-08-03', collections: 165000, hpclPayment: 0, netCash: 165000, creditSales: 8000, expenses: 7200 },
          { date: '2025-08-04', collections: 235000, hpclPayment: 100000, netCash: 135000, creditSales: 18000, expenses: 10200 },
          { date: '2025-08-05', collections: 198000, hpclPayment: 60000, netCash: 138000, creditSales: 14000, expenses: 8800 },
          { date: '2025-08-06', collections: 215000, hpclPayment: 80000, netCash: 135000, creditSales: 16000, expenses: 9300 },
          { date: '2025-08-07', collections: 178000, hpclPayment: 45000, netCash: 133000, creditSales: 11000, expenses: 7900 }
        ],
        profitAnalysis: [
          { category: 'Petrol Sales', revenue: 1250000, cost: 1180000, profit: 70000, margin: 5.6, volume: 8900 },
          { category: 'Diesel Sales', revenue: 2100000, cost: 1995000, profit: 105000, margin: 5.0, volume: 12550 },
          { category: 'Power Sales', revenue: 450000, cost: 428000, profit: 22000, margin: 4.9, volume: 2770 }
        ],
        hourlyPatterns: [
          { hour: '06:00', sales: 45, customers: 12 },
          { hour: '08:00', sales: 120, customers: 32 },
          { hour: '10:00', sales: 85, customers: 24 },
          { hour: '12:00', sales: 150, customers: 41 },
          { hour: '14:00', sales: 110, customers: 28 },
          { hour: '16:00', sales: 95, customers: 25 },
          { hour: '18:00', sales: 140, customers: 38 },
          { hour: '20:00', sales: 75, customers: 19 }
        ],
        customerInsights: [
          { type: 'Regular Customers', count: 450, percentage: 65, avgSpend: 2800 },
          { type: 'Fleet Customers', count: 85, percentage: 15, avgSpend: 15000 },
          { type: 'Occasional', count: 120, percentage: 20, avgSpend: 1200 }
        ],
        fuelEfficiency: [
          { fuel: 'Petrol', pumpNumber: 1, efficiency: 98.5, maintenance: 'Good', lastService: '2025-07-15' },
          { fuel: 'Petrol', pumpNumber: 2, efficiency: 97.2, maintenance: 'Fair', lastService: '2025-07-20' },
          { fuel: 'Diesel', pumpNumber: 3, efficiency: 99.1, maintenance: 'Excellent', lastService: '2025-07-18' },
          { fuel: 'Diesel', pumpNumber: 4, efficiency: 96.8, maintenance: 'Needs Service', lastService: '2025-06-25' }
        ],
        anomalies: [
          { date: '2025-08-03', type: 'Low Sales', description: 'Sales 22% below average - Sunday pattern', severity: 'medium', impact: 'Revenue Loss: ₹28,000' },
          { date: '2025-08-05', type: 'High Variance', description: 'Collection variance 5.2% - Credit increase', severity: 'low', impact: 'Cash Flow Delay' },
          { date: '2025-08-06', type: 'Tank Refill', description: 'Optimal refill window for all tanks', severity: 'info', impact: 'Cost Optimization' },
          { date: '2025-08-07', type: 'Pump Issue', description: 'Pump 4 efficiency dropped to 96.8%', severity: 'medium', impact: 'Maintenance Required' }
        ],
        inventoryValue: {
          totalValue: 2850000,
          petrolValue: 1200000,
          dieselValue: 1350000,
          powerValue: 300000,
          trend: 'increasing',
          dailyMovement: 180000
        },
        quickMetrics: {
          weeklyProfit: 197000,
          avgDailySales: 192000,
          bestManager: 'Gangadhar',
          stockDaysLeft: 6,
          varianceTrend: 'improving',
          customerSatisfaction: 4.6,
          pumpEfficiency: 97.9,
          creditRatio: 7.2
        }
      });
      
    } catch (error) {
      console.error('Error fetching business intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatMessage.trim()) return;
    
    const userMessage = chatMessage;
    setChatMessage('');
    
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage, timestamp: new Date() }]);
    
    try {
      const response = await fetch('http://localhost:5000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context: 'business_intelligence' })
      });
      
      const data = await response.json();
      
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: data.response || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date() 
      }]);
      
    } catch (error) {
      console.error('Error sending chat message:', error);
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        message: 'Sorry, I\'m having trouble connecting right now. Please try again.',
        timestamp: new Date() 
      }]);
    }
  };

  const QuickQuestionButton = ({ question, icon: Icon }) => (
    <Button 
      variant="outline" 
      className="justify-start h-auto p-3 text-left" 
      onClick={() => setChatMessage(question)}
    >
      <Icon className="w-4 h-4 mr-2 text-orange-500" />
      <span className="text-sm">{question}</span>
    </Button>
  );

  if (loading) {
    return (
      <div className="container p-6">
        <div className="text-center py-12">
          <Brain className="w-12 h-12 mx-auto mb-4 text-orange-500 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Loading Business Intelligence...</h2>
          <p className="text-gray-600">Analyzing your data and generating insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Business Intelligence Dashboard</h1>
        <p className="text-gray-600">AI-powered insights and analytics for your petrol station</p>
        {!chartsLoaded && (
          <div className="mt-2 p-2 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-700">Charts loading... Showing data tables for now.</p>
          </div>
        )}
      </div>

      {/* Enhanced Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Critical Stock Alert</p>
                <p className="text-2xl font-bold text-red-800">{businessData.quickMetrics.stockDaysLeft} days</p>
                <p className="text-xs text-red-600">Diesel needs refill</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Weekly Profit</p>
                <p className="text-2xl font-bold text-green-800">₹{businessData.quickMetrics.weeklyProfit?.toLocaleString()}</p>
                <p className="text-xs text-green-600">+12% vs last week</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Avg Daily Sales</p>
                <p className="text-2xl font-bold text-blue-800">₹{businessData.quickMetrics.avgDailySales?.toLocaleString()}</p>
                <p className="text-xs text-blue-600">Trending upward</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Customer Rating</p>
                <p className="text-2xl font-bold text-purple-800">{businessData.quickMetrics.customerSatisfaction}⭐</p>
                <p className="text-xs text-purple-600">Excellent service</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Pump Efficiency</p>
                <p className="text-xl font-bold text-orange-800">{businessData.quickMetrics.pumpEfficiency}%</p>
                <Progress value={businessData.quickMetrics.pumpEfficiency} className="w-full mt-2" />
              </div>
              <Gauge className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-700">Credit Ratio</p>
                <p className="text-xl font-bold text-cyan-800">{businessData.quickMetrics.creditRatio}%</p>
                <Progress value={businessData.quickMetrics.creditRatio} className="w-full mt-2" />
              </div>
              <CreditCard className="w-6 h-6 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700">Best Manager</p>
                <p className="text-xl font-bold text-emerald-800">{businessData.quickMetrics.bestManager}</p>
                <Badge className="mt-1 bg-emerald-200 text-emerald-800">95% Efficiency</Badge>
              </div>
              <Users className="w-6 h-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Data Tables & Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Enhanced Stock Depletion Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Fuel className="w-5 h-5 mr-2 text-orange-500" />
                Stock Depletion Forecast & Refill Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartsLoaded && ResponsiveContainer && BarChart ? (
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={businessData.stockForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fuel" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'daysRemaining' ? `${value} days` : `${value}L`,
                        name === 'daysRemaining' ? 'Days Remaining' : 'Daily Consumption'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="daysRemaining" fill="#FF6B6B" name="Days Remaining" />
                    <Line type="monotone" dataKey="dailyConsumption" stroke="#4ECDC4" strokeWidth={2} name="Daily Consumption (L)" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-4">
                  {businessData.stockForecast.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-lg">{item.fuel}</span>
                        <Badge variant={item.status === 'critical' ? 'destructive' : item.status === 'warning' ? 'secondary' : 'default'}>
                          {item.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Days Left</p>
                          <p className="font-bold text-xl">{item.daysRemaining}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Current Stock</p>
                          <p className="font-medium">{item.currentStock}L</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Daily Use</p>
                          <p className="font-medium">{item.dailyConsumption}L</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Optimal Order</p>
                          <p className="font-medium text-green-600">{item.optimalOrder}L</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Stock Level</span>
                          <span>{Math.round((item.daysRemaining / 10) * 100)}%</span>
                        </div>
                        <Progress value={Math.max(10, (item.daysRemaining / 10) * 100)} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Refill Recommendations */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                  <Truck className="w-4 h-4 mr-1" />
                  Smart Refill Recommendations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-red-600">Urgent: Diesel Tank</p>
                    <p className="text-gray-600">Order 25,000L by tomorrow</p>
                    <p className="text-xs text-gray-500">Cost: ₹28,12,500</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-yellow-600">Plan: Petrol Tank</p>
                    <p className="text-gray-600">Order 15,000L in 3 days</p>
                    <p className="text-xs text-gray-500">Cost: ₹21,17,700</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="font-medium text-green-600">Good: Power Tank</p>
                    <p className="text-gray-600">Order 8,000L next week</p>
                    <p className="text-xs text-gray-500">Cost: ₹6,85,680</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Manager Performance with detailed metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-500" />
                Comprehensive Manager Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {businessData.managerPerformance.map((manager, index) => (
                  <div key={index} className="p-6 border rounded-lg bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                          {manager.manager.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{manager.manager}</h4>
                          <p className="text-sm text-gray-600">{manager.shifts} shifts this month</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={manager.efficiency >= 95 ? 'default' : manager.efficiency >= 90 ? 'secondary' : 'destructive'} className="text-lg px-3 py-1">
                          {manager.efficiency}% Efficiency
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">⭐ {manager.customerRating}/5.0</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">₹{(manager.avgSales/1000).toFixed(0)}K</p>
                        <p className="text-xs text-gray-600">Avg Sales</p>
                        <Progress value={(manager.avgSales/200000)*100} className="mt-1" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{manager.variance}%</p>
                        <p className="text-xs text-gray-600">Variance</p>
                        <Progress value={Math.max(0, 100-(manager.variance*20))} className="mt-1" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{manager.customerRating}</p>
                        <p className="text-xs text-gray-600">Rating</p>
                        <Progress value={(manager.customerRating/5)*100} className="mt-1" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{manager.disputes}</p>
                        <p className="text-xs text-gray-600">Disputes</p>
                        <Progress value={Math.max(0, 100-(manager.disputes*25))} className="mt-1" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{manager.efficiency}%</p>
                        <p className="text-xs text-gray-600">Overall</p>
                        <Progress value={manager.efficiency} className="mt-1" />
                      </div>
                    </div>
                    
                    {/* Performance Insights */}
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Insights:</strong> 
                        {manager.efficiency >= 95 && " Excellent performer with consistent sales and high customer satisfaction."}
                        {manager.efficiency >= 90 && manager.efficiency < 95 && " Good performer with room for improvement in consistency."}
                        {manager.efficiency < 90 && " Needs training support and performance improvement plan."}
                        {manager.disputes <= 1 && " Minimal customer complaints."}
                        {manager.variance <= 3 && " Very consistent sales performance."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Sales Trends with Profit Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChartIcon className="w-5 h-5 mr-2 text-blue-500" />
                Sales & Profitability Trends (7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartsLoaded && ResponsiveContainer && ComposedChart ? (
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={businessData.salesTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString('en-IN')}
                      formatter={(value, name) => [
                        name.includes('Revenue') || name.includes('Profit') ? `₹${value.toLocaleString()}` : `${value}L`,
                        name
                      ]}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="petrol" stackId="a" fill="#FF6B6B" name="Petrol (L)" />
                    <Bar yAxisId="left" dataKey="diesel" stackId="a" fill="#4ECDC4" name="Diesel (L)" />
                    <Bar yAxisId="left" dataKey="power" stackId="a" fill="#45B7D1" name="Power (L)" />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#FF8C00" strokeWidth={3} name="Revenue (₹)" />
                    <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#32CD32" strokeWidth={2} name="Profit (₹)" />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3">Date</th>
                        <th className="text-right p-3">Petrol (L)</th>
                        <th className="text-right p-3">Diesel (L)</th>
                        <th className="text-right p-3">Power (L)</th>
                        <th className="text-right p-3">Revenue (₹)</th>
                        <th className="text-right p-3">Profit (₹)</th>
                        <th className="text-right p-3">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {businessData.salesTrends.map((day, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{new Date(day.date).toLocaleDateString()}</td>
                          <td className="text-right p-3">{day.petrol}</td>
                          <td className="text-right p-3">{day.diesel}</td>
                          <td className="text-right p-3">{day.power}</td>
                          <td className="text-right p-3 font-medium text-blue-600">₹{day.revenue.toLocaleString()}</td>
                          <td className="text-right p-3 font-medium text-green-600">₹{day.profit.toLocaleString()}</td>
                          <td className="text-right p-3">
                            <Badge variant={((day.profit/day.revenue)*100) >= 7 ? 'default' : 'secondary'}>
                              {((day.profit/day.revenue)*100).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Trend Analysis */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-2">Revenue Trend</h5>
                  <p className="text-2xl font-bold text-blue-600">+8.2%</p>
                  <p className="text-sm text-blue-600">Week over week growth</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h5 className="font-semibold text-green-800 mb-2">Profit Margin</h5>
                  <p className="text-2xl font-bold text-green-600">6.8%</p>
                  <p className="text-sm text-green-600">Average this week</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h5 className="font-semibold text-purple-800 mb-2">Best Day</h5>
                  <p className="text-2xl font-bold text-purple-600">Aug 4</p>
                  <p className="text-sm text-purple-600">₹2,35,000 revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New: Hourly Sales Pattern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-indigo-500" />
                Peak Hours & Customer Flow Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chartsLoaded && ResponsiveContainer && AreaChart ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={businessData.hourlyPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="sales" stackId="1" stroke="#8884d8" fill="#8884d8" name="Sales Volume" />
                    <Area type="monotone" dataKey="customers" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Customer Count" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {businessData.hourlyPatterns.map((hour, index) => (
                    <div key={index} className="p-3 border rounded-lg text-center">
                      <p className="font-medium">{hour.hour}</p>
                      <p className="text-lg font-bold text-indigo-600">{hour.sales}L</p>
                      <p className="text-sm text-gray-600">{hour.customers} customers</p>
                      <Progress value={(hour.sales/150)*100} className="mt-2" />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                <p className="text-sm text-indigo-800">
                  <strong>Peak Hours:</strong> 12:00 PM (150L) and 6:00 PM (140L) show highest sales volumes. 
                  Consider optimizing staff allocation during these periods.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* New: Customer Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-pink-500" />
                Customer Segmentation & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {businessData.customerInsights.map((segment, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-white to-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{segment.type}</h4>
                      <Badge style={{backgroundColor: COLORS[index % COLORS.length]}} className="text-white">
                        {segment.percentage}%
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Count:</span>
                        <span className="font-medium">{segment.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Spend:</span>
                        <span className="font-medium text-green-600">₹{segment.avgSpend}</span>
                      </div>
                      <Progress value={segment.percentage} className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-pink-50 rounded-lg">
                <h5 className="font-semibold text-pink-800 mb-2">Customer Strategy Recommendations</h5>
                <ul className="text-sm text-pink-700 space-y-1">
                  <li>• Focus on retaining Fleet Customers (15% but high value: ₹15,000 avg)</li>
                  <li>• Implement loyalty program for Regular Customers (65% of base)</li>
                  <li>• Convert Occasional customers with targeted promotions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Chat & Quick Actions */}
        <div className="space-y-6">
          
          {/* AI Business Chat */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="w-5 h-5 mr-2 text-orange-500" />
                AI Business Advisor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[400px]">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Ask me anything about your business!</p>
                    <p className="text-sm">Try the quick questions below</p>
                  </div>
                ) : (
                  chatHistory.map((chat, index) => (
                    <div key={index} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        chat.type === 'user' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{chat.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {chat.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about your business..."
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                  className="flex-1"
                />
                <Button onClick={handleChatSend} className="bg-orange-500 hover:bg-orange-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Quick Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickQuestionButton 
                question="How much profit did I make this week?" 
                icon={DollarSign} 
              />
              <QuickQuestionButton 
                question="Should I buy more diesel now?" 
                icon={Fuel} 
              />
              <QuickQuestionButton 
                question="Which manager performs better?" 
                icon={Target} 
              />
              <QuickQuestionButton 
                question="What's my average daily sales?" 
                icon={BarChart3} 
              />
              <QuickQuestionButton 
                question="How long will my current stock last?" 
                icon={Clock} 
              />
              <QuickQuestionButton 
                question="Show me my variance trends" 
                icon={Activity} 
              />
            </CardContent>
          </Card>

          {/* Enhanced Inventory Value with Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-purple-500" />
                Inventory Value & Movement Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className="text-4xl font-bold text-purple-800">
                  ₹{businessData.inventoryValue.totalValue?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Stock Value</p>
                <Badge className="mt-2 bg-green-100 text-green-800">
                  {businessData.inventoryValue.trend} ↗
                </Badge>
              </div>
              
              {chartsLoaded && ResponsiveContainer && PieChart ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Petrol', value: businessData.inventoryValue.petrolValue, percentage: 42.1 },
                        { name: 'Diesel', value: businessData.inventoryValue.dieselValue, percentage: 47.4 },
                        { name: 'Power', value: businessData.inventoryValue.powerValue, percentage: 10.5 }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="space-y-3">
                  {[
                    { name: 'Petrol', value: businessData.inventoryValue.petrolValue, color: '#FF6B6B', percentage: 42.1 },
                    { name: 'Diesel', value: businessData.inventoryValue.dieselValue, color: '#4ECDC4', percentage: 47.4 },
                    { name: 'Power', value: businessData.inventoryValue.powerValue, color: '#45B7D1', percentage: 10.5 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded mr-3" style={{backgroundColor: item.color}}></div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{item.value?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-purple-600">₹{businessData.inventoryValue.dailyMovement?.toLocaleString()}</p>
                    <p className="text-sm text-purple-700">Daily Movement</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">15.8 days</p>
                    <p className="text-sm text-purple-700">Avg Turnover</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New: Pump Efficiency Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-teal-500" />
                Pump Efficiency & Maintenance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {businessData.fuelEfficiency.map((pump, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-white to-teal-50">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h4 className="font-semibold">{pump.fuel} - Pump {pump.pumpNumber}</h4>
                        <p className="text-sm text-gray-600">Last Service: {pump.lastService}</p>
                      </div>
                      <Badge 
                        variant={pump.efficiency >= 98 ? 'default' : pump.efficiency >= 95 ? 'secondary' : 'destructive'}
                        className="text-lg px-3 py-1"
                      >
                        {pump.efficiency}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Efficiency</span>
                          <span>{pump.efficiency}%</span>
                        </div>
                        <Progress value={pump.efficiency} className="h-3" />
                      </div>
                      
                      <div className="flex justify-between items-center p-2 bg-white rounded">
                        <span className="text-sm">Status:</span>
                        <Badge variant={
                          pump.maintenance === 'Excellent' ? 'default' :
                          pump.maintenance === 'Good' ? 'secondary' :
                          pump.maintenance === 'Fair' ? 'outline' : 'destructive'
                        }>
                          {pump.maintenance}
                        </Badge>
                      </div>
                      
                      {pump.maintenance === 'Needs Service' && (
                        <div className="p-2 bg-red-100 rounded text-sm text-red-700">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Schedule maintenance within 3 days
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-teal-50 rounded-lg">
                <h5 className="font-semibold text-teal-800 mb-2">Maintenance Recommendations</h5>
                <ul className="text-sm text-teal-700 space-y-1">
                  <li>• Pump 4 (Diesel): Immediate attention required - efficiency below 97%</li>
                  <li>• Pump 2 (Petrol): Schedule preventive maintenance next week</li>
                  <li>• Overall fleet efficiency: 97.9% - Above industry standard</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligence;
