import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft
} from 'lucide-react';
import { invoiceAPI, clientAPI, itemAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

const CreateInvoice = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    issueDate: '',
    dueDate: '',
    clientId: '',
    items: [{ itemId: '', quantity: 1 }]
  });

  useEffect(() => {
    fetchClientsAndItems();
  }, []);

  const fetchClientsAndItems = async () => {
    try {
      console.log('Fetching data...');
      
      const itemsResponse = await itemAPI.getAll({ limit: 100 });
      setItems(itemsResponse.data.data.items || []);

      const clientsResponse = await clientAPI.getAll({ limit: 100 });
      const clientsData = clientsResponse.data.data.clients || [];
      console.log('Clients fetched:', clientsData.length);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      handleApiError(error, toast, 'Failed to load clients and items');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemId: '', quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const selectedItem = items.find(i => i._id === item.itemId);
      if (selectedItem && item.quantity) {
        return total + (selectedItem.unitPrice * item.quantity);
      }
      return total;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.issueDate || !formData.dueDate || !formData.clientId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.items.some(item => !item.itemId || !item.quantity)) {
      toast.error('Please fill in all item details');
      return;
    }

    try {
      setLoading(true);
      
      const invoiceData = {
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        clientId: formData.clientId,
        items: formData.items.map(item => ({
          _id: item.itemId,
          quantity: parseInt(item.quantity)
        }))
      };

      await invoiceAPI.create(invoiceData);
      toast.success('Invoice created successfully!');
      navigate('/invoices');
    } catch (error) {
      handleApiError(error, toast, 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
            <p className="text-gray-600">
              Generate a new invoice for your client
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Date *
              </label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.name} - {client.email}
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No clients available. Please create clients first.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item *
                  </label>
                  <select
                    required
                    value={item.itemId}
                    onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select an item</option>
                    {items
                      .filter(item => item.status === 'in-stock')
                      .map(item => (
                        <option key={item._id} value={item._id}>
                          {item.name} - ${item.unitPrice} (Stock: {item.quantity})
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                    ${items.find(i => i._id === item.itemId)?.unitPrice || 0}
                  </div>
                </div>
                
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtotal
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-medium">
                    ${(items.find(i => i._id === item.itemId)?.unitPrice || 0) * item.quantity}
                  </div>
                </div>
                
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Total</h3>
            <div className="text-2xl font-bold text-primary-600">
              ${total.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice; 