const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const invoiceRoutes = require('./routes/invoices');
const clientRoutes = require('./routes/clients');
const itemRoutes = require('./routes/items');

const app = express();

db.connectDB();

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json());

// Public routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/invoices', invoiceRoutes);
app.use('/clients', clientRoutes);
app.use('/items', itemRoutes);

app.get('/', (req, res) => {
  res.send('invoicer back-end is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT} test`.blue);
});