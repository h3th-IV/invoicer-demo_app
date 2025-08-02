const express = require('express');
require('dotenv').config();
const db = require('./config/db');

const app = express();

db.connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('invoicer back-end is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.blue);
});