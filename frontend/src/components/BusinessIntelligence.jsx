import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, Fuel, Calendar,
  Brain, Zap, Target, Clock, BarChart3, MessageSquare, Send, Bot,
  Lightbulb, Activity, PieChart as PieChartIcon, LineChart as LineChartIcon
} from 'lucide-react';

const BusinessIntelligence = () => {
  const [loading, setLoading] = useState(true);
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
    quickMetrics: {}
  });

  // Color schemes for charts
  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  
  useEffect(() => {
    fetchBusinessIntelligence();
  }, []);

  const fetchBusinessIntelligence = async () => {
    setLoading(true);
    try {
      // Simulate API calls - replace with actual endpoints
      const [
        stockResponse,
        salesResponse, 
        managerResponse,
        cashResponse
      ] = await Promise.all([
        fetch('http://localhost:5000/api/analytics/stock-forecast'),
        fetch('http://localhost:5000/api/analytics/sales-trends'),
        fetch('http://localhost:5000/api/analytics/manager-performance'),
        fetch('http://localhost:5000/api/analytics/cash-flow')
      ]);

      // Mock data for demo - replace with actual API responses
      setBusinessData({
        stockForecast: [
          { fuel: 'Petrol (MS)', currentStock: 8500, dailyConsumption: 1200, daysRemaining: 7, status: 'warning' },
          { fuel: 'Diesel (HSD)', currentStock: 12000, dailyConsumption: 1800, daysRemaining: 6, status: 'critical' },
          { fuel: 'Power', currentStock: 3500, dailyConsumption: 400, daysRemaining: 8, status: 'good' }
        ],
        salesTrends: [
          { date: '2025-08-01', petrol: 1150, diesel: 1650, power: 380, total: 3180 },
          { date: '2025-08-02', petrol: 1320, diesel: 1890, power: 420, total: 3630 },
          { date: '2025-08-03', petrol: 980, diesel: 1450, power: 350, total: 2780 },
          { date: '2025-08-04', petrol: 1420, diesel: 2100, power: 480, total: 4000 },
          { date: '2025-08-05', petrol: 1280, diesel: 1750, power: 390, total: 3420 },
          { date: '2025-08-06', petrol: 1380, diesel: 1950, power: 440, total: 3770 },
          { date: '2025-08-07', petrol: 1180, diesel: 1620, power: 370, total: 3170 }
        ],
        managerPerformance: [
          { manager: 'Gangadhar', shifts: 28, avgSales: 185000, variance: 2.3, efficiency: 95 },
          { manager: 'Kumar', shifts: 22, avgSales: 168000, variance: 4.1, efficiency: 88 },
          { manager: 'Rajesh', shifts: 25, avgSales: 172000, variance: 3.2, efficiency: 91 }
        ],
        cashFlow: [
          { date: '2025-08-01', collections: 185000, hpclPayment: 50000, netCash: 135000 },
          { date: '2025-08-02', collections: 210000, hpclPayment: 75000, netCash: 135000 },
          { date: '2025-08-03', collections: 165000, hpclPayment: 0, netCash: 165000 },
          { date: '2025-08-04', collections: 235000, hpclPayment: 100000, netCash: 135000 },
          { date: '2025-08-05', collections: 198000, hpclPayment: 60000, netCash: 138000 },
          { date: '2025-08-06', collections: 215000, hpclPayment: 80000, netCash: 135000 },
          { date: '2025-08-07', collections: 178000, hpclPayment: 45000, netCash: 133000 }
        ],
        profitAnalysis: [
          { category: 'Petrol Sales', revenue: 1250000, cost: 1180000, profit: 70000, margin: 5.6 },
          { category: 'Diesel Sales', revenue: 2100000, cost: 1995000, profit: 105000, margin: 5.0 },
          { category: 'Power Sales', revenue: 450000, cost: 428000, profit: 22000, margin: 4.9 }
        ],
        anomalies: [
          { date: '2025-08-03', type: 'Low Sales', description: 'Sales 22% below average', severity: 'medium' },
          { date: '2025-08-05', type: 'High Variance', description: 'Collection variance 5.2%', severity: 'low' },
          { date: '2025-08-06', type: 'Tank Refill', description: 'Optimal refill window', severity: 'info' }
        ],
        inventoryValue: {
          totalValue: 2850000,
          petrolValue: 1200000,
          dieselValue: 1350000,
          powerValue: 300000
        },
        quickMetrics: {
          weeklyProfit: 197000,
          avgDailySales: 192000,
          bestManager: 'Gangadhar',
          stockDaysLeft: 6,
          varianceTrend: 'improving'
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
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage, timestamp: new Date() }]);
    
    try {
      // Send to AI chat endpoint
      const response = await fetch('http://localhost:5000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context: 'business_intelligence' })
      });
      
      const data = await response.json();
      
      // Add AI response to chat
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
      </div>

      {/* Quick Access Cards */}
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
                <p className="text-sm text-purple-700">Best Manager</p>
                <p className="text-2xl font-bold text-purple-800">{businessData.quickMetrics.bestManager}</p>
                <p className="text-xs text-purple-600">95% efficiency</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stock Depletion Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Fuel className="w-5 h-5 mr-2 text-orange-500" />
                Stock Depletion Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={businessData.stockForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fuel" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="daysRemaining" fill="#FF6B6B" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {businessData.stockForecast.map((item, index) => (
                  <div key={index} className="text-center">
                    <Badge variant={item.status === 'critical' ? 'destructive' : item.status === 'warning' ? 'secondary' : 'default'}>
                      {item.fuel}: {item.daysRemaining} days
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sales Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChartIcon className="w-5 h-5 mr-2 text-blue-500" />
                Daily Sales Trends (7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={businessData.salesTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="petrol" stackId="a" fill="#FF6B6B" name="Petrol (L)" />
                  <Bar dataKey="diesel" stackId="a" fill="#4ECDC4" name="Diesel (L)" />
                  <Bar dataKey="power" stackId="a" fill="#45B7D1" name="Power (L)" />
                  <Line type="monotone" dataKey="total" stroke="#FF8C00" strokeWidth={3} name="Total Sales" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Manager Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-500" />
                Manager Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessData.managerPerformance.map((manager, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{manager.manager}</h4>
                      <Badge variant={manager.efficiency >= 95 ? 'default' : manager.efficiency >= 90 ? 'secondary' : 'destructive'}>
                        {manager.efficiency}% Efficiency
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Shifts</p>
                        <p className="font-medium">{manager.shifts}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Sales</p>
                        <p className="font-medium">₹{manager.avgSales.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Variance</p>
                        <p className="font-medium">{manager.variance}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                Cash Flow & HPCL Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={businessData.cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="collections" stackId="1" stroke="#4ECDC4" fill="#4ECDC4" name="Collections" />
                  <Area type="monotone" dataKey="hpclPayment" stackId="2" stroke="#FF6B6B" fill="#FF6B6B" name="HPCL Payments" />
                  <Line type="monotone" dataKey="netCash" stroke="#45B7D1" strokeWidth={2} name="Net Cash" />
                </AreaChart>
              </ResponsiveContainer>
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

          {/* Inventory Value */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="w-5 h-5 mr-2 text-purple-500" />
                Current Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-purple-800">
                  ₹{businessData.inventoryValue.totalValue?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Stock Value</p>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Petrol', value: businessData.inventoryValue.petrolValue },
                      { name: 'Diesel', value: businessData.inventoryValue.dieselValue },
                      { name: 'Power', value: businessData.inventoryValue.powerValue }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
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
            </CardContent>
          </Card>

          {/* Anomaly Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                Anomaly Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {businessData.anomalies.map((anomaly, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  anomaly.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  anomaly.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  anomaly.severity === 'low' ? 'border-blue-500 bg-blue-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{anomaly.type}</p>
                      <p className="text-xs text-gray-600">{anomaly.description}</p>
                    </div>
                    <Badge variant={
                      anomaly.severity === 'critical' ? 'destructive' :
                      anomaly.severity === 'medium' ? 'secondary' : 'default'
                    }>
                      {anomaly.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{anomaly.date}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessIntelligence;
