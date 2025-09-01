import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, FileText, Package, Edit, X, Save, Droplet, Download, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from "@/components/ui/progress";

// Business constants and utilities - embedded directly to avoid import issues
const getBusinessDayFromDateTime = (currentDateTime) => {
  /**Get the business day (6 AM to 6 AM cycle) for any given datetime.*/
  const cutoffHour = 8;
  const cutoffMinute = 30;
  
  const current = new Date(currentDateTime);
  const cutoffToday = new Date(current.getFullYear(), current.getMonth(), current.getDate(), cutoffHour, cutoffMinute);
  
  if (current >= cutoffToday) {
    // After 8:30 AM today - business day is today
    return new Date(current.getFullYear(), current.getMonth(), current.getDate());
  } else {
    // Before 8:30 AM today - business day is yesterday
    const prevDay = new Date(current);
    prevDay.setDate(current.getDate() - 1);
    return new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate());
  }
};

const formatBusinessDayInfo = (businessDate) => {
  /**Format business day information for display.*/
  const startDateTime = new Date(businessDate);
  startDateTime.setHours(8, 30, 0, 0);
  
  const endDateTime = new Date(businessDate);
  endDateTime.setDate(businessDate.getDate() + 1);
  endDateTime.setHours(8, 30, 0, 0);
  
  return {
    businessDate: businessDate.toLocaleDateString('en-IN'),
    startTime: startDateTime.toLocaleString('en-IN'),
    endTime: endDateTime.toLocaleString('en-IN'),
    dayShiftPeriod: `${businessDate.toLocaleDateString('en-IN')} 8:30 AM - 8:30 PM`,
    nightShiftPeriod: `${businessDate.toLocaleDateString('en-IN')} 8:30 PM - ${endDateTime.toLocaleDateString('en-IN')} 8:30 AM`
  };
};

const AllDataView = () => {
  const [dailyEntries, setDailyEntries] = useState([]);
  const [procurementEntries, setProcurementEntries] = useState([]);
  const [tankReadings, setTankReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDailyEntry, setEditingDailyEntry] = useState(null);
  const [editingProcurementEntry, setEditingProcurementEntry] = useState(null);
  const [editingTankReading, setEditingTankReading] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [isDailyEntryModalOpen, setIsDailyEntryModalOpen] = useState(false);
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false);
  const [isTankReadingModalOpen, setIsTankReadingModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  // Tank capacities
  const tankCapacities = {
    hsd1_tank: 16000,
    hsd2_tank: 22000,
    ms1_tank: 9000,
    ms2_tank: 9000,
    power1_tank: 9000
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch all sets of data concurrently
      const [dailyRes, procurementRes, tankReadingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/daily-consolidation'),
        fetch('http://localhost:5000/api/procurement'),
        fetch('http://localhost:5000/api/tank-readings')
      ]);

      const dailyData = await dailyRes.json();
      const procurementData = await procurementRes.json();
      const tankReadingsData = await tankReadingsRes.json();

      if (dailyData.success) {
        setDailyEntries(dailyData.data);
      }
      if (procurementData.success) {
        setProcurementEntries(procurementData.data);
      }
      if (tankReadingsData.success) {
        setTankReadings(tankReadingsData.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);
  
  const handleEditDailyEntry = (entry) => {
    setEditingDailyEntry(entry);
    setEditFormData({ ...entry });
    setIsDailyEntryModalOpen(true);
  };
  
  const handleEditProcurementEntry = (entry) => {
    setEditingProcurementEntry(entry);
    setEditFormData({ ...entry });
    setIsProcurementModalOpen(true);
  };
  
  const handleEditTankReading = (reading) => {
    setEditingTankReading(reading);
    setEditFormData({ ...reading });
    setIsTankReadingModalOpen(true);
  };

  const handleDeleteItem = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete || !deleteType) return;

    setSaveLoading(true);
    try {
      let endpoint;
      
      switch (deleteType) {
        case 'daily':
          endpoint = `http://localhost:5000/api/daily-consolidation/${itemToDelete.id}`;
          break;
        case 'procurement':
          endpoint = `http://localhost:5000/api/procurement/${itemToDelete.id}`;
          break;
        case 'tank':
          endpoint = `http://localhost:5000/api/tank-readings/${itemToDelete.id}`;
          break;
        default:
          throw new Error('Invalid delete type');
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Refresh data to reflect the deletion throughout the system
        await fetchAllData();
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        setDeleteType(null);
        
        // Show success message
        alert(`${deleteType === 'daily' ? 'Daily entry' : deleteType === 'procurement' ? 'Procurement entry' : 'Tank reading'} deleted successfully`);
      } else {
        alert(`Error deleting ${deleteType}: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleInputChange = (field, value) => {
    setEditFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate amounts for daily entries if rate and quantity are changed
      if (editingDailyEntry) {
        if (field === 'ms_rate' || field === 'ms_quantity') {
          const ms_rate = parseFloat(field === 'ms_rate' ? value : updated.ms_rate) || 0;
          const ms_quantity = parseFloat(field === 'ms_quantity' ? value : updated.ms_quantity) || 0;
          updated.ms_amount = ms_rate * ms_quantity;
        }
        
        if (field === 'hsd_rate' || field === 'hsd_quantity') {
          const hsd_rate = parseFloat(field === 'hsd_rate' ? value : updated.hsd_rate) || 0;
          const hsd_quantity = parseFloat(field === 'hsd_quantity' ? value : updated.hsd_quantity) || 0;
          updated.hsd_amount = hsd_rate * hsd_quantity;
        }
        
        if (field === 'power_rate' || field === 'power_quantity') {
          const power_rate = parseFloat(field === 'power_rate' ? value : updated.power_rate) || 0;
          const power_quantity = parseFloat(field === 'power_quantity' ? value : updated.power_quantity) || 0;
          updated.power_amount = power_rate * power_quantity;
        }
      }
      
      // Auto-calculate total amount for procurement entries if rate and quantity are changed
      if (editingProcurementEntry) {
        if (field === 'rate' || field === 'quantity') {
          const rate = parseFloat(field === 'rate' ? value : updated.rate) || 0;
          const quantity = parseFloat(field === 'quantity' ? value : updated.quantity) || 0;
          updated.total_amount = rate * quantity;
        }
      }
      
      return updated;
    });
  };
  
  const handleSaveEdit = async () => {
    setSaveLoading(true);
    
    try {
      let endpoint, method, data;
      
      // Convert numeric fields to numbers
      const numericData = Object.fromEntries(
        Object.entries(editFormData).map(([key, value]) => {
          const numericFields = [
            'ms_rate', 'ms_quantity', 'ms_amount', 
            'hsd_rate', 'hsd_quantity', 'hsd_amount', 
            'power_rate', 'power_quantity', 'power_amount',
            'hsd1_tank', 'hsd2_tank', 'ms1_tank', 'ms2_tank', 'power1_tank',
            'total_outstanding', 'hpcl_payment', 'cash_collections', 'card_collections', 
            'paytm_collections', 'hp_transactions',
            'rate', 'quantity', 'total_amount'
          ];
          
          if (numericFields.includes(key)) {
            if (value === null || value === '' || value === undefined) {
              return [key, 0];
            }
            return [key, parseFloat(value)];
          }
          return [key, value];
        })
      );
      
      if (editingDailyEntry) {
        endpoint = `http://localhost:5000/api/daily-consolidation/${editingDailyEntry.id}`;
        method = 'PUT';
        data = numericData;
      } else if (editingProcurementEntry) {
        endpoint = `http://localhost:5000/api/procurement/${editingProcurementEntry.id}`;
        method = 'PUT';
        data = numericData;
      } else if (editingTankReading) {
        endpoint = `http://localhost:5000/api/tank-readings/${editingTankReading.id}`;
        method = 'PUT';
        data = numericData;
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh data
        fetchAllData();
        // Close edit mode
        setEditingDailyEntry(null);
        setEditingProcurementEntry(null);
        setEditingTankReading(null);
        setIsDailyEntryModalOpen(false);
        setIsProcurementModalOpen(false);
        setIsTankReadingModalOpen(false);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN');

  const formatShift = (shift) => {
    switch (shift) {
      case 'Day':
        return 'Day (8:30 AM - 8:30 PM)';
      case 'Night':
        return 'Night (8:30 PM - 8:30 AM)';
      default:
        return shift;
    }
  };

  const formatDateWithBusinessDay = (dateString) => {
    const date = new Date(dateString);
    const businessDay = getBusinessDayFromDateTime(date);
    const isBusinessDayDifferent = date.toDateString() !== businessDay.toDateString();
    
    if (isBusinessDayDifferent) {
      return `${formatDate(dateString)} (BD: ${businessDay.toLocaleDateString('en-IN')})`;
    }
    return formatDate(dateString);
  };

  // Export functions
  const exportToCSV = (data, filename, headers) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportDailyEntries = () => {
    const headers = [
      'id', 'date', 'shift', 'manager', 'ms_rate', 'ms_quantity', 'ms_amount',
      'hsd_rate', 'hsd_quantity', 'hsd_amount', 'power_rate', 'power_quantity', 'power_amount',
      'cash_collections', 'card_collections', 'paytm_collections', 'hp_transactions',
      'hpcl_payment', 'created_at'
    ];
    exportToCSV(dailyEntries, `daily_entries_${new Date().toISOString().split('T')[0]}.csv`, headers);
  };

  const exportProcurementEntries = () => {
    const headers = [
      'id', 'date', 'product', 'quantity', 'rate', 'amount', 'supplier', 'invoice_number', 'created_at'
    ];
    exportToCSV(procurementEntries, `procurement_entries_${new Date().toISOString().split('T')[0]}.csv`, headers);
  };

  const exportTankReadings = () => {
    const headers = [
      'id', 'date', 'hsd1_tank', 'hsd2_tank', 'ms1_tank', 'ms2_tank', 'power1_tank', 'created_at'
    ];
    exportToCSV(tankReadings, `tank_readings_${new Date().toISOString().split('T')[0]}.csv`, headers);
  };

  const exportAllData = () => {
    // Export all data types
    exportDailyEntries();
    setTimeout(() => exportProcurementEntries(), 500);
    setTimeout(() => exportTankReadings(), 1000);
  };

  const exportFromServer = (dataType) => {
    const url = `http://localhost:5000/api/export/${dataType}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dataType}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllFromServer = () => {
    const url = 'http://localhost:5000/api/export/all';
    const link = document.createElement('a');
    link.href = url;
    link.download = `petrol_station_data_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-4 text-gray-600">Loading All Data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Database className="h-8 w-8 text-gray-700" />
          <h2 className="text-3xl font-bold text-gray-900">All Recorded Data</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={exportAllData}
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export All (CSV)
          </Button>
          <Button 
            onClick={exportAllFromServer}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Export All (ZIP)
          </Button>
        </div>
      </div>

      {/* Daily Consolidation Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              Daily Consolidation Entries
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{dailyEntries.length} Records</Badge>
              <Button 
                onClick={() => exportFromServer('daily-consolidation')}
                size="sm"
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Server CSV
              </Button>
              <Button 
                onClick={exportDailyEntries}
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Local CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Shift</th>
                  <th className="text-left py-3 px-4 font-medium">Manager</th>
                  <th className="text-right py-3 px-4 font-medium">Total Sales (₹)</th>
                  <th className="text-right py-3 px-4 font-medium">Total Collections (₹)</th>
                  <th className="text-right py-3 px-4 font-medium">HPCL Payment (₹)</th>
                  <th className="text-right py-3 px-4 font-medium">Variance (₹)</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {dailyEntries.length > 0 ? (
                  dailyEntries.map(entry => {
                    const totalSales = entry.ms_amount + entry.hsd_amount + entry.power_amount;
                    const totalCollections = entry.cash_collections + entry.card_collections + entry.paytm_collections + entry.hp_transactions;
                    const variance = totalSales - totalCollections;
                    return (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDateWithBusinessDay(entry.date)}</td>
                        <td className="py-3 px-4">{formatShift(entry.shift)}</td>
                        <td className="py-3 px-4">{entry.manager}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(totalSales)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(totalCollections)}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(entry.hpcl_payment)}</td>
                        <td className={`py-3 px-4 text-right font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(variance)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button 
                              onClick={() => handleEditDailyEntry(entry)} 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              title="Edit Entry"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              onClick={() => handleDeleteItem(entry, 'daily')} 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="Delete Entry"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">No daily entries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tank Readings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Droplet className="h-5 w-5 mr-2 text-blue-600" />
              Tank Readings
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{tankReadings.length} Records</Badge>
              <Button 
                onClick={() => exportFromServer('tank-readings')}
                size="sm"
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Server CSV
              </Button>
              <Button 
                onClick={exportTankReadings}
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Local CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-center py-3 px-4 font-medium">HSD1</th>
                  <th className="text-center py-3 px-4 font-medium">HSD2</th>
                  <th className="text-center py-3 px-4 font-medium">MS1</th>
                  <th className="text-center py-3 px-4 font-medium">MS2</th>
                  <th className="text-center py-3 px-4 font-medium">POWER</th>
                  <th className="text-left py-3 px-4 font-medium">Notes</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tankReadings.length > 0 ? (
                  tankReadings.map(reading => {
                    const hsd1_percent = Math.min(100, Math.round((reading.hsd1_tank / tankCapacities.hsd1_tank) * 100));
                    const hsd2_percent = Math.min(100, Math.round((reading.hsd2_tank / tankCapacities.hsd2_tank) * 100));
                    const ms1_percent = Math.min(100, Math.round((reading.ms1_tank / tankCapacities.ms1_tank) * 100));
                    const ms2_percent = Math.min(100, Math.round((reading.ms2_tank / tankCapacities.ms2_tank) * 100));
                    const power1_percent = Math.min(100, Math.round((reading.power1_tank / tankCapacities.power1_tank) * 100));
                    
                    return (
                      <tr key={reading.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDateWithBusinessDay(reading.date)}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs">{reading.hsd1_tank.toLocaleString('en-IN')} L</span>
                            <span className="text-xs">{hsd1_percent}%</span>
                          </div>
                          <Progress value={hsd1_percent} className="h-2" 
                            style={{ backgroundColor: '#e5e7eb', 
                                    background: `linear-gradient(to right, 
                                                ${hsd1_percent < 20 ? '#ef4444' : hsd1_percent < 50 ? '#f59e0b' : '#22c55e'} 
                                                ${hsd1_percent}%, #e5e7eb ${hsd1_percent}%)` }} />
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs">{reading.hsd2_tank.toLocaleString('en-IN')} L</span>
                            <span className="text-xs">{hsd2_percent}%</span>
                          </div>
                          <Progress value={hsd2_percent} className="h-2" 
                            style={{ backgroundColor: '#e5e7eb', 
                                    background: `linear-gradient(to right, 
                                                ${hsd2_percent < 20 ? '#ef4444' : hsd2_percent < 50 ? '#f59e0b' : '#22c55e'} 
                                                ${hsd2_percent}%, #e5e7eb ${hsd2_percent}%)` }} />
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs">{reading.ms1_tank.toLocaleString('en-IN')} L</span>
                            <span className="text-xs">{ms1_percent}%</span>
                          </div>
                          <Progress value={ms1_percent} className="h-2" 
                            style={{ backgroundColor: '#e5e7eb', 
                                    background: `linear-gradient(to right, 
                                                ${ms1_percent < 20 ? '#ef4444' : ms1_percent < 50 ? '#f59e0b' : '#22c55e'} 
                                                ${ms1_percent}%, #e5e7eb ${ms1_percent}%)` }} />
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs">{reading.ms2_tank.toLocaleString('en-IN')} L</span>
                            <span className="text-xs">{ms2_percent}%</span>
                          </div>
                          <Progress value={ms2_percent} className="h-2" 
                            style={{ backgroundColor: '#e5e7eb', 
                                    background: `linear-gradient(to right, 
                                                ${ms2_percent < 20 ? '#ef4444' : ms2_percent < 50 ? '#f59e0b' : '#22c55e'} 
                                                ${ms2_percent}%, #e5e7eb ${ms2_percent}%)` }} />
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs">{reading.power1_tank.toLocaleString('en-IN')} L</span>
                            <span className="text-xs">{power1_percent}%</span>
                          </div>
                          <Progress value={power1_percent} className="h-2" 
                            style={{ backgroundColor: '#e5e7eb', 
                                    background: `linear-gradient(to right, 
                                                ${power1_percent < 20 ? '#ef4444' : power1_percent < 50 ? '#f59e0b' : '#22c55e'} 
                                                ${power1_percent}%, #e5e7eb ${power1_percent}%)` }} />
                        </td>
                        <td className="py-3 px-4 max-w-[150px] truncate">{reading.notes || '-'}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditTankReading(reading)}
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              title="Edit Tank Reading"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteItem(reading, 'tank')}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="Delete Tank Reading"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-gray-500">No tank readings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Procurement Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
             <div className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Procurement Entries
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{procurementEntries.length} Records</Badge>
              <Button 
                onClick={() => exportFromServer('procurement')}
                size="sm"
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Server CSV
              </Button>
              <Button 
                onClick={exportProcurementEntries}
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-1" />
                Local CSV
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Invoice #</th>
                  <th className="text-left py-3 px-4 font-medium">Invoice Date</th>
                  <th className="text-left py-3 px-4 font-medium">Fuel Type</th>
                  <th className="text-right py-3 px-4 font-medium">Quantity (L)</th>
                  <th className="text-right py-3 px-4 font-medium">Rate (₹/L)</th>
                  <th className="text-right py-3 px-4 font-medium">Total Amount (₹)</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {procurementEntries.length > 0 ? (
                  procurementEntries.map(entry => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{entry.invoice_number}</td>
                      <td className="py-3 px-4">{formatDateWithBusinessDay(entry.invoice_date)}</td>
                      <td className="py-3 px-4">{entry.fuel_type}</td>
                      <td className="py-3 px-4 text-right">{entry.quantity.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(entry.rate)}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(entry.total_amount)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button 
                            onClick={() => handleEditProcurementEntry(entry)} 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            title="Edit Procurement Entry"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={() => handleDeleteItem(entry, 'procurement')} 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            title="Delete Procurement Entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">No procurement entries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Daily Entry Dialog */}
      <Dialog open={!!editingDailyEntry} onOpenChange={(open) => !open && setEditingDailyEntry(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Daily Entry - {editingDailyEntry && formatDate(editingDailyEntry.date)}</DialogTitle>
          </DialogHeader>
          {editingDailyEntry && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={editFormData.date ? (editFormData.date.includes('T') ? editFormData.date.substring(0, 10) : editFormData.date) : ''}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shift</label>
                  <select
                    value={editFormData.shift || ''}
                    onChange={(e) => handleInputChange('shift', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="Day">Day Shift (8:30 AM - 8:30 PM)</option>
                    <option value="Night">Night Shift (8:30 PM - 8:30 AM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Manager</label>
                  <input
                    type="text"
                    value={editFormData.manager || ''}
                    onChange={(e) => handleInputChange('manager', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <h3 className="font-medium text-lg mt-2">Fuel Sales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">MS Rate (₹/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.ms_rate || ''}
                    onChange={(e) => handleInputChange('ms_rate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">MS Quantity (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.ms_quantity || ''}
                    onChange={(e) => handleInputChange('ms_quantity', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">MS Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.ms_amount || ''}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">HSD Rate (₹/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.hsd_rate || ''}
                    onChange={(e) => handleInputChange('hsd_rate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">HSD Quantity (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.hsd_quantity || ''}
                    onChange={(e) => handleInputChange('hsd_quantity', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">HSD Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.hsd_amount || ''}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">POWER Rate (₹/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.power_rate || ''}
                    onChange={(e) => handleInputChange('power_rate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">POWER Quantity (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.power_quantity || ''}
                    onChange={(e) => handleInputChange('power_quantity', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">POWER Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.power_amount || ''}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                </div>
              </div>

              <h3 className="font-medium text-lg mt-2">Fuel Tank Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">HSD1 Tank (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.hsd1_tank || ''}
                    onChange={(e) => handleInputChange('hsd1_tank', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">HSD2 Tank (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.hsd2_tank || ''}
                    onChange={(e) => handleInputChange('hsd2_tank', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">MS1 Tank (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.ms1_tank || ''}
                    onChange={(e) => handleInputChange('ms1_tank', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">MS2 Tank (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.ms2_tank || ''}
                    onChange={(e) => handleInputChange('ms2_tank', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">POWER1 Tank (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.power1_tank || ''}
                    onChange={(e) => handleInputChange('power1_tank', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <h3 className="font-medium text-lg mt-2">HPCL Credit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Total Outstanding (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.total_outstanding || ''}
                    onChange={(e) => handleInputChange('total_outstanding', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Made to HPCL Today (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.hpcl_payment || ''}
                    onChange={(e) => handleInputChange('hpcl_payment', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="0"
                  />
                </div>
              </div>

              <h3 className="font-medium text-lg mt-2">Collections</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cash Collections (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.cash_collections || ''}
                    onChange={(e) => handleInputChange('cash_collections', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Card Collections (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.card_collections || ''}
                    onChange={(e) => handleInputChange('card_collections', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Paytm Collections (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.paytm_collections || ''}
                    onChange={(e) => handleInputChange('paytm_collections', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">HP Transactions (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.hp_transactions || ''}
                    onChange={(e) => handleInputChange('hp_transactions', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Manager Notes</label>
                <textarea
                  value={editFormData.manager_notes || ''}
                  onChange={(e) => handleInputChange('manager_notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDailyEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saveLoading}>
              {saveLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Procurement Entry Dialog */}
      <Dialog open={!!editingProcurementEntry} onOpenChange={(open) => !open && setEditingProcurementEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Procurement Entry - Invoice #{editingProcurementEntry?.invoice_number}</DialogTitle>
          </DialogHeader>
          {editingProcurementEntry && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={editFormData.invoice_number || ''}
                    onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={editFormData.invoice_date ? (editFormData.invoice_date.includes('T') ? editFormData.invoice_date.substring(0, 10) : editFormData.invoice_date) : ''}
                    onChange={(e) => handleInputChange('invoice_date', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fuel Type</label>
                  <select
                    value={editFormData.fuel_type || ''}
                    onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="MS">MS (Petrol)</option>
                    <option value="HSD">HSD (Diesel)</option>
                    <option value="POWER">POWER (Premium)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    value={editFormData.vehicle_number || ''}
                    onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.quantity || ''}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rate (₹/L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.rate || ''}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.total_amount || ''}
                    readOnly
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <input
                  type="text"
                  value={editFormData.supplier || ''}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProcurementEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saveLoading}>
              {saveLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tank Reading Edit Dialog */}
      <Dialog open={isTankReadingModalOpen} onOpenChange={setIsTankReadingModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Tank Reading - {editingTankReading && formatDate(editingTankReading.date)}</DialogTitle>
          </DialogHeader>
          {editingTankReading && (
            <div className="grid gap-6 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={editFormData.date ? (editFormData.date.includes('T') ? editFormData.date.substring(0, 10) : editFormData.date) : ''}
                  readOnly
                  className="w-full px-3 py-2 border rounded-md bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">HSD1 Tank (L)</label>
                  <input
                    type="number"
                    step="1"
                    value={editFormData.hsd1_tank || ''}
                    onChange={(e) => handleInputChange('hsd1_tank', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <div className="mt-1 text-xs text-gray-500">Capacity: {tankCapacities.hsd1_tank.toLocaleString('en-IN')} L</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">HSD2 Tank (L)</label>
                  <input
                    type="number"
                    step="1"
                    value={editFormData.hsd2_tank || ''}
                    onChange={(e) => handleInputChange('hsd2_tank', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <div className="mt-1 text-xs text-gray-500">Capacity: {tankCapacities.hsd2_tank.toLocaleString('en-IN')} L</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">MS1 Tank (L)</label>
                  <input
                    type="number"
                    step="1"
                    value={editFormData.ms1_tank || ''}
                    onChange={(e) => handleInputChange('ms1_tank', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <div className="mt-1 text-xs text-gray-500">Capacity: {tankCapacities.ms1_tank.toLocaleString('en-IN')} L</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">MS2 Tank (L)</label>
                  <input
                    type="number"
                    step="1"
                    value={editFormData.ms2_tank || ''}
                    onChange={(e) => handleInputChange('ms2_tank', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <div className="mt-1 text-xs text-gray-500">Capacity: {tankCapacities.ms2_tank.toLocaleString('en-IN')} L</div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">POWER Tank (L)</label>
                  <input
                    type="number"
                    step="1"
                    value={editFormData.power1_tank || ''}
                    onChange={(e) => handleInputChange('power1_tank', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <div className="mt-1 text-xs text-gray-500">Capacity: {tankCapacities.power1_tank.toLocaleString('en-IN')} L</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={editFormData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTankReadingModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saveLoading}>
              {saveLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete this {deleteType === 'daily' ? 'daily entry' : deleteType === 'procurement' ? 'procurement entry' : 'tank reading'}?
            </p>
            {itemToDelete && (
              <div className="mt-3 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium">
                  {deleteType === 'daily' && `Date: ${formatDateWithBusinessDay(itemToDelete.date)} | Shift: ${formatShift(itemToDelete.shift)} | Manager: ${itemToDelete.manager}`}
                  {deleteType === 'procurement' && `Invoice: ${itemToDelete.invoice_number} | Date: ${formatDateWithBusinessDay(itemToDelete.invoice_date)} | ${itemToDelete.fuel_type}`}
                  {deleteType === 'tank' && `Date: ${formatDateWithBusinessDay(itemToDelete.date)} | Tank Reading Entry`}
                </p>
              </div>
            )}
            <p className="text-sm text-red-600 mt-2">
              <strong>Warning:</strong> This action cannot be undone and will be reflected throughout the entire system.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={saveLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              disabled={saveLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {saveLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllDataView;