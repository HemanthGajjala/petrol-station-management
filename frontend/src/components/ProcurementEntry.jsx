import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Package, Calculator, Trash2, Download, Upload, FileSpreadsheet } from 'lucide-react';

const ProcurementEntry = ({ selectedDate }) => {
  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_date: selectedDate,
    fuel_type: 'HSD',
    quantity: '',
    rate: '',
    total_amount: 0,
    vehicle_number: '',
    supplier: 'HPCL'
  });

  const [procurementList, setProcurementList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef(null);

  // This function will run when the component loads and when selectedDate changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, invoice_date: selectedDate }));
    fetchProcurementData();
  }, [selectedDate]);

  const fetchProcurementData = async () => {
    try {
      // Use the 'selectedDate' prop directly, as it's always up to date
      const response = await fetch(`http://localhost:5000/api/procurement?start_date=${selectedDate}&end_date=${selectedDate}`);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      
      if (result.success) {
        setProcurementList(result.data || []); // Ensure it's always an array
      } else {
        throw new Error(result.error || "Failed to fetch procurement data.");
      }
    } catch (error) {
      console.error('Error fetching procurement data:', error);
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total amount
      if (field === 'rate' || field === 'quantity') {
        const rate = parseFloat(updated.rate) || 0;
        const quantity = parseFloat(updated.quantity) || 0;
        updated.total_amount = rate * quantity;
      }
      
      return updated;
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const dataToSend = {
      ...formData,
      quantity: parseFloat(formData.quantity) || 0,
      rate: parseFloat(formData.rate) || 0,
      total_amount: parseFloat(formData.total_amount) || 0,
    };

    try {
      const response = await fetch('http://localhost:5000/api/procurement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('Procurement entry saved successfully!');
        setFormData({
          invoice_number: '',
          invoice_date: selectedDate,
          fuel_type: 'HSD',
          quantity: '',
          rate: '',
          total_amount: 0,
          vehicle_number: '',
          supplier: 'HPCL'
        });
        fetchProcurementData();
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this procurement entry?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/procurement/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('Procurement entry deleted successfully!');
        fetchProcurementData();
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const formatCurrency = (amount) => {
    const number = Number(amount);
    if (isNaN(number)) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(number);
  };

  const getTotalProcurement = () => {
    return procurementList.reduce((total, item) => total + item.total_amount, 0);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/procurement/template');
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `procurement_template_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage('Template downloaded successfully!');
    } catch (error) {
      setMessage(`Error downloading template: ${error.message}`);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/procurement/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadMessage(result.message);
        if (result.error_details && result.error_details.length > 0) {
          const errorSummary = result.error_details.map(err => 
            `Row ${err.row}: ${err.error}`
          ).join('\n');
          setUploadMessage(prev => prev + '\n\nErrors:\n' + errorSummary);
        }
        fetchProcurementData(); // Refresh the list
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setUploadMessage(`Error: ${error.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Procurement Entry</h2>
          <Badge className="bg-blue-100 text-blue-800">
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN')}
          </Badge>
        </div>
        
        {/* Bulk Upload Section */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleDownloadTemplate}
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          
          <Button
            onClick={handleUploadClick}
            disabled={uploadLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {uploadLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </div>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </>
            )}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Upload Status Message */}
      {uploadMessage && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-start">
              <FileSpreadsheet className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Bulk Upload Result</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded">
                  {uploadMessage}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Procurement Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Add New Procurement Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Invoice number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => handleInputChange('invoice_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                <select
                  value={formData.fuel_type}
                  onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="HSD">HSD (Diesel)</option>
                  <option value="MS">MS (Petrol)</option>
                  <option value="POWER">POWER (Premium)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Liters)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Quantity in liters"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹/Liter)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => handleInputChange('rate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Rate per liter"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total_amount.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                <input
                  type="text"
                  value={formData.vehicle_number}
                  onChange={(e) => handleInputChange('vehicle_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Vehicle number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Supplier name"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-orange-50 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-orange-600" />
                  <span className="font-medium">Calculated Total:</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {formatCurrency(formData.total_amount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
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
                    Save Procurement Entry
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {message && (
        <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Procurement List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Procurement Entries for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN')}</span>
            <Badge className="bg-green-100 text-green-800">
              Total: {formatCurrency(getTotalProcurement())}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {procurementList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No procurement entries found for this date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium">Invoice #</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Fuel Type</th>
                    <th className="text-left py-3 px-4 font-medium">Quantity (L)</th>
                    <th className="text-left py-3 px-4 font-medium">Rate (₹/L)</th>
                    <th className="text-left py-3 px-4 font-medium">Total Amount</th>
                    <th className="text-left py-3 px-4 font-medium">Vehicle</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {procurementList.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.invoice_number}</td>
                      <td className="py-3 px-4">{new Date(item.invoice_date).toLocaleDateString('en-IN')}</td>
                      <td className="py-3 px-4">
                        <Badge className={`${
                          item.fuel_type === 'HSD' ? 'bg-blue-100 text-blue-800' :
                          item.fuel_type === 'MS' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {item.fuel_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{item.quantity.toLocaleString()}</td>
                      <td className="py-3 px-4">₹{item.rate.toFixed(2)}</td>
                      <td className="py-3 px-4 font-medium">{formatCurrency(item.total_amount)}</td>
                      <td className="py-3 px-4">{item.vehicle_number}</td>
                      <td className="py-3 px-4">
                        <Button
                          onClick={() => handleDelete(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-orange-50 font-bold">
                    <td className="py-3 px-4" colSpan="5">TOTAL PROCUREMENT</td>
                    <td className="py-3 px-4">{formatCurrency(getTotalProcurement())}</td>
                    <td className="py-3 px-4" colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ProcurementEntry;