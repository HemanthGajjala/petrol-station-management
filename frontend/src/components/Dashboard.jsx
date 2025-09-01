import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Fuel, 
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Package,
  CreditCard,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCurrentBusinessDay, formatBusinessDayInfo, isNightShiftTime } from '../lib/constants';

const Dashboard = ({ dateRange }) => {
  const [dashboardData, setDashboardData] = useState({
    total_fuel_sales: 0,
    total_collections: 0,
    variance: 0,
    total_procurement: 0,
    procurement_details: {
      HSD: { quantity: 0, amount: 0 },
      MS: { quantity: 0, amount: 0 },
      POWER: { quantity: 0, amount: 0 }
    },
    hpcl_credit_outstanding: 0,
    completion_status: 'EMPTY',
    entries_count: 0,
    morning_shift_status: 'Pending',
    night_shift_status: 'Pending',
    start_date: dateRange.startDate,
    end_date: dateRange.endDate,
    current_business_day: null,
    is_current_business_day: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchDashboardData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get current business day for contextual information
      const currentBusinessDay = getCurrentBusinessDay();
      const businessDayStr = currentBusinessDay.toISOString().split('T')[0];
      
      // Fetch dashboard summary data
      const summaryResponse = await fetch(`http://localhost:5000/api/dashboard/summary?start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`);
      const summaryResult = await summaryResponse.json();
      
      // For HPCL credit, use business day logic if viewing current business day
      let hpclDateToCheck = dateRange.endDate;
      if (dateRange.endDate === businessDayStr) {
        // If viewing current business day, use business day logic
        hpclDateToCheck = businessDayStr;
      }
      
      // Fetch HPCL credit data for the specific end date
      const hpclResponse = await fetch(`http://localhost:5000/api/dashboard?date=${hpclDateToCheck}`);
      const hpclResult = await hpclResponse.json();
      
      console.log('Dashboard summary data:', summaryResult);
      console.log('HPCL credit data for date ' + hpclDateToCheck + ':', hpclResult);
      console.log('Current business day:', businessDayStr);
      
      // Store the actual entry date for the HPCL credit outstanding value
      let hpclEntryDate = hpclDateToCheck;
      let isFromPreviousDate = false;
      
      if (hpclResult.status === 'success' && hpclResult.dashboardData) {
        hpclEntryDate = hpclResult.dashboardData.entry_date || hpclDateToCheck;
        isFromPreviousDate = hpclResult.dashboardData.from_previous_date || false;
      }
      
      if (summaryResult.success) {
        const data = {
          ...summaryResult.data,
          procurement_details: summaryResult.data.procurement_details || {
            HSD: { quantity: 0, amount: 0 },
            MS: { quantity: 0, amount: 0 },
            POWER: { quantity: 0, amount: 0 }
          }
        };
        
        // Use the latest HPCL credit outstanding value from the dedicated endpoint
        if (hpclResult.status === 'success') {
          data.hpcl_credit_outstanding = hpclResult.dashboardData.hpcl_credit_outstanding;
          data.hpcl_entry_date = hpclEntryDate;
          data.hpcl_from_previous_date = isFromPreviousDate;
        }
        
        // Add business day context
        data.current_business_day = businessDayStr;
        data.is_current_business_day = dateRange.endDate === businessDayStr;
        
        console.log('Final dashboard data:', data);
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETE':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-4 w-4 mr-1" />Complete</Badge>;
      case 'PARTIAL':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-4 w-4 mr-1" />Partial</Badge>;
      case 'EMPTY':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-4 w-4 mr-1" />Empty</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    // Ensure the amount is a number before formatting
    const numericAmount = typeof amount === 'number' ? amount : 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(numericAmount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <div className="text-sm text-gray-600 text-right">
          <div>
            Data for: <strong>{formatDate(dashboardData.start_date)}</strong> to <strong>{formatDate(dashboardData.end_date)}</strong>
          </div>
          {dashboardData.is_current_business_day && (
            <div className="text-xs text-blue-600 mt-1">
              Viewing current business day data
            </div>
          )}
        </div>
      </div>

      {/* Business Day Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900">Current Business Day</h3>
              <p className="text-sm text-blue-700">
                {formatBusinessDayInfo(getCurrentBusinessDay()).businessDate} 
                ({formatBusinessDayInfo(getCurrentBusinessDay()).startTime.split(',')[1]} - {formatBusinessDayInfo(getCurrentBusinessDay()).endTime.split(',')[1]})
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={isNightShiftTime() ? "destructive" : "default"} className="mb-1">
              {isNightShiftTime() ? "Night Shift Active" : "Day Shift Active"}
            </Badge>
            <p className="text-xs text-blue-600">
              {isNightShiftTime() ? "8:30 PM - 8:30 AM" : "8:30 AM - 8:30 PM"}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fuel Sales</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.total_fuel_sales)}</div>
            <p className="text-xs text-muted-foreground">
              Revenue from all fuel types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.total_collections)}</div>
            <p className="text-xs text-muted-foreground">
              Cash + Card + Digital payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
            {dashboardData.variance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardData.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(dashboardData.variance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Sales - Collections
            </p>
          </CardContent>
        </Card>
        
        {/* --- HPCL CREDIT CARD --- */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HPCL Credit</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(Number(dashboardData.hpcl_credit_outstanding) || 0)}
            </div>
            {dashboardData.hpcl_from_previous_date ? (
              <div>
                <p className="text-xs text-amber-600">
                  Last recorded on {formatDate(dashboardData.hpcl_entry_date)}
                </p>
                <p className="text-xs text-muted-foreground">
                  (No data for {formatDate(dashboardData.end_date)})
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Outstanding as of {formatDate(dashboardData.hpcl_entry_date || dashboardData.end_date)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Procurement</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(dashboardData.total_procurement)}</div>
            <div className="text-xs text-muted-foreground mt-1 space-y-1">
              {dashboardData.procurement_details && (
                <>
                  <p>HSD: {dashboardData.procurement_details.HSD?.quantity?.toFixed(2) || 0} Ltrs</p>
                  <p>MS: {dashboardData.procurement_details.MS?.quantity?.toFixed(2) || 0} Ltrs</p>
                  <p>POWER: {dashboardData.procurement_details.POWER?.quantity?.toFixed(2) || 0} Ltrs</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Status (for {formatDate(dashboardData.end_date)})</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusBadge(dashboardData.completion_status)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {dashboardData.entries_count} entries recorded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Day Status (for {formatDate(dashboardData.end_date)})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-xs text-gray-500 mb-3">
                Business Day: 8:30 AM - 8:30 AM (next day)
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Day Shift (8:30 AM - 8:30 PM)</span>
                <Badge className={dashboardData.morning_shift_status === 'Recorded' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                  {dashboardData.morning_shift_status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Night Shift (8:30 PM - 8:30 AM)</span>
                <Badge className={dashboardData.night_shift_status === 'Recorded' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                  {dashboardData.night_shift_status}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Business Day Status</span>
                {getStatusBadge(dashboardData.completion_status)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/daily-entry">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Add Daily Entry</Button>
              </Link>
              <Link to="/procurement">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Add Procurement Entry</Button>
              </Link>
               <Link to="/ai-chat">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">Chat with AI</Button>
               </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Preview */}
      <Card>
        <CardHeader>
          <CardTitle>AI Business Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Click on "Chat with AI" to get intelligent business insights and recommendations based on your data.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard;
