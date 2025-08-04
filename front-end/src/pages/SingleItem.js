import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, 
  ArrowLeft, 
  Edit, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText
} from 'lucide-react';
import { itemAPI, invoiceAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SingleItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemData();
  }, [id]);

  const fetchItemData = async () => {
    try {
      setLoading(true);
      const [itemResponse, invoicesResponse] = await Promise.all([
        itemAPI.getById(id),
        invoiceAPI.getAll({ limit: 100 })
      ]);
      
      setItem(itemResponse.data.data);
      
      // Filter invoices that contain this item
      const allInvoices = invoicesResponse.data.data.invoices || [];
      const itemInvoices = allInvoices.filter(invoice => 
        invoice.items && invoice.items.some(invItem => invItem._id === id)
      );
      setInvoices(itemInvoices);
    } catch (error) {
      handleApiError(error, toast, 'Failed to load item details');
      navigate('/items');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkOutOfStock = async () => {
    try {
      await itemAPI.markOutOfStock(id);
      toast.success('Item marked as out of stock');
      fetchItemData(); // Refresh the data
    } catch (error) {
      handleApiError(error, toast, 'Failed to update item status');
    }
  };

  const calculateItemStats = () => {
    const totalInvoices = invoices.length;
    const totalQuantitySold = invoices.reduce((sum, invoice) => {
      const itemInInvoice = invoice.items.find(invItem => invItem._id === id);
      return sum + (itemInInvoice ? (itemInInvoice.quantity || 1) : 0);
    }, 0);
    const totalRevenue = invoices.reduce((sum, invoice) => {
      const itemInInvoice = invoice.items.find(invItem => invItem._id === id);
      if (itemInInvoice && item.unitPrice) {
        return sum + (itemInInvoice.quantity || 1) * item.unitPrice;
      }
      return sum;
    }, 0);

    return {
      totalInvoices,
      totalQuantitySold,
      totalRevenue
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Item not found</h3>
        <p className="text-gray-600">The item you're looking for doesn't exist.</p>
      </div>
    );
  }

  const stats = calculateItemStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/items')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600">Item Details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link
            to={`/items/${id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Item
          </Link>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            item.status === 'in-stock' && item.quantity > 0
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {item.status === 'in-stock' && item.quantity > 0 ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-1" />
            )}
            {item.status === 'in-stock' && item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          
          {item.status === 'in-stock' && item.quantity > 0 && (
            <button
              onClick={handleMarkOutOfStock}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Mark Out of Stock
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Item Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Item Name</p>
                  <p className="text-sm text-gray-900">{item.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Unit Price</p>
                  <p className="text-lg font-bold text-gray-900">${item.unitPrice.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Current Stock</p>
                  <p className={`text-lg font-bold ${
                    item.quantity === 0 ? 'text-red-600' : 
                    item.quantity < 10 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {item.quantity} units
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Value</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${(item.unitPrice * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Item Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Item Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{stats.totalInvoices}</div>
                <div className="text-sm text-gray-600">Total Invoices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalQuantitySold}</div>
                <div className="text-sm text-gray-600">Units Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Invoices</h3>
              <Link
                to="/invoices"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                View all
              </Link>
            </div>
            
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No invoices found for this item</p>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 5).map((invoice) => {
                  const itemInInvoice = invoice.items.find(invItem => invItem._id === id);
                  return (
                    <div key={invoice._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-gray-600">
                            {format(new Date(invoice.issueDate), 'MMM dd, yyyy')} - Qty: {itemInInvoice ? itemInInvoice.quantity : 0}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {invoice.status}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ${itemInInvoice ? (itemInInvoice.quantity * item.unitPrice).toLocaleString() : '0'}
                        </span>
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Item Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Item Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Item Created</p>
                  <p className="text-xs text-gray-600">
                    {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(item.updatedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stock Alert */}
          {item.quantity <= 10 && item.quantity > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Low Stock Alert</p>
                  <p className="text-sm text-yellow-700">
                    Only {item.quantity} units remaining. Consider restocking soon.
                  </p>
                </div>
              </div>
            </div>
          )}

          {item.quantity === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-800">Out of Stock</p>
                  <p className="text-sm text-red-700">
                    This item is currently out of stock. Restock to continue sales.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleItem; 