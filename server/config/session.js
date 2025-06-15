const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

// Get MongoDB URL from environment or use Atlas URL
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://rahmanam90:9946337540@cluster0.8sxy4wx.mongodb.net/my_dvt_db';

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-super-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URL,
    ttl: 7 * 24 * 60 * 60, // Session TTL (1 week)
    autoRemove: 'native',
    touchAfter: 24 * 3600, // time period in seconds
    mongoOptions: {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }
  }),
  cookie: {
    httpOnly: true,
    secure: true, // Always use secure cookies in production
    sameSite: 'none', // Allow cross-site cookies
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
  },
  name: 'sid', // Change the cookie name from 'connect.sid'
};

// Log MongoDB connection for debugging
console.log('MongoDB URL for session store:', MONGODB_URL.replace(/\/\/([^:]+):([^@]+)@/, '//<credentials>@'));

module.exports = sessionConfig; 