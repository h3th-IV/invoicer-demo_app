import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Eye
} from 'lucide-react';
import { invoiceAPI, clientAPI, itemAPI } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    totalClients: 0,
    totalItems: 0,
    totalRevenue: 0
  });
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch invoices
      const invoicesResponse = await invoiceAPI.getAll({ limit: 100 });
      const invoices = invoicesResponse.data.data.invoices || [];
      
      // Fetch clients
      const clientsResponse = await clientAPI.getAll({ limit: 100 });
      const clients = clientsResponse.data.data.clients || [];
      
      // Fetch items
      const itemsResponse = await itemAPI.getAll({ limit: 100 });
      const items = itemsResponse.data.data.items || [];

      // Calculate stats
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid');
      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

      setStats({
        totalInvoices: invoices.length,
        paidInvoices: paidInvoices.length,
        unpaidInvoices: unpaidInvoices.length,
        totalClients: clients.length,
        totalItems: items.length,
        totalRevenue
      });

      // Set recent invoices (last 5)
      setRecentInvoices(invoices.slice(0, 5));

    } catch (error) {
      handleApiError(error, toast, 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-1">
              {change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`ml-1 text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your invoice management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={FileText}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={Package}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-yellow-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/invoices/create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Plus className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h4 className="font-medium text-gray-900">Create Invoice</h4>
                <p className="text-sm text-gray-600">Generate a new invoice</p>
              </div>
            </Link>
            
            <Link
              to="/clients/create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Users className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h4 className="font-medium text-gray-900">Add Client</h4>
                <p className="text-sm text-gray-600">Create a new client</p>
              </div>
            </Link>
            
            <Link
              to="/items/create"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Package className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h4 className="font-medium text-gray-900">Add Item</h4>
                <p className="text-sm text-gray-600">Add inventory item</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Invoices</h3>
            <Link
              to="/invoices"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="overflow-hidden">
          {recentInvoices.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No invoices found. Create your first invoice!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentInvoices.map((invoice) => (
                <div key={invoice._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          {invoice.client?.name || 'Unknown Client'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ${invoice.total}
                      </span>
                      <Link
                        to={`/invoices/${invoice._id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 