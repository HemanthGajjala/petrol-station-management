import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Droplet
} from 'lucide-react'

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

const Analytics = ({ selectedDate }) => {
  const [analyticsData, setAnalyticsData] = useState({
    dailyEntries: [],
    procurementEntries: [],
    summary: {
      totalSales: 0,
      totalCollections: 0,
      totalProcurement: 0,
      averageVariance: 0,
      latestHPCLCredit: {
        amount: 0,
        date: null
      }
    }
  })
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    end: selectedDate
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAnalyticsData()
  }, [dateRange, selectedDate])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Fetch daily entries
      const dailyResponse = await fetch(
        `http://localhost:5000/api/daily-consolidation?start_date=${dateRange.start}&end_date=${dateRange.end}`
      )
      const dailyResult = await dailyResponse.json()
      
      // Fetch procurement entries
      const procurementResponse = await fetch(
        `http://localhost:5000/api/procurement?start_date=${dateRange.start}&end_date=${dateRange.end}`
      )
      const procurementResult = await procurementResponse.json()
      
      if (dailyResult.success && procurementResult.success) {
        const dailyEntries = dailyResult.data
        const procurementEntries = procurementResult.data
        
        // Calculate summary
        const totalSales = dailyEntries.reduce((sum, entry) => 
          sum + entry.ms_amount + entry.hsd_amount + entry.power_amount, 0
        )
        const totalCollections = dailyEntries.reduce((sum, entry) => 
          sum + entry.cash_collections + entry.card_collections + entry.paytm_collections + entry.hp_transactions, 0
        )
        const totalProcurement = procurementEntries.reduce((sum, entry) => 
          sum + entry.total_amount, 0
        )
        const averageVariance = dailyEntries.length > 0 ? 
          (totalSales - totalCollections) / dailyEntries.length : 0
        
        // Find latest HPCL Credit entry
        const entriesWithHPCLCredit = dailyEntries
          .filter(entry => entry.total_outstanding > 0)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
        
        const latestHPCLCredit = {
          amount: entriesWithHPCLCredit.length > 0 ? entriesWithHPCLCredit[0].total_outstanding : 0,
          date: entriesWithHPCLCredit.length > 0 ? entriesWithHPCLCredit[0].date : null
        }
        
        setAnalyticsData({
          dailyEntries,
          procurementEntries,
          summary: {
            totalSales,
            totalCollections,
            totalProcurement,
            averageVariance,
            latestHPCLCredit
          }
        })
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getFuelTypeData = () => {
    const fuelData = {
      MS: { sales: 0, quantity: 0, tank1Level: 0, tank2Level: 0 },
      HSD: { sales: 0, quantity: 0, tank1Level: 0, tank2Level: 0 },
      POWER: { sales: 0, quantity: 0, tank1Level: 0 }
    }

    // First populate sales and quantity data
    analyticsData.dailyEntries.forEach(entry => {
      fuelData.MS.sales += entry.ms_amount
      fuelData.MS.quantity += entry.ms_quantity
      fuelData.HSD.sales += entry.hsd_amount
      fuelData.HSD.quantity += entry.hsd_quantity
      fuelData.POWER.sales += entry.power_amount
      fuelData.POWER.quantity += entry.power_quantity
    })
    
    // Find the latest tank level data
    const latestEntryWithTankData = [...analyticsData.dailyEntries]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .find(entry => entry.ms1_tank || entry.ms2_tank || entry.hsd1_tank || entry.hsd2_tank || entry.power1_tank);
    
    if (latestEntryWithTankData) {
      fuelData.MS.tank1Level = latestEntryWithTankData.ms1_tank || 0
      fuelData.MS.tank2Level = latestEntryWithTankData.ms2_tank || 0
      fuelData.HSD.tank1Level = latestEntryWithTankData.hsd1_tank || 0
      fuelData.HSD.tank2Level = latestEntryWithTankData.hsd2_tank || 0
      fuelData.POWER.tank1Level = latestEntryWithTankData.power1_tank || 0
      
      fuelData.MS.latestDate = latestEntryWithTankData.date
      fuelData.HSD.latestDate = latestEntryWithTankData.date
      fuelData.POWER.latestDate = latestEntryWithTankData.date
    }
    
    // Calculate total capacity and percentage
    fuelData.MS.totalCapacity = TANK_CAPACITIES.ms1_tank + TANK_CAPACITIES.ms2_tank
    fuelData.HSD.totalCapacity = TANK_CAPACITIES.hsd1_tank + TANK_CAPACITIES.hsd2_tank
    fuelData.POWER.totalCapacity = TANK_CAPACITIES.power1_tank
    
    fuelData.MS.totalLevel = fuelData.MS.tank1Level + fuelData.MS.tank2Level
    fuelData.HSD.totalLevel = fuelData.HSD.tank1Level + fuelData.HSD.tank2Level
    fuelData.POWER.totalLevel = fuelData.POWER.tank1Level
    
    fuelData.MS.fillPercentage = (fuelData.MS.totalLevel / fuelData.MS.totalCapacity) * 100
    fuelData.HSD.fillPercentage = (fuelData.HSD.totalLevel / fuelData.HSD.totalCapacity) * 100
    fuelData.POWER.fillPercentage = (fuelData.POWER.totalLevel / fuelData.POWER.totalCapacity) * 100

    return fuelData
  }

  const getDateWiseSales = () => {
    const dateWiseData = {}
    
    analyticsData.dailyEntries.forEach(entry => {
      const date = entry.date
      if (!dateWiseData[date]) {
        dateWiseData[date] = {
          sales: 0,
          collections: 0,
          variance: 0
        }
      }
      
      const sales = entry.ms_amount + entry.hsd_amount + entry.power_amount
      const collections = entry.cash_collections + entry.card_collections + entry.paytm_collections + entry.hp_transactions
      
      dateWiseData[date].sales += sales
      dateWiseData[date].collections += collections
      dateWiseData[date].variance += (sales - collections)
    })
    
    return Object.entries(dateWiseData).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const getCompletionStatus = () => {
    const dateStatus = {}
    
    analyticsData.dailyEntries.forEach(entry => {
      const date = entry.date
      if (!dateStatus[date]) {
        dateStatus[date] = { morning: false, night: false }
      }
      
      if (entry.shift === 'Day') {
        dateStatus[date].morning = true
      } else if (entry.shift === 'Night') {
        dateStatus[date].night = true
      }
    })
    
    const totalDays = Object.keys(dateStatus).length
    const completeDays = Object.values(dateStatus).filter(status => 
      status.morning && status.night
    ).length
    
    return {
      totalDays,
      completeDays,
      completionRate: totalDays > 0 ? (completeDays / totalDays) * 100 : 0
    }
  }
  
  const getHPCLCreditData = () => {
    // Get all entries with HPCL credit values
    const hpclEntries = analyticsData.dailyEntries
      .filter(entry => entry.total_outstanding > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // Group by date (keeping only the latest entry for each date)
    const dateGroups = {}
    hpclEntries.forEach(entry => {
      dateGroups[entry.date] = entry
    })
    
    // Convert to array for rendering
    return Object.values(dateGroups).map(entry => ({
      date: entry.date,
      amount: entry.total_outstanding,
      formattedDate: new Date(entry.date).toLocaleDateString('en-IN')
    }))
  }

  const fuelData = getFuelTypeData()
  const dateWiseData = getDateWiseSales()
  const hpclCreditData = getHPCLCreditData()
  const completionStatus = getCompletionStatus()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Analytics & Reports</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <Button
            onClick={fetchAnalyticsData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <span className="ml-4 text-gray-600">Loading analytics data...</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(analyticsData.summary.totalSales)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {dateRange.start} to {dateRange.end}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(analyticsData.summary.totalCollections)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  All payment methods
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Procurement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(analyticsData.summary.totalProcurement)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Fuel purchases
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Average Variance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  analyticsData.summary.averageVariance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(analyticsData.summary.averageVariance)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Sales - Collections
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">HPCL Credit Outstanding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {formatCurrency(analyticsData.summary.latestHPCLCredit.amount)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {analyticsData.summary.latestHPCLCredit.date 
                    ? `Last recorded on ${new Date(analyticsData.summary.latestHPCLCredit.date).toLocaleDateString('en-IN')}` 
                    : 'No data available'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fuel Type Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Fuel Type Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(fuelData).map(([fuelType, data]) => (
                  <div key={fuelType} className="p-4 border rounded-lg">
                    <h3 className="font-medium text-lg mb-2 text-center">
                      {fuelType === 'MS' ? 'Petrol (MS)' : 
                       fuelType === 'HSD' ? 'Diesel (HSD)' : 
                       'Premium (POWER)'}
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-sm text-gray-600">Sales</div>
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(data.sales)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Quantity</div>
                          <div className="text-lg font-medium">
                            {data.quantity.toLocaleString()} L
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Avg Rate</div>
                        <div className="text-lg font-medium">
                          ₹{data.quantity > 0 ? (data.sales / data.quantity).toFixed(2) : '0.00'}/L
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center">
                            <Droplet className="h-4 w-4 mr-1 text-blue-500" />
                            <span className="text-sm font-medium">Tank Status</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {data.latestDate ? new Date(data.latestDate).toLocaleDateString('en-IN') : 'No data'}
                          </span>
                        </div>
                        
                        <div className="mt-3 space-y-3">
                          {fuelType === 'MS' && (
                            <>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs">MS1 Tank ({(TANK_CAPACITIES.ms1_tank/1000).toFixed(1)}KL)</span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    getTankFillColorClass(calculateTankFillPercentage(data.tank1Level, 'ms1_tank'))
                                  }`}>
                                    {calculateTankFillPercentage(data.tank1Level, 'ms1_tank').toFixed(1)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={calculateTankFillPercentage(data.tank1Level, 'ms1_tank')}
                                  className={`h-2 ${
                                    getTankFillColorClass(calculateTankFillPercentage(data.tank1Level, 'ms1_tank'))
                                  }`}
                                />
                                <div className="text-xs text-gray-500 mt-0.5">{data.tank1Level.toLocaleString()} L</div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs">MS2 Tank ({(TANK_CAPACITIES.ms2_tank/1000).toFixed(1)}KL)</span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    getTankFillColorClass(calculateTankFillPercentage(data.tank2Level, 'ms2_tank'))
                                  }`}>
                                    {calculateTankFillPercentage(data.tank2Level, 'ms2_tank').toFixed(1)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={calculateTankFillPercentage(data.tank2Level, 'ms2_tank')}
                                  className={`h-2 ${
                                    getTankFillColorClass(calculateTankFillPercentage(data.tank2Level, 'ms2_tank'))
                                  }`}
                                />
                                <div className="text-xs text-gray-500 mt-0.5">{data.tank2Level.toLocaleString()} L</div>
                              </div>
                            </>
                          )}
                          
                          {fuelType === 'HSD' && (
                            <>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs">HSD1 Tank ({(TANK_CAPACITIES.hsd1_tank/1000).toFixed(1)}KL)</span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    getTankFillColorClass(calculateTankFillPercentage(data.tank1Level, 'hsd1_tank'))
                                  }`}>
                                    {calculateTankFillPercentage(data.tank1Level, 'hsd1_tank').toFixed(1)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={calculateTankFillPercentage(data.tank1Level, 'hsd1_tank')}
                                  className={`h-2 ${
                                    getTankFillColorClass(calculateTankFillPercentage(data.tank1Level, 'hsd1_tank'))
                                  }`}
                                />
                                <div className="text-xs text-gray-500 mt-0.5">{data.tank1Level.toLocaleString()} L</div>
                              </div>
                              
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs">HSD2 Tank ({(TANK_CAPACITIES.hsd2_tank/1000).toFixed(1)}KL)</span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    getTankFillColorClass(calculateTankFillPercentage(data.tank2Level, 'hsd2_tank'))
                                  }`}>
                                    {calculateTankFillPercentage(data.tank2Level, 'hsd2_tank').toFixed(1)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={calculateTankFillPercentage(data.tank2Level, 'hsd2_tank')}
                                  className={`h-2 ${
                                    getTankFillColorClass(calculateTankFillPercentage(data.tank2Level, 'hsd2_tank'))
                                  }`}
                                />
                                <div className="text-xs text-gray-500 mt-0.5">{data.tank2Level.toLocaleString()} L</div>
                              </div>
                            </>
                          )}
                          
                          {fuelType === 'POWER' && (
                            <div>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs">POWER Tank ({(TANK_CAPACITIES.power1_tank/1000).toFixed(1)}KL)</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                  getTankFillColorClass(calculateTankFillPercentage(data.tank1Level, 'power1_tank'))
                                }`}>
                                  {calculateTankFillPercentage(data.tank1Level, 'power1_tank').toFixed(1)}%
                                </span>
                              </div>
                              <Progress 
                                value={calculateTankFillPercentage(data.tank1Level, 'power1_tank')}
                                className={`h-2 ${
                                  getTankFillColorClass(calculateTankFillPercentage(data.tank1Level, 'power1_tank'))
                                }`}
                              />
                              <div className="text-xs text-gray-500 mt-0.5">{data.tank1Level.toLocaleString()} L</div>
                            </div>
                          )}
                          
                          <div className="mt-1 pt-1 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium">Total</span>
                              <span className={`text-xs font-bold ${
                                data.fillPercentage < 20 ? 'text-red-600' : 
                                data.fillPercentage < 40 ? 'text-orange-600' : 
                                'text-green-600'
                              }`}>
                                {data.fillPercentage.toFixed(1)}% full
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {data.totalLevel.toLocaleString()} L / {(data.totalCapacity/1000).toFixed(1)} KL capacity
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Date-wise Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Daily Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dateWiseData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No data available for the selected date range.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Sales</th>
                        <th className="text-left py-3 px-4 font-medium">Collections</th>
                        <th className="text-left py-3 px-4 font-medium">Variance</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateWiseData.map((dayData) => (
                        <tr key={dayData.date} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">
                            {new Date(dayData.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3 px-4">{formatCurrency(dayData.sales)}</td>
                          <td className="py-3 px-4">{formatCurrency(dayData.collections)}</td>
                          <td className={`py-3 px-4 font-medium ${
                            dayData.variance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(dayData.variance)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${
                              dayData.variance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {dayData.variance >= 0 ? 'Positive' : 'Negative'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HPCL Credit Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                HPCL Credit Outstanding Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hpclCreditData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No HPCL Credit data available for the selected date range.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-right py-3 px-4 font-medium">HPCL Outstanding (₹)</th>
                        <th className="text-right py-3 px-4 font-medium">Change from Previous</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hpclCreditData.map((entry, index) => {
                        const prevAmount = index > 0 ? hpclCreditData[index - 1].amount : entry.amount;
                        const change = entry.amount - prevAmount;
                        const changePercent = prevAmount !== 0 ? (change / prevAmount) * 100 : 0;
                        
                        return (
                          <tr key={entry.date} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{entry.formattedDate}</td>
                            <td className="py-3 px-4 text-right font-medium text-purple-600">
                              {formatCurrency(entry.amount)}
                            </td>
                            <td className={`py-3 px-4 text-right font-medium ${
                              index === 0 ? 'text-gray-400' : 
                              change >= 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {index === 0 ? '—' : 
                                `${change >= 0 ? '+' : ''}${formatCurrency(change)} 
                                (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Completeness */}
          <Card>
            <CardHeader>
              <CardTitle>Data Completeness Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{completionStatus.totalDays}</div>
                  <div className="text-sm text-gray-600">Total Days</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{completionStatus.completeDays}</div>
                  <div className="text-sm text-gray-600">Complete Days</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {completionStatus.completionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Complete days have both morning and night shift entries recorded.</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default Analytics

