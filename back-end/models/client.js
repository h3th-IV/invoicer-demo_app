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
    required: true,
    lowercase: true,
    trim: true
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

// Method to get public profile
clientSchema.methods.toPublicJSON = function() {
  return this.toObject();
};

module.exports = mongoose.model('Client', clientSchema);