import React, { useState, useEffect } from 'react';
import { Plus, User, TrendingUp, TrendingDown, Eye, Download, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

const CustomerCredit = () => {
  const [customers, setCustomers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [showNewTransactionForm, setShowNewTransactionForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    customer_name: '',
    date: new Date().toISOString().split('T')[0],
    fuel_type: '',
    quantity: '',
    rate: '',
    total_amount: '',
    transaction_type: 'sale',
    notes: ''
  });

  useEffect(() => {
    fetchCustomerOverview();
    fetchRecentTransactions();
  }, []);

  // Export functions
  const exportCustomerCreditData = () => {
    const exportData = [];
    
    // Add customer overview data
    customers.forEach(customer => {
      exportData.push({
        customer_name: customer.customer_name,
        total_credit: customer.total_credit,
        transaction_count: customer.transaction_count,
        last_transaction: customer.last_transaction,
        type: 'overview'
      });
    });
    
    // Add recent transactions
    recentTransactions.forEach(transaction => {
      exportData.push({
        ...transaction,
        type: 'transaction'
      });
    });
    
    const headers = [
      'customer_name', 'date', 'transaction_type', 'fuel_type', 'quantity', 
      'rate', 'amount', 'balance', 'notes', 'total_credit', 'transaction_count', 
      'last_transaction', 'type'
    ];
    
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => {
        const value = row[header] || '';
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer_credit_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportFromServer = () => {
    const url = 'http://localhost:5000/api/export/customer-credit';
    const link = document.createElement('a');
    link.href = url;
    link.download = `customer_credit_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchCustomerOverview = async () => {
    try {
      const response = await fetch('/api/customer-credit/overview');
      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.customers);
        setSummary(data.summary);
      } else {
        setError(data.message || 'Failed to fetch customer overview');
      }
    } catch (err) {
      setError('Network error while fetching customer data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch('/api/customer-credit/recent');
      const data = await response.json();
      
      if (data.success) {
        setRecentTransactions(data.transactions);
      }
    } catch (err) {
      console.error('Error fetching recent transactions:', err);
    }
  };

  const fetchCustomerHistory = async (customerName) => {
    try {
      const response = await fetch(`/api/customer-credit/history/${encodeURIComponent(customerName)}`);
      const data = await response.json();
      
      if (data.success) {
        setCustomerHistory(data.transactions);
        setSelectedCustomer({ 
          name: customerName, 
          summary: data.summary 
        });
      } else {
        setError(data.message || 'Failed to fetch customer history');
      }
    } catch (err) {
      setError('Network error while fetching customer history');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        rate: parseFloat(formData.rate),
        total_amount: parseFloat(formData.total_amount)
      };

      const response = await fetch('/api/customer-credit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setFormData({
          customer_name: '',
          date: new Date().toISOString().split('T')[0],
          fuel_type: '',
          quantity: '',
          rate: '',
          total_amount: '',
          transaction_type: 'sale',
          notes: ''
        });
        
        setShowNewTransactionForm(false);
        
        // Refresh data
        fetchCustomerOverview();
        fetchRecentTransactions();
        
        setError('');
      } else {
        setError(data.message || 'Failed to create transaction');
      }
    } catch (err) {
      setError('Network error while creating transaction');
    }
  };

  const calculateAmount = () => {
    const quantity = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.rate) || 0;
    const total = quantity * rate;
    setFormData(prev => ({ ...prev, total_amount: total.toFixed(2) }));
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN');

  const exportCustomerData = (customerName) => {
    const customer = customers.find(c => c.customer_name === customerName);
    if (!customer) return;
    
    const csvContent = `Customer Credit Report - ${customerName}\n` +
      `Generated on: ${new Date().toLocaleDateString('en-IN')}\n\n` +
      `Outstanding Balance: ${formatCurrency(customer.outstanding_balance)}\n` +
      `Total Sales: ${formatCurrency(customer.total_sales)}\n` +
      `Total Payments: ${formatCurrency(customer.total_payments)}\n` +
      `Last Transaction: ${customer.last_transaction_date ? formatDate(customer.last_transaction_date) : 'N/A'}\n\n`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-credit-${customerName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading customer credit data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: '#EEEDE4', minHeight: '100vh', padding: '1.5rem' }}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: '#792E35' }}>Customer Credit Management</h1>
          <p className="text-gray-600 mt-1">Track customer receivables and credit sales</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={exportFromServer}
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export (Server)
          </Button>
          <Button 
            onClick={exportCustomerCreditData}
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export (Local)
          </Button>
          <Button 
            onClick={() => setShowNewTransactionForm(true)}
            style={{ backgroundColor: '#0F4645', borderColor: '#0F4645' }}
            className="hover:bg-opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      {error && (
        <Alert style={{ backgroundColor: '#f8d7da', borderColor: '#f5c6cb', color: '#721c24' }}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card style={{ backgroundColor: '#CAB3A0', borderColor: '#BAD5D4' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#0F4645' }}>Total Outstanding</p>
                <p className="text-2xl font-bold" style={{ color: '#792E35' }}>
                  {formatCurrency(summary.total_outstanding || 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8" style={{ color: '#D4915D' }} />
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#BAD5D4', borderColor: '#CAB3A0' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#0F4645' }}>Total Customers</p>
                <p className="text-2xl font-bold" style={{ color: '#792E35' }}>
                  {summary.total_customers || 0}
                </p>
              </div>
              <User className="w-8 h-8" style={{ color: '#D4915D' }} />
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#CAB3A0', borderColor: '#BAD5D4' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#0F4645' }}>Customers with Debt</p>
                <p className="text-2xl font-bold" style={{ color: '#792E35' }}>
                  {summary.customers_with_debt || 0}
                </p>
              </div>
              <CreditCard className="w-8 h-8" style={{ color: '#D4915D' }} />
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: '#BAD5D4', borderColor: '#CAB3A0' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#0F4645' }}>Avg Outstanding</p>
                <p className="text-2xl font-bold" style={{ color: '#792E35' }}>
                  {formatCurrency(summary.avg_outstanding_per_customer || 0)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8" style={{ color: '#D4915D' }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList style={{ backgroundColor: '#CAB3A0' }}>
          <TabsTrigger value="overview" style={{ color: '#0F4645' }}>Customer Overview</TabsTrigger>
          <TabsTrigger value="recent" style={{ color: '#0F4645' }}>Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card style={{ backgroundColor: 'white', borderColor: '#BAD5D4' }}>
            <CardHeader>
              <CardTitle style={{ color: '#792E35' }}>Customer Outstanding Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#F8F9FA' }}>
                      <th className="text-left p-3 font-medium" style={{ color: '#0F4645' }}>Customer Name</th>
                      <th className="text-right p-3 font-medium" style={{ color: '#0F4645' }}>Outstanding Balance</th>
                      <th className="text-right p-3 font-medium" style={{ color: '#0F4645' }}>Total Sales</th>
                      <th className="text-right p-3 font-medium" style={{ color: '#0F4645' }}>Total Payments</th>
                      <th className="text-center p-3 font-medium" style={{ color: '#0F4645' }}>Last Transaction</th>
                      <th className="text-center p-3 font-medium" style={{ color: '#0F4645' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.customer_name} className="border-t border-gray-200">
                        <td className="p-3">
                          <div className="font-medium" style={{ color: '#792E35' }}>
                            {customer.customer_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {customer.transaction_count} transactions
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Badge
                            variant={customer.outstanding_balance > 0 ? "destructive" : "success"}
                            style={{
                              backgroundColor: customer.outstanding_balance > 0 ? '#792E35' : '#0F4645',
                              color: 'white'
                            }}
                          >
                            {formatCurrency(customer.outstanding_balance)}
                          </Badge>
                        </td>
                        <td className="p-3 text-right text-gray-700">
                          {formatCurrency(customer.total_sales)}
                        </td>
                        <td className="p-3 text-right text-gray-700">
                          {formatCurrency(customer.total_payments)}
                        </td>
                        <td className="p-3 text-center text-gray-600">
                          {customer.last_transaction_date ? formatDate(customer.last_transaction_date) : 'N/A'}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => fetchCustomerHistory(customer.customer_name)}
                              style={{ borderColor: '#0F4645', color: '#0F4645' }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => exportCustomerData(customer.customer_name)}
                              style={{ borderColor: '#D4915D', color: '#D4915D' }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card style={{ backgroundColor: 'white', borderColor: '#BAD5D4' }}>
            <CardHeader>
              <CardTitle style={{ color: '#792E35' }}>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#F8F9FA' }}>
                      <th className="text-left p-3 font-medium" style={{ color: '#0F4645' }}>Date</th>
                      <th className="text-left p-3 font-medium" style={{ color: '#0F4645' }}>Customer</th>
                      <th className="text-left p-3 font-medium" style={{ color: '#0F4645' }}>Type</th>
                      <th className="text-left p-3 font-medium" style={{ color: '#0F4645' }}>Fuel</th>
                      <th className="text-right p-3 font-medium" style={{ color: '#0F4645' }}>Quantity</th>
                      <th className="text-right p-3 font-medium" style={{ color: '#0F4645' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-t border-gray-200">
                        <td className="p-3 text-gray-600">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="p-3">
                          <div className="font-medium" style={{ color: '#792E35' }}>
                            {transaction.customer_name}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={transaction.transaction_type === 'sale' ? "default" : "secondary"}
                            style={{
                              backgroundColor: transaction.transaction_type === 'sale' ? '#D4915D' : '#0F4645',
                              color: 'white'
                            }}
                          >
                            {transaction.transaction_type === 'sale' ? 'Credit Sale' : 'Payment'}
                          </Badge>
                        </td>
                        <td className="p-3 text-gray-700">
                          {transaction.fuel_type || 'N/A'}
                        </td>
                        <td className="p-3 text-right text-gray-700">
                          {transaction.quantity ? `${transaction.quantity} L` : 'N/A'}
                        </td>
                        <td className="p-3 text-right">
                          <span style={{ color: transaction.transaction_type === 'sale' ? '#792E35' : '#0F4645' }}>
                            {formatCurrency(transaction.total_amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Customer History Modal */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle style={{ color: '#792E35' }}>
                {selectedCustomer.name} - Transaction History
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Customer Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded" style={{ backgroundColor: '#F8F9FA' }}>
                  <div className="text-sm text-gray-600">Current Balance</div>
                  <div className="font-bold" style={{ color: '#792E35' }}>
                    {formatCurrency(selectedCustomer.summary?.current_balance || 0)}
                  </div>
                </div>
                <div className="text-center p-3 rounded" style={{ backgroundColor: '#F8F9FA' }}>
                  <div className="text-sm text-gray-600">Total Sales</div>
                  <div className="font-bold" style={{ color: '#D4915D' }}>
                    {formatCurrency(selectedCustomer.summary?.total_sales || 0)}
                  </div>
                </div>
                <div className="text-center p-3 rounded" style={{ backgroundColor: '#F8F9FA' }}>
                  <div className="text-sm text-gray-600">Total Payments</div>
                  <div className="font-bold" style={{ color: '#0F4645' }}>
                    {formatCurrency(selectedCustomer.summary?.total_payments || 0)}
                  </div>
                </div>
                <div className="text-center p-3 rounded" style={{ backgroundColor: '#F8F9FA' }}>
                  <div className="text-sm text-gray-600">Transactions</div>
                  <div className="font-bold" style={{ color: '#792E35' }}>
                    {selectedCustomer.summary?.transaction_count || 0}
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ backgroundColor: '#F8F9FA' }}>
                      <th className="text-left p-2 font-medium" style={{ color: '#0F4645' }}>Date</th>
                      <th className="text-left p-2 font-medium" style={{ color: '#0F4645' }}>Type</th>
                      <th className="text-left p-2 font-medium" style={{ color: '#0F4645' }}>Fuel</th>
                      <th className="text-right p-2 font-medium" style={{ color: '#0F4645' }}>Quantity</th>
                      <th className="text-right p-2 font-medium" style={{ color: '#0F4645' }}>Amount</th>
                      <th className="text-right p-2 font-medium" style={{ color: '#0F4645' }}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerHistory.map((transaction) => (
                      <tr key={transaction.id} className="border-t border-gray-200">
                        <td className="p-2 text-sm text-gray-600">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="p-2">
                          <Badge
                            size="sm"
                            variant={transaction.transaction_type === 'sale' ? "default" : "secondary"}
                            style={{
                              backgroundColor: transaction.transaction_type === 'sale' ? '#D4915D' : '#0F4645',
                              color: 'white'
                            }}
                          >
                            {transaction.transaction_type === 'sale' ? 'Sale' : 'Payment'}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm text-gray-700">
                          {transaction.fuel_type || 'N/A'}
                        </td>
                        <td className="p-2 text-right text-sm text-gray-700">
                          {transaction.quantity ? `${transaction.quantity} L` : 'N/A'}
                        </td>
                        <td className="p-2 text-right text-sm">
                          <span style={{ color: transaction.transaction_type === 'sale' ? '#792E35' : '#0F4645' }}>
                            {formatCurrency(transaction.total_amount)}
                          </span>
                        </td>
                        <td className="p-2 text-right text-sm font-medium">
                          <span style={{ color: transaction.running_balance >= 0 ? '#792E35' : '#0F4645' }}>
                            {formatCurrency(transaction.running_balance)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* New Transaction Form Modal */}
      {showNewTransactionForm && (
        <Dialog open={showNewTransactionForm} onOpenChange={setShowNewTransactionForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle style={{ color: '#792E35' }}>New Customer Credit Transaction</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="transaction_type">Transaction Type</Label>
                <Select 
                  value={formData.transaction_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, transaction_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Credit Sale</SelectItem>
                    <SelectItem value="payment">Payment Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.transaction_type === 'sale' && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fuel_type">Fuel Type</Label>
                      <Select 
                        value={formData.fuel_type} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, fuel_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MS">MS (Petrol)</SelectItem>
                          <SelectItem value="HSD">HSD (Diesel)</SelectItem>
                          <SelectItem value="POWER">Power (Premium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity">Quantity (L)</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        onBlur={calculateAmount}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="rate">Rate (₹/L)</Label>
                      <Input
                        id="rate"
                        type="number"
                        step="0.01"
                        value={formData.rate}
                        onChange={(e) => setFormData(prev => ({ ...prev, rate: e.target.value }))}
                        onBlur={calculateAmount}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="total_amount">Total Amount (₹)</Label>
                <Input
                  id="total_amount"
                  type="number"
                  step="0.01"
                  value={formData.total_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewTransactionForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  style={{ backgroundColor: '#0F4645', borderColor: '#0F4645' }}
                  className="hover:bg-opacity-90"
                >
                  Create Transaction
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomerCredit;
