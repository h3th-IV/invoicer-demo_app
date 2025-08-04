import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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

    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  // Staff authentication
  registerStaff: (data) => api.post('/auth/staff/register', data),
  loginStaff: (data) => api.post('/auth/staff/login', data),
  
  // Get current user profile
  getProfile: () => api.get('/auth/profile'),
};

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