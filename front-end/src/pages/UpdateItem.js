import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  Save,
  ArrowLeft
} from 'lucide-react';
import { itemAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

const UpdateItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unitPrice: '',
    status: 'in-stock'
  });

  useEffect(() => {
    fetchItemData();
  }, [id]);

  const fetchItemData = async () => {
    try {
      setInitialLoading(true);
      const response = await itemAPI.getById(id);
      const item = response.data.data;
      
      setFormData({
        name: item.name || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || '',
        status: item.status || 'in-stock'
      });
    } catch (error) {
      handleApiError(error, toast, 'Failed to load item data');
      navigate('/items');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Item name is required');
      return;
    }

    if (!formData.unitPrice || formData.unitPrice <= 0) {
      toast.error('Unit price must be greater than 0');
      return;
    }

    if (!formData.quantity || formData.quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    try {
      setLoading(true);
      
      const itemData = {
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        status: formData.status
      };

      await itemAPI.update(id, itemData);
      toast.success('Item updated successfully!');
      navigate(`/items/${id}`);
    } catch (error) {
      handleApiError(error, toast, 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/items/${id}`)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Update Item</h1>
            <p className="text-gray-600">Edit inventory item information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Item Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter item name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="Enter quantity"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Item Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Item Name:</span>
              <span className="text-sm text-gray-900">{formData.name || 'Not specified'}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <span className="text-sm text-gray-900">{formData.quantity} units</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Unit Price:</span>
              <span className="text-sm text-gray-900">
                ${formData.unitPrice ? parseFloat(formData.unitPrice).toFixed(2) : '0.00'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Total Value:</span>
              <span className="text-sm font-bold text-gray-900">
                ${(formData.quantity * (formData.unitPrice || 0)).toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className={`text-sm font-medium ${
                formData.status === 'in-stock' ? 'text-green-600' : 'text-red-600'
              }`}>
                {formData.status === 'in-stock' ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/items/${id}`)}
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
            Update Item
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateItem; 