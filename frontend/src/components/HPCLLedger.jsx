import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, FileText, RefreshCw, Download, TrendingUp, TrendingDown, Minus, Search, Filter, X } from 'lucide-react';

const HPCLLedger = () => {
  const [ledgerData, setLedgerData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [keyMetrics, setKeyMetrics] = useState({});
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [daysFilter, setDaysFilter] = useState(7); // Default filter: 7 days
  
  // Advanced filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [amountFilter, setAmountFilter] = useState({ min: '', max: '' });
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);

  // Function to fetch transaction ledger data
  const fetchLedgerData = async (days) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching transaction ledger data for ${days} days...`);
      const response = await fetch(`http://localhost:5000/api/hpcl-transaction-ledger?days=${days}`);
      
      // Log the response status
      console.log(`Response status: ${response.status}`);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      if (data.success) {
        console.log('Transaction ledger data received:', data);
        setLedgerData(data.transactions || []);
        setKeyMetrics(data.key_metrics || {});
        setSummary(data.summary || {});
      } else {
        console.error('API returned error:', data);
        throw new Error(data.message || data.error || 'Failed to fetch transaction ledger data');
      }
    } catch (err) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching transaction ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts or filter changes
  useEffect(() => {
    fetchLedgerData(daysFilter);
  }, [daysFilter]);

  // Filter data based on search and filter criteria
  useEffect(() => {
    let filtered = [...ledgerData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.details?.vehicle_number && transaction.details.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => {
        switch (typeFilter) {
          case 'collections':
            return transaction.description.includes('Daily Collections');
          case 'payments':
            return transaction.description.includes('Payment to HPCL');
          case 'procurement':
            return transaction.description.includes('Procurement');
          default:
            return true;
        }
      });
    }

    // Amount filter
    if (amountFilter.min || amountFilter.max) {
      filtered = filtered.filter(transaction => {
        const amount = transaction.debit || transaction.credit || 0;
        const min = amountFilter.min ? parseFloat(amountFilter.min) : 0;
        const max = amountFilter.max ? parseFloat(amountFilter.max) : Infinity;
        return amount >= min && amount <= max;
      });
    }

    // Date filter
    if (dateFilter.start || dateFilter.end) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const startDate = dateFilter.start ? new Date(dateFilter.start) : new Date('1900-01-01');
        const endDate = dateFilter.end ? new Date(dateFilter.end) : new Date('2100-12-31');
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    setFilteredData(filtered);
  }, [ledgerData, searchTerm, typeFilter, amountFilter, dateFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setAmountFilter({ min: '', max: '' });
    setDateFilter({ start: '', end: '' });
  };

  // Check if any filters are active
  const hasActiveFilters = searchTerm || typeFilter !== 'all' || amountFilter.min || amountFilter.max || dateFilter.start || dateFilter.end;

  // Calculate totals for filtered data
  const calculateFilteredTotals = () => {
    const dataToCalculate = filteredData.length > 0 ? filteredData : ledgerData;
    return {
      totalDebit: dataToCalculate.reduce((sum, transaction) => sum + (transaction.debit || 0), 0),
      totalCredit: dataToCalculate.reduce((sum, transaction) => sum + (transaction.credit || 0), 0),
      totalCollections: dataToCalculate.reduce((sum, transaction) => sum + (transaction.total_collections || 0), 0),
      count: dataToCalculate.length
    };
  };

  const filteredTotals = calculateFilteredTotals();
  
  // Format currency (Indian Rupees)
  const formatCurrency = (amount) => {
    // Handle null, undefined, NaN, or non-numeric values
    if (amount === null || amount === undefined || isNaN(amount) || amount === '') {
      return '₹0';
    }
    
    // Convert to number and handle invalid values
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return '₹0';
    }
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numAmount);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Export to CSV function
  const exportToCSV = () => {
    const dataToExport = filteredData.length > 0 ? filteredData : ledgerData;
    const headers = ['Date', 'Description', 'Debit (Procurement of MS&HSD&PWR)', 'Credit (Transactions made to HPCL account (R111))', 'Shift Collections (MS&HSD&PWR Sales)', 'Reported Balance'];
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(transaction => [
        transaction.date,
        `"${transaction.description}"`,
        transaction.debit || '',
        transaction.credit || '',
        transaction.total_collections || 0,
        transaction.reported_balance || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const filterSuffix = hasActiveFilters ? '_filtered' : '';
      link.setAttribute('download', `hpcl_transaction_ledger_${daysFilter}days${filterSuffix}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Get trend icon for net change
  const getTrendIcon = (netChange) => {
    if (netChange > 0) return <TrendingUp className="w-4 h-4 text-red-600" />;
    if (netChange < 0) return <TrendingDown className="w-4 h-4 text-green-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="container p-4">
      <h1 className="text-2xl font-bold mb-6">HPCL Transaction Ledger</h1>
      
      {/* Filter buttons and search */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-medium">Show transactions from last:</span>
          {[7, 15, 30, 60, 90].map((days) => (
            <Button 
              key={days}
              variant={daysFilter === days ? "default" : "outline"}
              className={daysFilter === days ? "bg-orange-500 hover:bg-orange-600" : ""}
              onClick={() => setDaysFilter(days)}
            >
              {days} days
            </Button>
          ))}
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={() => fetchLedgerData(daysFilter)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            className="ml-2"
            onClick={exportToCSV}
            disabled={filteredData.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export to Sheets
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`${hasActiveFilters ? 'bg-orange-100 border-orange-300' : ''}`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters {hasActiveFilters && `(${[searchTerm, typeFilter !== 'all', amountFilter.min, amountFilter.max, dateFilter.start, dateFilter.end].filter(Boolean).length})`}
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-4">
              {/* Transaction Type Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Transaction Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="collections">Daily Collections</SelectItem>
                    <SelectItem value="payments">Payments to HPCL</SelectItem>
                    <SelectItem value="procurement">Procurement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Amount Range (₹)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={amountFilter.min}
                    onChange={(e) => setAmountFilter(prev => ({ ...prev, min: e.target.value }))}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={amountFilter.max}
                    onChange={(e) => setAmountFilter(prev => ({ ...prev, max: e.target.value }))}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                    className="text-xs"
                  />
                  <Input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  <div>Showing {filteredData.length} of {ledgerData.length}</div>
                  <div>transactions</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Key Metrics Section */}
      {Object.keys(keyMetrics).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Key Metrics (Last {keyMetrics.period_days} Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-1">Total Procured on Credit</h3>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(keyMetrics.total_procured)}</p>
                <p className="text-xs text-blue-600 mt-1">New debt taken on</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-sm font-medium text-green-800 mb-1">Total Payments Made</h3>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(keyMetrics.total_payments)}</p>
                <p className="text-xs text-green-600 mt-1">Debt cleared</p>
              </div>
              
              <div className={`p-4 rounded-lg border ${keyMetrics.net_change >= 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <h3 className={`text-sm font-medium mb-1 ${keyMetrics.net_change >= 0 ? 'text-red-800' : 'text-green-800'}`}>
                  Net Change in Credit
                </h3>
                <div className="flex items-center">
                  {getTrendIcon(keyMetrics.net_change)}
                  <p className={`text-2xl font-bold ml-2 ${keyMetrics.net_change >= 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {formatCurrency(Math.abs(keyMetrics.net_change))}
                  </p>
                </div>
                <p className={`text-xs mt-1 ${keyMetrics.net_change >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {keyMetrics.net_change >= 0 ? 'Debt increasing' : 'Debt decreasing'}
                </p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="text-sm font-medium text-orange-800 mb-1">Average Daily Procurement</h3>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(keyMetrics.avg_daily_procurement)}</p>
                <p className="text-xs text-orange-600 mt-1">Forecast future needs</p>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-1">Reported Balance (Manual Entry)</h4>
                <p className="text-xl font-bold text-gray-900">
                  {keyMetrics.reported_balance ? formatCurrency(keyMetrics.reported_balance) : 'Not Available'}
                </p>
                <p className="text-xs text-gray-600 mt-1">From daily entry form</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Total Transactions</h4>
                <p className="text-xl font-bold text-blue-900">{ledgerData.length}</p>
                <p className="text-xs text-blue-600 mt-1">In selected period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Filtered Data Summary */}
      {ledgerData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>
                Current View Summary
                {hasActiveFilters && (
                  <Badge variant="outline" className="ml-2 bg-orange-100 text-orange-800">
                    Filtered Results
                  </Badge>
                )}
              </span>
              <span className="text-sm font-normal text-gray-600">
                {filteredData.length} of {ledgerData.length} transactions
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="text-sm font-medium text-red-800 mb-1">Total Debit</h3>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(filteredTotals.totalDebit)}</p>
                <p className="text-xs text-red-600 mt-1">Procurement of MS&HSD&PWR</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-sm font-medium text-green-800 mb-1">Total Credit</h3>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(filteredTotals.totalCredit)}</p>
                <p className="text-xs text-green-600 mt-1">Transactions to HPCL (R111)</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="text-sm font-medium text-purple-800 mb-1">Total Collections</h3>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(filteredTotals.totalCollections)}</p>
                <p className="text-xs text-purple-600 mt-1">MS&HSD&PWR Sales</p>
              </div>
              
              <div className={`p-4 rounded-lg border ${filteredTotals.totalDebit - filteredTotals.totalCredit >= 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <h3 className={`text-sm font-medium mb-1 ${filteredTotals.totalDebit - filteredTotals.totalCredit >= 0 ? 'text-red-800' : 'text-green-800'}`}>
                  Net Impact
                </h3>
                <div className="flex items-center">
                  {getTrendIcon(filteredTotals.totalDebit - filteredTotals.totalCredit)}
                  <p className={`text-2xl font-bold ml-2 ${filteredTotals.totalDebit - filteredTotals.totalCredit >= 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {formatCurrency(Math.abs(filteredTotals.totalDebit - filteredTotals.totalCredit))}
                  </p>
                </div>
                <p className={`text-xs mt-1 ${filteredTotals.totalDebit - filteredTotals.totalCredit >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {filteredTotals.totalDebit - filteredTotals.totalCredit >= 0 ? 'Net increase in debt' : 'Net decrease in debt'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Ledger Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Transaction Ledger - Individual Transactions</span>
            {loading && (
              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                Loading...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2 border-b border-gray-200">Date</th>
                  <th className="px-4 py-2 border-b border-gray-200">Description</th>
                  <th className="px-4 py-2 border-b border-gray-200">Debit (Procurement of MS&HSD&PWR)</th>
                  <th className="px-4 py-2 border-b border-gray-200">Credit (Transactions made to HPCL account (R111))</th>
                  <th className="px-4 py-2 border-b border-gray-200">Shift Collections (MS&HSD&PWR Sales)</th>
                  <th className="px-4 py-2 border-b border-gray-200">HPCL Outstanding Balance (Manual)</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 && !loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      {ledgerData.length === 0 ? 
                        "No transaction data available for the selected period" : 
                        "No transactions match your current filters"
                      }
                      {hasActiveFilters && ledgerData.length > 0 && (
                        <div className="mt-2">
                          <Button variant="outline" size="sm" onClick={clearFilters}>
                            Clear filters to see all {ledgerData.length} transactions
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((transaction, index) => (
                    <tr 
                      key={`${transaction.date}-${transaction.reference}-${index}`} 
                      className={index % 2 === 0 ? "bg-background" : "bg-background-accent"}
                    >
                      <td className="px-4 py-3 border-b border-custom font-medium text-primary">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-4 py-3 border-b border-custom text-primary">
                        <div>
                          <span className="font-medium">{transaction.description}</span>
                          {transaction.type === 'procurement' && transaction.details && (
                            <div className="text-xs text-gray-500 mt-1">
                              Vehicle: {transaction.details.vehicle_number} | Rate: ₹{transaction.details.rate}/L
                            </div>
                          )}
                          {transaction.type === 'daily_collections' && transaction.details && (
                            <div className="text-xs text-gray-500 mt-1">
                              Cash: {formatCurrency(transaction.details.cash_collections || 0)} | 
                              Card: {formatCurrency(transaction.details.card_collections || 0)} | 
                              Paytm: {formatCurrency(transaction.details.paytm_collections || 0)} | 
                              HP: {formatCurrency(transaction.details.hp_transactions || 0)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-custom">
                        {transaction.debit > 0 ? (
                          <span className="font-medium text-red-600">{formatCurrency(transaction.debit)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b border-custom">
                        {transaction.credit > 0 ? (
                          <span className="font-medium text-green-600">{formatCurrency(transaction.credit)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b border-custom font-medium text-purple-600">
                        {transaction.total_collections !== null && transaction.total_collections !== undefined && transaction.total_collections > 0 ? (
                          <>
                            {formatCurrency(transaction.total_collections)}
                            <div className="text-xs text-gray-500 mt-1">
                              {transaction.type === 'daily_collections' ? 'Shift Collections' : 'Daily Collections'}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400">₹0.00</span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-b border-custom font-medium" style={{ color: '#0F4645' }}>
                        {transaction.reported_balance !== null ? formatCurrency(transaction.reported_balance) : (
                          <span className="text-gray-400">No Entry</span>
                        )}
                        <div className="text-xs text-gray-500 mt-1">Manual HPCL Outstanding</div>
                      </td>
                    </tr>
                  ))
                )}
                
                {/* Totals Row */}
                {filteredData.length > 0 && (
                  <tr className="bg-gray-100 border-t-2 border-gray-300 font-semibold">
                    <td className="px-4 py-4 border-b border-custom text-gray-800">
                      <div className="flex items-center">
                        <span className="font-bold">TOTALS</span>
                        {hasActiveFilters && (
                          <Badge variant="outline" className="ml-2 text-xs bg-orange-100 text-orange-800">
                            Filtered
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-b border-custom text-gray-600 text-sm">
                      {filteredTotals.count} transactions
                      {hasActiveFilters && ledgerData.length !== filteredData.length && (
                        <div className="text-xs text-gray-500">
                          (of {ledgerData.length} total)
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 border-b border-custom">
                      <span className="font-bold text-red-700 text-lg">
                        {formatCurrency(filteredTotals.totalDebit)}
                      </span>
                      <div className="text-xs text-red-600">Procurement of MS&HSD&PWR</div>
                    </td>
                    <td className="px-4 py-4 border-b border-custom">
                      <span className="font-bold text-green-700 text-lg">
                        {formatCurrency(filteredTotals.totalCredit)}
                      </span>
                      <div className="text-xs text-green-600">Transactions to HPCL (R111)</div>
                    </td>
                    <td className="px-4 py-4 border-b border-custom">
                      <span className="font-bold text-purple-700 text-lg">
                        {formatCurrency(filteredTotals.totalCollections)}
                      </span>
                      <div className="text-xs text-purple-600">MS&HSD&PWR Sales</div>
                    </td>
                    <td className="px-4 py-4 border-b border-custom text-gray-600 text-sm">
                      <div className="font-medium">Net Impact:</div>
                      <div className={`text-sm ${filteredTotals.totalDebit - filteredTotals.totalCredit >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {filteredTotals.totalDebit - filteredTotals.totalCredit >= 0 ? '+' : ''}{formatCurrency(filteredTotals.totalDebit - filteredTotals.totalCredit)}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          {Object.keys(summary).length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Transaction Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Transactions:</span>
                  <span className="font-medium ml-2">{summary.total_transactions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Procurement Entries:</span>
                  <span className="font-medium ml-2 text-red-600">{summary.procurement_transactions}</span>
                </div>
                <div>
                  <span className="text-gray-600">Payment Entries:</span>
                  <span className="font-medium ml-2 text-green-600">{summary.payment_transactions}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Note:</strong> This transaction ledger shows every individual shift collection and transaction that affects your HPCL credit.
              Procurement invoices increase your credit outstanding (Debit), while payments to HPCL reduce it (Credit).
            </p>
            <p className="mb-2">
              <strong>Collections:</strong> 
              <span className="text-purple-600 font-medium"> Grand Total Collections</span> = Individual shift collections (Day/Night) showing Cash + Card + Paytm + HP amounts for each shift
            </p>
            <p className="mb-2">
              <strong>Balance Type:</strong> 
              <span className="font-medium" style={{ color: '#0F4645' }}> HPCL Outstanding Balance</span> = The manual HPCL outstanding balance you enter in the daily data entry form (Total Outstanding field)
            </p>
            <p>
              <strong>Key:</strong> 
              <span className="text-red-600 font-medium"> Debit</span> = Credit Increased (New Debt) | 
              <span className="text-green-600 font-medium"> Credit</span> = Credit Reduced (Debt Paid) | 
              <span className="text-purple-600 font-medium"> Collections</span> = Individual Shift Amounts
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HPCLLedger;
