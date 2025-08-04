import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import SingleInvoice from './pages/SingleInvoice';
import Clients from './pages/Clients';
import CreateClient from './pages/CreateClient';
import UpdateClient from './pages/UpdateClient';
import SingleClient from './pages/SingleClient';
import Items from './pages/Items';
import CreateItem from './pages/CreateItem';
import UpdateItem from './pages/UpdateItem';
import SingleItem from './pages/SingleItem';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.type)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <Layout>
                    <Invoices />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/invoices/create" element={
                <ProtectedRoute>
                  <Layout>
                    <CreateInvoice />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/invoices/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <SingleInvoice />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/clients" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <Layout>
                    <Clients />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/clients/create" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <Layout>
                    <CreateClient />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/clients/:id/edit" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <Layout>
                    <UpdateClient />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/clients/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <SingleClient />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/items" element={
                <ProtectedRoute>
                  <Layout>
                    <Items />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/items/create" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <Layout>
                    <CreateItem />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/items/:id/edit" element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <Layout>
                    <UpdateItem />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/items/:id" element={
                <ProtectedRoute>
                  <Layout>
                    <SingleItem />
                  </Layout>
                </ProtectedRoute>
              } />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App; 