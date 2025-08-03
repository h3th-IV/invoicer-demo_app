const express = require('express');
require('dotenv').config();
const db = require('./config/db');
const invoiceRoutes = require('./routes/invoices');
const clientRoutes = require('./routes/clients');
const itemRoutes = require('./routes/items');

const app = express();

db.connectDB();

app.use(express.json());
app.use('/invoices', invoiceRoutes);
app.use('/clients', clientRoutes);
app.use('/items', itemRoutes);

app.get('/', (req, res) => {
  res.send('invoicer back-end is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue);
});