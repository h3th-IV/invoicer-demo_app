import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import CreateInvoice from './pages/CreateInvoice';
import SingleInvoice from './pages/SingleInvoice';
import Clients from './pages/Clients';
import CreateClient from './pages/CreateClient';
import SingleClient from './pages/SingleClient';
import Items from './pages/Items';
import CreateItem from './pages/CreateItem';
import SingleItem from './pages/SingleItem';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/create" element={<CreateInvoice />} />
              <Route path="/invoices/:id" element={<SingleInvoice />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/create" element={<CreateClient />} />
              <Route path="/clients/:id" element={<SingleClient />} />
              <Route path="/items" element={<Items />} />
              <Route path="/items/create" element={<CreateItem />} />
              <Route path="/items/:id" element={<SingleItem />} />
            </Routes>
          </Layout>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App; 