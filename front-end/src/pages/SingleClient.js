import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  FileText,
  DollarSign
} from 'lucide-react';
import { clientAPI, invoiceAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { handleApiError } from '../utils/errorHandler';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SingleClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientResponse, invoicesResponse] = await Promise.all([
        clientAPI.getById(id),
        invoiceAPI.getAll({ limit: 100 })
      ]);
      
      setClient(clientResponse.data.data);
      
      // Filter invoices for this client
      const allInvoices = invoicesResponse.data.data.invoices || [];
      const clientInvoices = allInvoices.filter(invoice => 
        invoice.client && invoice.client._id === id
      );
      setInvoices(clientInvoices);
    } catch (error) {
      handleApiError(error, toast, 'Failed to load client details');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const calculateClientStats = () => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const unpaidInvoices = totalInvoices - paidInvoices;
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    const outstandingAmount = invoices
      .filter(inv => inv.status === 'unpaid')
      .reduce((sum, inv) => sum + inv.total, 0);

    return {
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      totalRevenue,
      outstandingAmount
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Client not found</h3>
        <p className="text-gray-600">The client you're looking for doesn't exist.</p>
      </div>
    );
  }

  const stats = calculateClientStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/clients')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600">Client Details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            client.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {client.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {client.email && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-900">{client.email}</p>
                  </div>
                </div>
              )}
              
              {client.phone_number && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Phone</p>
                    <p className="text-sm text-gray-900">{client.phone_number}</p>
                  </div>
                </div>
              )}
              
              {client.address && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Address</p>
                    <p className="text-sm text-gray-900">{client.address}</p>
                  </div>
                </div>
              )}
              
              {client.billingAddress && (
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Billing Address</p>
                    <p className="text-sm text-gray-900">{client.billingAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Client Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Client Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{stats.totalInvoices}</div>
                <div className="text-sm text-gray-600">Total Invoices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.paidInvoices}</div>
                <div className="text-sm text-gray-600">Paid Invoices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.unpaidInvoices}</div>
                <div className="text-sm text-gray-600">Unpaid Invoices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
            
            {stats.outstandingAmount > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Outstanding Amount</p>
                    <p className="text-lg font-bold text-yellow-800">${stats.outstandingAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
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
              <p className="text-gray-500 text-center py-4">No invoices found for this client</p>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
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
                        ${invoice.total.toLocaleString()}
                      </span>
                      <Link
                        to={`/invoices/${invoice._id}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Client Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Client Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Client Created</p>
                  <p className="text-xs text-gray-600">
                    {format(new Date(client.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
              
              {client.updatedAt && client.updatedAt !== client.createdAt && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(client.updatedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleClient; 