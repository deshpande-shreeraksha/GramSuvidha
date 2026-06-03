const jwt = require('jsonwebtoken');
const { Citizen, Admin, Worker } = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      // Get user from the token by searching across separate collections
      let user = await Citizen.findById(decoded.id).select('-password');
      if (!user) {
        user = await Admin.findById(decoded.id).select('-password');
      }
      if (!user) {
        user = await Worker.findById(decoded.id).select('-password');
      }

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin only' });
  }
};

const citizenOnly = (req, res, next) => {
  if (req.user && req.user.role === 'citizen') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Citizen only' });
  }
};

const protectOptional = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      let user = await Citizen.findById(decoded.id).select('-password');
      if (!user) {
        user = await Admin.findById(decoded.id).select('-password');
      }
      if (!user) {
        user = await Worker.findById(decoded.id).select('-password');
      }

      req.user = user;
    } catch (error) {
      console.warn('Optional token verification failed:', error.message);
    }
  }
  next();
};

module.exports = { protect, adminOnly, citizenOnly, protectOptional };

