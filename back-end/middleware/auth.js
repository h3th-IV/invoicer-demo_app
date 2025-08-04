const jwt = require('jsonwebtoken');
const Staff = require('../models/staff');
const Client = require('../models/client');
const { errorResponse } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return errorResponse(res, 401, 'Access token required');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type === 'staff') {
      const staff = await Staff.findById(decoded.id);
      if (!staff || staff.status !== 'active') {
        return errorResponse(res, 401, 'Invalid or inactive staff account');
      }
      req.user = { ...staff.toPublicJSON(), type: 'staff' };
    } else if (decoded.type === 'client') {
      const client = await Client.findById(decoded.id);
      if (!client || client.status !== 'active') {
        return errorResponse(res, 401, 'Invalid or inactive client account');
      }
      req.user = { ...client.toObject(), type: 'client' };
    } else {
      return errorResponse(res, 401, 'Invalid token type');
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 401, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Token expired');
    }
    return errorResponse(res, 500, 'Token verification failed');
  }
};

// Middleware to check if user is staff
const requireStaff = (req, res, next) => {
  if (!req.user || req.user.type !== 'staff') {
    return errorResponse(res, 403, 'Staff access required');
  }
  next();
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.type !== 'staff' || req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Admin access required');
  }
  next();
};

// Middleware to check if user is client
const requireClient = (req, res, next) => {
  if (!req.user || req.user.type !== 'client') {
    return errorResponse(res, 403, 'Client access required');
  }
  next();
};

// Helper function to generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  authenticateToken,
  requireStaff,
  requireAdmin,
  requireClient,
  generateToken
}; 