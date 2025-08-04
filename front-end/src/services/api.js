import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log the error for debugging
    console.error('API Error:', error);
    
    // If the error has a response, log the response data
    if (error.response && error.response.data) {
      console.error('Error Response Data:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Invoice APIs
export const invoiceAPI = {
  create: (data) => api.post('/invoices/create', data),
  getAll: (params) => api.get('/invoices/list', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  updateStatus: (id, status) => api.put(`/invoices/update-status/${id}`, { status }),
};

// Client APIs
export const clientAPI = {
  create: (data) => api.post('/clients/create', data),
  getAll: (params) => api.get('/clients/active', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  update: (id, data) => api.put(`/clients/update/${id}`, data),
  delete: (id) => api.delete(`/clients/delete/${id}`),
};

// Item APIs
export const itemAPI = {
  create: (data) => api.post('/items/add', data),
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/single/${id}`),
  update: (id, data) => api.put(`/items/update/${id}`, data),
  delete: (id) => api.delete(`/items/delete/${id}`),
  markOutOfStock: (id) => api.put(`/items/mark-out-of-stock/${id}`),
};

export default api; 