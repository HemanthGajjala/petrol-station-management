import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Safe chart imports with fallbacks
let BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer;
let LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, ReferenceLine;

try {
  const recharts = require('recharts');
  ({
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, ReferenceLine
  } = recharts);
} catch (error) {
  console.warn('Recharts not available, using enhanced tables and progress bars');
}

import { 
  TrendingUp, TrendingDown, AlertTriangle, DollarSign, Fuel, Calendar,
  Brain, Zap, Target, Clock, BarChart3, MessageSquare, Send, Bot,
  Lightbulb, Activity, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Users, Truck, CreditCard, ShoppingCart, Gauge, Award, AlertCircle,
  Calculator, TrendingUpIcon, CheckCircle2, XCircle
} from 'lucide-react';

const BusinessIntelligenceAdvanced = () => {
  const [loading, setLoading] = useState(true);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [businessData, setBusinessData] = useState({
    stockDepletion: {},
    refillSuggestions: {},
    creditTimeline: {},
    inventoryValue: {},
    salesAnalysis: {},
    anomalies: [],
    tankOptimization: {},
    collectionAudit: {},
    quickMetrics: {}
  });

  // Business Configuration Parameters
  const CONFIG = {
    SAFETY_BUFFER_DAYS: 3,
    LEAD_TIME_DAYS: 2,
    PROFIT_MARGIN: 0.08,
    CREDIT_PAYMENT_RATIO: 0.3,
    FILL_RATIO: 0.9,
    VARIANCE_THRESHOLD_OK: 5,
    VARIANCE_THRESHOLD_REVIEW: 15,
    TANK_CAPACITIES: {
      MS: 15000,
      HSD: 12000,
      Power: 8000
    }
  };

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A65', '#81C784'];
  
  useEffect(() => {
    fetchRealBusinessData();
    checkChartsAvailability();
  }, []);

  const checkChartsAvailability = () => {
    setChartsLoaded(!!BarChart && !!ResponsiveContainer);
  };

  const fetchRealBusinessData = async () => {
    setLoading(true);
    try {
      // Fetch actual data from your backend APIs with comprehensive BI endpoints
      const [
        dailyData,
        procurementData,
        currentStock,
        salesTrends,
        inventoryValue,
        stockDepletion,
        creditTimeline,
        salesTrendAnalysis
      ] = await Promise.all([
        fetch('http://localhost:5000/api/daily-consolidation').then(r => r.json()),
        fetch('http://localhost:5000/api/procurement').then(r => r.json()),
        fetch('http://localhost:5000/api/analytics/current-stock').then(r => r.json()),
        fetch('http://localhost:5000/api/analytics/sales-trends').then(r => r.json()),
        fetch('http://localhost:5000/api/business-intelligence/inventory-value').then(r => r.json()),
        fetch('http://localhost:5000/api/business-intelligence/stock-depletion').then(r => r.json().catch(() => null)),
        fetch('http://localhost:5000/api/business-intelligence/credit-timeline').then(r => r.json().catch(() => null)),
        fetch('http://localhost:5000/api/business-intelligence/sales-trends').then(r => r.json().catch(() => null))
      ]);

      // Use real data from backend APIs where available
      const realData = {
        inventoryValue: {
          byFuel: inventoryValue.byFuel,
          total: inventoryValue.total,
          rates: inventoryValue.rates
        }
      };

      // Add stock depletion if available
      if (stockDepletion) {
        realData.stockDepletion = stockDepletion;
      }

      // Add credit timeline if available  
      if (creditTimeline) {
        realData.creditTimeline = creditTimeline;
      }

      // Add sales trend analysis if available
      if (salesTrendAnalysis) {
        realData.salesTrendAnalysis = salesTrendAnalysis;
      }
      
      console.log('Real data from backend:', realData);

      // Calculate other business intelligence metrics
      const calculatedMetrics = await calculateAllMetrics(dailyData.data || dailyData, procurementData.data || procurementData, currentStock, salesTrends);
      
      // Override with real backend data where available
      if (realData.inventoryValue) {
        calculatedMetrics.inventoryValue = realData.inventoryValue;
      }
      if (realData.stockDepletion) {
        calculatedMetrics.stockDepletion = realData.stockDepletion;
      }
      if (realData.creditTimeline) {
        calculatedMetrics.creditTimeline = realData.creditTimeline;
      }
      if (realData.salesTrendAnalysis) {
        calculatedMetrics.salesTrendAnalysis = realData.salesTrendAnalysis;
      }
      
      console.log('Final business data with real rates:', calculatedMetrics);
      
      setBusinessData(calculatedMetrics);
      
    } catch (error) {
      console.error('Error fetching real business data:', error);
      // Fallback to demo data for development
      setBusinessData(getDemoBusinessData());
    } finally {
      setLoading(false);
    }
  };

  const calculateAllMetrics = async (dailyData, procurementData, currentStock, salesTrends) => {
    try {
      // 1. Stock Depletion Forecast
      const stockDepletion = calculateStockDepletion(dailyData, currentStock);
      
      // 2. Optimal Refill Suggestions
      const refillSuggestions = calculateRefillSuggestions(stockDepletion);
      
      // 3. Credit Payback Timeline
      const creditTimeline = calculateCreditTimeline(dailyData, procurementData);
      
      // 4. Stock-to-Cash Conversion
      const inventoryValue = calculateInventoryValue(currentStock, dailyData);
      
      // 5. Top Sales Days & Shifts Analysis
      const salesAnalysis = calculateSalesAnalysis(dailyData);
      
      // 6. Anomaly Detection
      const anomalies = calculateAnomalies(dailyData);
      
      // 7. Tank Fill Optimization
      const tankOptimization = calculateTankOptimization(currentStock);
      
      // 8. Cash Collection Verification
      const collectionAudit = calculateCollectionAudit(dailyData);
      
      // 9. Quick Questions Analytics
      const quickMetrics = calculateQuickMetrics(dailyData, stockDepletion, salesAnalysis);

      return {
        stockDepletion,
        refillSuggestions,
        creditTimeline,
        inventoryValue,
        salesAnalysis,
        anomalies,
        tankOptimization,
        collectionAudit,
        quickMetrics
      };
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return getDemoBusinessData();
    }
  };

  // Business Intelligence Calculation Functions
  const calculateStockDepletion = (dailyData, currentStock) => {
    // Days_Remaining = Current_Stock / Average_Daily_Consumption
    const recentData = dailyData.slice(-7); // Last 7 days
    
    const avgDailyConsumption = {
      MS: recentData.reduce((sum, day) => sum + (day.ms_quantity || 0), 0) / recentData.length,
      HSD: recentData.reduce((sum, day) => sum + (day.hsd_quantity || 0), 0) / recentData.length,
      Power: recentData.reduce((sum, day) => sum + (day.power_quantity || 0), 0) / recentData.length
    };

    const currentStockLevels = {
      MS: (currentStock.ms1_tank || 8500) + (currentStock.ms2_tank || 0),
      HSD: (currentStock.hsd1_tank || 12000) + (currentStock.hsd2_tank || 0),
      Power: currentStock.power1_tank || 3500
    };

    const daysRemaining = {
      MS: avgDailyConsumption.MS > 0 ? Math.floor(currentStockLevels.MS / avgDailyConsumption.MS) : 30,
      HSD: avgDailyConsumption.HSD > 0 ? Math.floor(currentStockLevels.HSD / avgDailyConsumption.HSD) : 30,
      Power: avgDailyConsumption.Power > 0 ? Math.floor(currentStockLevels.Power / avgDailyConsumption.Power) : 30
    };

    return {
      currentStock: currentStockLevels,
      dailyConsumption: avgDailyConsumption,
      daysRemaining,
      status: {
        MS: daysRemaining.MS < 3 ? 'critical' : daysRemaining.MS < 7 ? 'warning' : 'good',
        HSD: daysRemaining.HSD < 3 ? 'critical' : daysRemaining.HSD < 7 ? 'warning' : 'good',
        Power: daysRemaining.Power < 3 ? 'critical' : daysRemaining.Power < 7 ? 'warning' : 'good'
      }
    };
  };

  const calculateRefillSuggestions = (stockDepletion) => {
    // Order_Date = Current_Date + (Days_Remaining - Safety_Buffer - Lead_Time)
    const today = new Date();
    const suggestions = {};

    Object.keys(stockDepletion.daysRemaining).forEach(fuel => {
      const daysRemaining = stockDepletion.daysRemaining[fuel];
      const orderInDays = Math.max(0, daysRemaining - CONFIG.SAFETY_BUFFER_DAYS - CONFIG.LEAD_TIME_DAYS);
      const orderDate = new Date(today.getTime() + orderInDays * 24 * 60 * 60 * 1000);
      
      suggestions[fuel] = {
        orderInDays,
        orderDate: orderDate.toDateString(),
        urgency: orderInDays <= 1 ? 'HIGH' : orderInDays <= 3 ? 'MEDIUM' : 'LOW',
        recommendedQuantity: Math.floor(CONFIG.TANK_CAPACITIES[fuel] * CONFIG.FILL_RATIO - stockDepletion.currentStock[fuel])
      };
    });

    return suggestions;
  };

  const calculateCreditTimeline = (dailyData, procurementData) => {
    // Outstanding_Credit = Total_Procurement_Cost - Total_HPCL_Payments
    const totalProcurementCost = procurementData.reduce((sum, p) => sum + (p.quantity * p.rate), 0);
    const totalHPCLPayments = dailyData.reduce((sum, d) => sum + (d.hpcl_payment || 0), 0);
    const outstandingCredit = totalProcurementCost - totalHPCLPayments;

    // Daily_Credit_Payment_Capacity = Average_Daily_Cash_Flow × Credit_Payment_Ratio
    const dailyCashFlow = dailyData.reduce((sum, d) => {
      return sum + (d.cash_collections || 0) + (d.card_collections || 0) + (d.paytm_collections || 0);
    }, 0) / dailyData.length;

    const dailyCreditPaymentCapacity = dailyCashFlow * CONFIG.CREDIT_PAYMENT_RATIO;
    const paybackDays = outstandingCredit > 0 ? Math.ceil(outstandingCredit / dailyCreditPaymentCapacity) : 0;

    return {
      outstandingCredit,
      dailyCashFlow,
      dailyCreditPaymentCapacity,
      paybackDays,
      paybackDate: new Date(Date.now() + paybackDays * 24 * 60 * 60 * 1000).toDateString()
    };
  };

  const calculateInventoryValue = (currentStock, dailyData) => {
    // Get latest rates from most recent daily entry with proper fallbacks
    let latestRates;
    
    if (dailyData && dailyData.length > 0) {
      // Find the most recent entry with valid rates
      const entryWithRates = dailyData
        .slice()
        .reverse()
        .find(entry => entry.ms_rate && entry.hsd_rate && entry.power_rate);
      
      if (entryWithRates) {
        latestRates = {
          ms_rate: parseFloat(entryWithRates.ms_rate),
          hsd_rate: parseFloat(entryWithRates.hsd_rate),
          power_rate: parseFloat(entryWithRates.power_rate)
        };
      } else {
        // Fallback to default rates if no valid rates found
        latestRates = {
          ms_rate: 106.50,
          hsd_rate: 94.20,
          power_rate: 89.30
        };
      }
    } else {
      // Default rates if no daily data
      latestRates = {
        ms_rate: 106.50,
        hsd_rate: 94.20,
        power_rate: 89.30
      };
    }

    const inventoryValue = {
      MS: ((currentStock.ms1_tank || 8500) + (currentStock.ms2_tank || 0)) * latestRates.ms_rate,
      HSD: ((currentStock.hsd1_tank || 12000) + (currentStock.hsd2_tank || 0)) * latestRates.hsd_rate,
      Power: (currentStock.power1_tank || 3500) * latestRates.power_rate
    };

    const totalValue = Object.values(inventoryValue).reduce((sum, val) => sum + val, 0);

    return {
      byFuel: inventoryValue,
      total: totalValue,
      rates: latestRates
    };
  };

  const calculateSalesAnalysis = (dailyData) => {
    // Daily sales analysis
    const dailySales = dailyData.map(day => ({
      date: day.date,
      totalSales: (day.ms_amount || 0) + (day.hsd_amount || 0) + (day.power_amount || 0),
      msAmount: day.ms_amount || 0,
      hsdAmount: day.hsd_amount || 0,
      powerAmount: day.power_amount || 0
    }));

    // Top performing days
    const topDays = [...dailySales].sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);

    // Manager performance (if manager field exists)
    const managerPerformance = {};
    dailyData.forEach(day => {
      if (day.manager) {
        if (!managerPerformance[day.manager]) {
          managerPerformance[day.manager] = { totalSales: 0, days: 0 };
        }
        managerPerformance[day.manager].totalSales += (day.ms_amount || 0) + (day.hsd_amount || 0) + (day.power_amount || 0);
        managerPerformance[day.manager].days += 1;
      }
    });

    // Calculate averages
    Object.keys(managerPerformance).forEach(manager => {
      managerPerformance[manager].avgSales = managerPerformance[manager].totalSales / managerPerformance[manager].days;
    });

    return {
      dailySales,
      topDays,
      managerPerformance
    };
  };

  const calculateAnomalies = (dailyData) => {
    // Statistical Anomaly Detection: |Current_Value - Mean| > 2 × Standard_Deviation
    const sales = dailyData.map(d => (d.ms_amount || 0) + (d.hsd_amount || 0) + (d.power_amount || 0));
    const mean = sales.reduce((sum, val) => sum + val, 0) / sales.length;
    const variance = sales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sales.length;
    const stdDev = Math.sqrt(variance);

    const anomalies = [];
    
    dailyData.forEach((day, index) => {
      const totalSales = (day.ms_amount || 0) + (day.hsd_amount || 0) + (day.power_amount || 0);
      
      // Sales anomalies
      if (Math.abs(totalSales - mean) > 2 * stdDev) {
        anomalies.push({
          date: day.date,
          type: totalSales > mean ? 'High Sales' : 'Low Sales',
          description: `Sales ${totalSales > mean ? 'significantly above' : 'significantly below'} average (₹${totalSales.toLocaleString()} vs ₹${mean.toLocaleString()})`,
          severity: 'medium',
          value: totalSales
        });
      }

      // Collection variance anomalies
      const totalCollections = (day.cash_collections || 0) + (day.card_collections || 0) + (day.paytm_collections || 0);
      const variance = totalCollections > 0 ? ((totalCollections - totalSales) / totalSales * 100) : 0;
      
      if (Math.abs(variance) > CONFIG.VARIANCE_THRESHOLD_REVIEW) {
        anomalies.push({
          date: day.date,
          type: 'Collection Variance',
          description: `Collection variance of ${variance.toFixed(1)}% detected`,
          severity: Math.abs(variance) > 20 ? 'critical' : 'medium',
          value: variance
        });
      }
    });

    return anomalies;
  };

  const calculateTankOptimization = (currentStock) => {
    // Optimal_Order = (Tank_Capacity - Current_Stock) × Fill_Ratio
    const optimization = {};
    
    Object.keys(CONFIG.TANK_CAPACITIES).forEach(fuel => {
      const currentLevel = fuel === 'MS' ? 
        (currentStock.ms1_tank || 8500) + (currentStock.ms2_tank || 0) :
        fuel === 'HSD' ? 
        (currentStock.hsd1_tank || 12000) + (currentStock.hsd2_tank || 0) :
        currentStock.power1_tank || 3500;

      const availableSpace = CONFIG.TANK_CAPACITIES[fuel] - currentLevel;
      const optimalOrder = Math.max(0, availableSpace * CONFIG.FILL_RATIO);
      const utilizationPercent = (currentLevel / CONFIG.TANK_CAPACITIES[fuel]) * 100;

      optimization[fuel] = {
        currentLevel,
        capacity: CONFIG.TANK_CAPACITIES[fuel],
        availableSpace,
        optimalOrder: Math.floor(optimalOrder),
        utilizationPercent: Math.round(utilizationPercent),
        fillRecommendation: utilizationPercent < 30 ? 'Fill Now' : utilizationPercent < 60 ? 'Plan Fill' : 'Monitor'
      };
    });

    return optimization;
  };

  const calculateCollectionAudit = (dailyData) => {
    // Variance_Percentage = (Total_Collections - Total_Sales) / Total_Sales × 100
    const auditResults = dailyData.map(day => {
      const totalSales = (day.ms_amount || 0) + (day.hsd_amount || 0) + (day.power_amount || 0);
      const totalCollections = (day.cash_collections || 0) + (day.card_collections || 0) + (day.paytm_collections || 0);
      const variance = totalSales > 0 ? ((totalCollections - totalSales) / totalSales * 100) : 0;
      
      const status = Math.abs(variance) <= CONFIG.VARIANCE_THRESHOLD_OK ? 'OK' : 
                    Math.abs(variance) <= CONFIG.VARIANCE_THRESHOLD_REVIEW ? 'REVIEW' : 'ALERT';

      return {
        date: day.date,
        totalSales,
        totalCollections,
        variance: Math.round(variance * 100) / 100,
        status,
        cashPercent: totalCollections > 0 ? Math.round(((day.cash_collections || 0) / totalCollections) * 100) : 0,
        cardPercent: totalCollections > 0 ? Math.round(((day.card_collections || 0) / totalCollections) * 100) : 0,
        digitalPercent: totalCollections > 0 ? Math.round(((day.paytm_collections || 0) / totalCollections) * 100) : 0
      };
    });

    return {
      dailyAudit: auditResults,
      summary: {
        avgVariance: auditResults.reduce((sum, r) => sum + Math.abs(r.variance), 0) / auditResults.length,
        alertDays: auditResults.filter(r => r.status === 'ALERT').length,
        reviewDays: auditResults.filter(r => r.status === 'REVIEW').length
      }
    };
  };

  const calculateQuickMetrics = (dailyData, stockDepletion, salesAnalysis) => {
    // Weekly profit calculation
    const last7Days = dailyData.slice(-7);
    const weeklySales = last7Days.reduce((sum, day) => sum + ((day.ms_amount || 0) + (day.hsd_amount || 0) + (day.power_amount || 0)), 0);
    const weeklyProfit = Math.round(weeklySales * CONFIG.PROFIT_MARGIN);

    // Average daily sales
    const avgDailySales = Math.round(weeklySales / 7);

    // Best manager
    const managers = Object.keys(salesAnalysis.managerPerformance);
    const bestManager = managers.length > 0 ? 
      managers.reduce((best, current) => 
        salesAnalysis.managerPerformance[current].avgSales > salesAnalysis.managerPerformance[best].avgSales ? current : best
      ) : 'N/A';

    // Stock duration (minimum across all fuels)
    const stockDaysLeft = Math.min(...Object.values(stockDepletion.daysRemaining));

    return {
      weeklyProfit,
      avgDailySales,
      bestManager,
      stockDaysLeft,
      weeklySales,
      profitMargin: CONFIG.PROFIT_MARGIN * 100
    };
  };

  const getDemoBusinessData = () => {
    // Fallback demo data that matches the calculation structure
    console.log('Using demo/fallback data instead of real data');
    return {
      stockDepletion: {
        currentStock: { MS: 8500, HSD: 12000, Power: 3500 },
        dailyConsumption: { MS: 1200, HSD: 1800, Power: 400 },
        daysRemaining: { MS: 7, HSD: 6, Power: 8 },
        status: { MS: 'warning', HSD: 'critical', Power: 'good' }
      },
      refillSuggestions: {
        MS: { orderInDays: 2, orderDate: 'Aug 10, 2025', urgency: 'MEDIUM', recommendedQuantity: 5000 },
        HSD: { orderInDays: 1, orderDate: 'Aug 9, 2025', urgency: 'HIGH', recommendedQuantity: 8000 },
        Power: { orderInDays: 3, orderDate: 'Aug 11, 2025', urgency: 'LOW', recommendedQuantity: 3500 }
      },
      creditTimeline: {
        outstandingCredit: 850000,
        dailyCashFlow: 180000,
        dailyCreditPaymentCapacity: 54000,
        paybackDays: 16,
        paybackDate: 'Aug 24, 2025'
      },
      inventoryValue: {
        byFuel: { MS: 904250, HSD: 1130400, Power: 312550 },
        total: 2347200,
        rates: { ms_rate: 106.50, hsd_rate: 94.20, power_rate: 89.30 }
      },
      quickMetrics: {
        weeklyProfit: 156800,
        avgDailySales: 196000,
        bestManager: 'Gangadhar',
        stockDaysLeft: 6,
        weeklySales: 1960000,
        profitMargin: 8
      }
    };
  };

  // Handle AI Chat
  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { type: 'user', message: userMessage }]);

    // Simulate AI response based on business data
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      setChatHistory(prev => [...prev, { type: 'ai', message: aiResponse }]);
    }, 1000);
  };

  const generateAIResponse = (question) => {
    const q = question.toLowerCase();
    const data = businessData;

    // Stock-related questions
    if (q.includes('stock') || q.includes('fuel') || q.includes('remaining')) {
      const critical = Object.entries(data.stockDepletion?.daysRemaining || {})
        .filter(([fuel, days]) => days < 3)
        .map(([fuel]) => fuel);
      
      if (critical.length > 0) {
        return `⚠️ Critical stock alert: ${critical.join(', ')} need immediate refill. ${critical[0]} has only ${data.stockDepletion.daysRemaining[critical[0]]} days remaining.`;
      }
      return `Stock levels: MS (${data.stockDepletion?.daysRemaining?.MS || 7} days), HSD (${data.stockDepletion?.daysRemaining?.HSD || 6} days), Power (${data.stockDepletion?.daysRemaining?.Power || 8} days remaining).`;
    }

    // Sales questions
    if (q.includes('sales') || q.includes('profit') || q.includes('revenue')) {
      return `This week's performance: ₹${data.quickMetrics?.weeklySales?.toLocaleString() || '19,60,000'} sales, ₹${data.quickMetrics?.weeklyProfit?.toLocaleString() || '1,56,800'} profit (${data.quickMetrics?.profitMargin || 8}% margin). Daily average: ₹${data.quickMetrics?.avgDailySales?.toLocaleString() || '1,96,000'}.`;
    }

    // Credit questions
    if (q.includes('credit') || q.includes('payment') || q.includes('hpcl')) {
      return `HPCL Credit Status: ₹${data.creditTimeline?.outstandingCredit?.toLocaleString() || '8,50,000'} outstanding. At current payment rate, clearance in ${data.creditTimeline?.paybackDays || 16} days (${data.creditTimeline?.paybackDate || 'Aug 24, 2025'}).`;
    }

    // Order/refill questions
    if (q.includes('order') || q.includes('refill') || q.includes('buy')) {
      const urgent = Object.entries(data.refillSuggestions || {})
        .filter(([fuel, info]) => info.urgency === 'HIGH')
        .map(([fuel, info]) => `${fuel}: ${info.recommendedQuantity}L by ${info.orderDate}`);
      
      if (urgent.length > 0) {
        return `🚨 Urgent orders needed: ${urgent.join(', ')}. Place orders immediately to avoid stockout.`;
      }
      return `Order recommendations: Check the refill suggestions panel for optimal timing and quantities.`;
    }

    // General business questions
    if (q.includes('business') || q.includes('performance') || q.includes('how')) {
      return `Business Overview: ₹${data.inventoryValue?.total?.toLocaleString() || '23,47,200'} inventory value, ${data.quickMetrics?.stockDaysLeft || 6} days stock remaining, ${data.quickMetrics?.bestManager || 'Gangadhar'} is top performer this week.`;
    }

    return `I can help with stock levels, sales analysis, profit calculations, HPCL credit status, and order recommendations. What specific business metric would you like to know about?`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'good': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Business Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Intelligence Dashboard</h1>
        <p className="text-gray-600">Real-time analytics and insights for optimal fuel station management</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stock Management */}
        <div className="space-y-6">
          {/* Enhanced Stock Depletion Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Fuel className="h-5 w-5 mr-2" />
                Enhanced Stock Depletion Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {businessData.stockDepletion?.forecast_results ? 
                  Object.entries(businessData.stockDepletion.forecast_results).map(([fuel, data]) => {
                    const stockPercentage = data.current_stock?.percentage || 0;
                    const daysToReorder = data.status?.days_to_reorder_threshold || 0;
                    const statusLevel = data.status?.level || 'GOOD';
                    const statusColor = data.status?.color || '🟢';
                    const dailyConsumption = data.consumption_patterns?.conservative_daily || 0;
                    
                    return (
                      <div key={fuel} className="border-2 rounded-xl p-5 space-y-4">
                        {/* Header with Fuel Type and Status */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold">{fuel}</span>
                            <span className="text-2xl">{statusColor}</span>
                          </div>
                          <Badge className={`text-white font-semibold px-3 py-1 ${
                            statusLevel === 'CRITICAL' ? 'bg-red-600' :
                            statusLevel === 'URGENT' ? 'bg-orange-500' :
                            statusLevel === 'WARNING' ? 'bg-yellow-500' :
                            statusLevel === 'CAUTION' ? 'bg-blue-500' : 'bg-green-600'
                          }`}>
                            {statusLevel}
                          </Badge>
                        </div>

                        {/* Status Message */}
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-700">
                            {data.status?.message || 'Stock levels adequate'}
                          </p>
                        </div>

                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-700">
                              {Math.round(data.current_stock?.total_liters || 0).toLocaleString()}L
                            </div>
                            <div className="text-xs text-blue-600 font-medium">Current Stock</div>
                            <div className="text-xs text-gray-500">
                              {stockPercentage.toFixed(1)}% of capacity
                            </div>
                          </div>
                          
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-700">
                              {daysToReorder.toFixed(1)}
                            </div>
                            <div className="text-xs text-orange-600 font-medium">Days to Reorder</div>
                            <div className="text-xs text-gray-500">
                              Order by: {data.status?.recommended_order_date || 'TBD'}
                            </div>
                          </div>
                        </div>

                        {/* Tank Level Gauge */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-600">
                            <span>Tank Level</span>
                            <span>{stockPercentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 relative">
                            <div 
                              className={`h-3 rounded-full transition-all duration-300 ${
                                stockPercentage <= 15 ? 'bg-red-500' :
                                stockPercentage <= 20 ? 'bg-orange-500' :
                                stockPercentage <= 50 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, stockPercentage))}%` }}
                            ></div>
                            {/* Threshold markers */}
                            <div className="absolute top-0 left-[15%] w-0.5 h-3 bg-red-700"></div>
                            <div className="absolute top-0 left-[20%] w-0.5 h-3 bg-orange-700"></div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-red-600">15% Min</span>
                            <span className="text-orange-600">20% Reorder</span>
                            <span className="text-green-600">100%</span>
                          </div>
                        </div>

                        {/* Consumption Analysis */}
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          <div className="text-sm font-medium text-gray-700 mb-2">Consumption Analysis</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Daily Average: <span className="font-semibold">{Math.round(data.consumption_patterns?.daily_average || 0).toLocaleString()}L</span></div>
                            <div>Conservative: <span className="font-semibold">{Math.round(dailyConsumption).toLocaleString()}L</span></div>
                            <div>Volatility: <span className="font-semibold">{(data.consumption_patterns?.volatility || 0).toFixed(1)}%</span></div>
                            <div>Data Points: <span className="font-semibold">{data.consumption_patterns?.data_points || 0}</span></div>
                          </div>
                        </div>

                        {/* Multi-Scenario Analysis */}
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">Depletion Scenarios</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {data.scenarios && Object.entries(data.scenarios).map(([scenario, days]) => (
                              <div key={scenario} className="bg-white border rounded p-2">
                                <div className="font-medium capitalize text-gray-600">
                                  {scenario.replace('_', ' ')}
                                </div>
                                <div className="text-lg font-bold text-blue-600">
                                  {days === 999 ? '∞' : Math.round(days).toFixed(1)} days
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Items */}
                        {data.recommendations?.immediate_actions && data.recommendations.immediate_actions.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="text-sm font-medium text-yellow-800 mb-2 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Action Required
                            </div>
                            <ul className="text-xs text-yellow-700 space-y-1">
                              {data.recommendations.immediate_actions.map((action, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="mr-1">•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Order Recommendations */}
                        {data.recommendations?.order_recommendations && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="text-sm font-medium text-blue-800 mb-2">Order Recommendations</div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                              <div>Optimal Qty: <span className="font-semibold">{Math.round(data.recommendations.order_recommendations.optimal_quantity || 0).toLocaleString()}L</span></div>
                              <div>Minimum Qty: <span className="font-semibold">{Math.round(data.recommendations.order_recommendations.minimum_quantity || 0).toLocaleString()}L</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                  :
                  /* Fallback for legacy data structure */
                  Object.entries(businessData.stockDepletion?.daysRemaining || {}).map(([fuel, days]) => {
                    const status = businessData.stockDepletion?.status?.[fuel] || 'good';
                    const currentStock = businessData.stockDepletion?.currentStock?.[fuel] || 0;
                    const consumption = businessData.stockDepletion?.dailyConsumption?.[fuel] || 0;
                    
                    return (
                      <div key={fuel} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{fuel}</span>
                          <Badge className={getStatusColor(status)}>
                            {days} days
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Stock: {currentStock.toLocaleString()}L</span>
                            <span>Daily: {consumption.toLocaleString()}L</span>
                          </div>
                          <Progress 
                            value={Math.max(0, Math.min(100, (days / 30) * 100))} 
                            className="h-2"
                          />
                          <div className="text-xs text-gray-500">
                            Status: {status === 'critical' ? '🔴 Critical' : status === 'warning' ? '🟡 Warning' : '🟢 Good'}
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </CardContent>
          </Card>

          {/* Refill Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Optimal Refill Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(businessData.refillSuggestions || {}).map(([fuel, info]) => (
                  <div key={fuel} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{fuel}</span>
                      <Badge className={`text-white ${getUrgencyColor(info.urgency)}`}>
                        {info.urgency}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Order in:</span>
                        <span className="font-medium">{info.orderInDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Order date:</span>
                        <span className="font-medium">{info.orderDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span className="font-medium">{info.recommendedQuantity?.toLocaleString()}L</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tank Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="h-5 w-5 mr-2" />
                Tank Fill Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(businessData.tankOptimization || {}).map(([fuel, info]) => (
                  <div key={fuel} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{fuel} Tank</span>
                      <span className="text-sm text-gray-600">{info.utilizationPercent}% full</span>
                    </div>
                    <Progress value={info.utilizationPercent} className="h-3 mb-2" />
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Current:</span>
                        <span>{info.currentLevel?.toLocaleString()}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span>{info.capacity?.toLocaleString()}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimal order:</span>
                        <span className="font-medium">{info.optimalOrder?.toLocaleString()}L</span>
                      </div>
                      <div className="mt-2">
                        <Badge className={
                          info.fillRecommendation === 'Fill Now' ? 'bg-red-100 text-red-800' :
                          info.fillRecommendation === 'Plan Fill' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {info.fillRecommendation}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Financial Analysis */}
        <div className="space-y-6">
          {/* Credit Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                HPCL Credit Payback Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-1">
                    ₹{businessData.creditTimeline?.outstandingCredit?.toLocaleString() || '8,50,000'}
                  </div>
                  <div className="text-sm text-gray-600">Outstanding Credit</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">Daily Cash Flow</span>
                    <span className="font-medium">₹{businessData.creditTimeline?.dailyCashFlow?.toLocaleString() || '1,80,000'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm">Credit Payment Capacity (30%)</span>
                    <span className="font-medium">₹{businessData.creditTimeline?.dailyCreditPaymentCapacity?.toLocaleString() || '54,000'}</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm">Estimated Payback</span>
                    <span className="font-medium">{businessData.creditTimeline?.paybackDays || 16} days</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Target Clear Date</span>
                    <span className="font-medium">{businessData.creditTimeline?.paybackDate || 'Aug 24, 2025'}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-2">Payback Progress</div>
                  <Progress value={Math.min(100, (30 - (businessData.creditTimeline?.paybackDays || 16)) / 30 * 100)} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Value */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Stock-to-Cash Conversion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ₹{businessData.inventoryValue?.total?.toLocaleString() || '23,47,200'}
                  </div>
                  <div className="text-sm text-gray-600">Total Inventory Value</div>
                </div>

                {chartsLoaded && ResponsiveContainer ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={Object.entries(businessData.inventoryValue?.byFuel || {}).map(([fuel, value]) => ({
                          name: fuel,
                          value: value,
                          percentage: ((value / (businessData.inventoryValue?.total || 1)) * 100).toFixed(1)
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percentage}) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(businessData.inventoryValue?.byFuel || {}).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(businessData.inventoryValue?.byFuel || {}).map(([fuel, value]) => {
                      const percentage = ((value / (businessData.inventoryValue?.total || 1)) * 100);
                      return (
                        <div key={fuel} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{fuel}</span>
                          <div className="text-right">
                            <div className="font-medium">₹{value.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="space-y-2 mt-4 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Current Rates (from latest daily entry):</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Live Rates</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>MS Rate:</span>
                    <span className="font-medium">₹{businessData.inventoryValue?.rates?.ms_rate?.toFixed(2) || '106.50'}/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>HSD Rate:</span>
                    <span className="font-medium">₹{businessData.inventoryValue?.rates?.hsd_rate?.toFixed(2) || '94.20'}/L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Power Rate:</span>
                    <span className="font-medium">₹{businessData.inventoryValue?.rates?.power_rate?.toFixed(2) || '89.30'}/L</span>
                  </div>
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    💡 Rates automatically updated from your latest daily entry
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Collection Audit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Cash Collection Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-sm font-medium text-green-800">
                      {(businessData.collectionAudit?.dailyAudit?.filter(d => d.status === 'OK').length || 15)}
                    </div>
                    <div className="text-xs text-green-600">OK Days</div>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded">
                    <div className="text-sm font-medium text-yellow-800">
                      {businessData.collectionAudit?.summary?.reviewDays || 3}
                    </div>
                    <div className="text-xs text-yellow-600">Review</div>
                  </div>
                  <div className="p-2 bg-red-50 rounded">
                    <div className="text-sm font-medium text-red-800">
                      {businessData.collectionAudit?.summary?.alertDays || 1}
                    </div>
                    <div className="text-xs text-red-600">Alert</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Variance</span>
                    <span className="text-sm font-medium">
                      {(businessData.collectionAudit?.summary?.avgVariance || 3.2).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.abs(businessData.collectionAudit?.summary?.avgVariance || 3.2)} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Recent Collection Status</div>
                  {(businessData.collectionAudit?.dailyAudit?.slice(-5) || [
                    { date: '2025-08-07', variance: 2.1, status: 'OK' },
                    { date: '2025-08-06', variance: -1.8, status: 'OK' },
                    { date: '2025-08-05', variance: 12.4, status: 'REVIEW' },
                    { date: '2025-08-04', variance: 0.9, status: 'OK' },
                    { date: '2025-08-03', variance: -0.5, status: 'OK' }
                  ]).map((audit, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{audit.date}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{audit.variance > 0 ? '+' : ''}{audit.variance}%</span>
                        {audit.status === 'OK' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : audit.status === 'REVIEW' ? (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Chat & Analytics */}
        <div className="space-y-6">
          {/* AI Business Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                AI Business Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {chatHistory.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      Ask me about stock levels, sales analysis, profit calculations, or business insights!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.type === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white border text-gray-800'
                          }`}>
                            <div className="text-sm">{msg.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about your business..."
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                    className="flex-1"
                  />
                  <Button onClick={handleChatSubmit} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setChatMessage('How much stock do we have?')}
                    className="text-xs"
                  >
                    Stock Status
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setChatMessage('What is our weekly profit?')}
                    className="text-xs"
                  >
                    Weekly Profit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setChatMessage('When should I order fuel?')}
                    className="text-xs"
                  >
                    Order Timing
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setChatMessage('HPCL credit status?')}
                    className="text-xs"
                  >
                    Credit Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Trend Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUpIcon className="h-5 w-5 mr-2" />
                Multi-Timeframe Sales Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {businessData.salesTrendAnalysis ? (
                  <>
                    {/* Executive Summary */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">📊 EXECUTIVE SUMMARY</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Overall Trend:</span>
                          <span className="font-medium">{businessData.salesTrendAnalysis.executive_summary?.overall_trend_daily || 'Stable'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Most Volatile:</span>
                          <span className="font-medium">{businessData.salesTrendAnalysis.executive_summary?.most_volatile_fuel || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Daily Sales:</span>
                          <span className="font-medium">₹{businessData.salesTrendAnalysis.executive_summary?.average_daily_sales?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Volatility Ranking */}
                    <div>
                      <h4 className="font-semibold mb-3">📈 VOLATILITY RANKING (Most Ups & Downs):</h4>
                      <div className="space-y-2">
                        {businessData.salesTrendAnalysis.volatility_ranking?.map((fuel, index) => {
                          const getVolatilityColor = (classification) => {
                            switch(classification) {
                              case 'Low': return 'bg-green-100 text-green-800';
                              case 'Medium': return 'bg-yellow-100 text-yellow-800';
                              case 'High': return 'bg-orange-100 text-orange-800';
                              case 'Extreme': return 'bg-red-100 text-red-800';
                              default: return 'bg-gray-100 text-gray-800';
                            }
                          };

                          const getVolatilityIcon = (classification) => {
                            switch(classification) {
                              case 'Low': return '🟢';
                              case 'Medium': return '🟡';
                              case 'High': return '🟠';
                              case 'Extreme': return '🔴';
                              default: return '⚪';
                            }
                          };

                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{index + 1}.</span>
                                <span className="text-sm">{fuel.fuel_type}</span>
                                <span className="text-lg">{getVolatilityIcon(fuel.volatility_classification)}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{fuel.volatility_score?.toFixed(1)}% CV</div>
                                <Badge className={`text-xs ${getVolatilityColor(fuel.volatility_classification)}`}>
                                  {fuel.volatility_classification} Volatility
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed Fuel Analysis */}
                    <div>
                      <h4 className="font-semibold mb-3">📊 DETAILED ANALYSIS:</h4>
                      <div className="space-y-4">
                        {Object.entries(businessData.salesTrendAnalysis.daily_analysis || {}).map(([fuelCode, data]) => {
                          if (fuelCode === 'total_amount') return null; // Skip total for individual analysis
                          
                          const getTrendColor = (trend) => {
                            if (trend?.includes('Growth')) return 'text-green-600';
                            if (trend?.includes('Decline')) return 'text-red-600';
                            return 'text-gray-600';
                          };

                          const getTrendIcon = (trend) => {
                            if (trend?.includes('Strong Growth')) return '📈';
                            if (trend?.includes('Moderate Growth')) return '↗️';
                            if (trend?.includes('Strong Decline')) return '📉';
                            if (trend?.includes('Moderate Decline')) return '↘️';
                            return '➡️';
                          };

                          return (
                            <div key={fuelCode} className="border rounded-lg p-4 space-y-3">
                              <div className="flex justify-between items-center">
                                <h5 className="font-medium">{data.fuel_name}</h5>
                                <div className="flex items-center space-x-2">
                                  <span className="text-lg">{getTrendIcon(data.trend_classification)}</span>
                                  <Badge className={`${getTrendColor(data.trend_classification)} bg-gray-100`}>
                                    {data.trend_classification}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span>Daily Avg:</span>
                                  <span className="font-medium">₹{data.mean_daily_sales?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Volatility:</span>
                                  <span className="font-medium">{data.coefficient_of_variation?.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Recent Change:</span>
                                  <span className={`font-medium ${data.recent_vs_previous_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {data.recent_vs_previous_change >= 0 ? '+' : ''}{data.recent_vs_previous_change?.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Data Points:</span>
                                  <span className="font-medium">{data.data_points}</span>
                                </div>
                              </div>

                              {/* Volatility Progress Bar */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Volatility Level</span>
                                  <span>{data.volatility_classification}</span>
                                </div>
                                <Progress 
                                  value={Math.min(100, data.coefficient_of_variation)} 
                                  className="h-2"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Weekly Analysis Summary */}
                    {businessData.salesTrendAnalysis.weekly_analysis && Object.keys(businessData.salesTrendAnalysis.weekly_analysis).length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">📅 WEEKLY ANALYSIS:</h4>
                        <div className="space-y-2">
                          {Object.entries(businessData.salesTrendAnalysis.weekly_analysis).map(([fuelCode, data]) => {
                            if (fuelCode === 'total_amount') return null;
                            
                            return (
                              <div key={fuelCode} className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                <span className="text-sm">{fuelCode.toUpperCase()}</span>
                                <div className="text-right text-xs">
                                  <div>Avg: ₹{data.mean_weekly_sales?.toLocaleString()}</div>
                                  <div className="text-gray-600">
                                    {data.positive_weeks || 0}↗️ {data.negative_weeks || 0}↘️ weeks
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 text-sm py-8">
                    <TrendingUpIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    Loading sales trend analysis...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Anomaly Detection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Anomaly Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(businessData.anomalies || [
                  { date: '2025-08-06', type: 'High Sales', description: 'Sales significantly above average (₹2,45,000 vs ₹1,96,000)', severity: 'medium' },
                  { date: '2025-08-05', type: 'Collection Variance', description: 'Collection variance of 12.4% detected', severity: 'medium' },
                  { date: '2025-08-03', type: 'Low Sales', description: 'Sales significantly below average (₹1,34,000 vs ₹1,96,000)', severity: 'medium' }
                ]).slice(0, 5).map((anomaly, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${
                    anomaly.severity === 'critical' ? 'border-red-500 bg-red-50' :
                    anomaly.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{anomaly.type}</span>
                      <span className="text-xs text-gray-500">{anomaly.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{anomaly.description}</p>
                  </div>
                ))}

                {(!businessData.anomalies || businessData.anomalies.length === 0) && (
                  <div className="text-center text-gray-500 text-sm py-4">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    No significant anomalies detected in recent data
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="justify-start">
                  <Fuel className="h-4 w-4 mr-2" />
                  Generate Order Report
                </Button>
                <Button variant="outline" className="justify-start">
                  <TrendingUpIcon className="h-4 w-4 mr-2" />
                  Export Sales Analytics
                </Button>
                <Button variant="outline" className="justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Check Credit Status
                </Button>
                <Button variant="outline" className="justify-start">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View All Anomalies
                </Button>
                <Button variant="outline" className="justify-start">
                  <Calculator className="h-4 w-4 mr-2" />
                  Profit Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Summary */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Business Summary</h3>
            <p className="text-gray-600 mb-4">
              Current inventory worth ₹{businessData.inventoryValue?.total?.toLocaleString() || '23,47,200'} with {businessData.quickMetrics?.stockDaysLeft || 6} days stock remaining. 
              Weekly profit of ₹{businessData.quickMetrics?.weeklyProfit?.toLocaleString() || '1,56,800'} at {businessData.quickMetrics?.profitMargin || 8}% margin. 
              HPCL credit clearance expected in {businessData.creditTimeline?.paybackDays || 16} days.
            </p>
            <div className="flex justify-center space-x-4">
              <Button onClick={fetchRealBusinessData} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <Button variant="outline">
                Export Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessIntelligenceAdvanced;
