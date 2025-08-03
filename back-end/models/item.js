const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true
  },
  quantity: {
    type: Number, 
    required: true, 
    min: 1
  },
  unitPrice: {
    type: Number, 
    required: true, 
    min: 0
  },
  status: {
    type: String,
    enum: ['in-stock', 'out-of-stock']
  }
}, {timestamps: true});

module.exports = mongoose.model('Item', itemSchema);