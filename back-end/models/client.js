const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  phone_number: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  address: {
    type: String,
  },
  billingAddress: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {timestamps: true});

module.exports = mongoose.model('Client', clientSchema);