// Truman Virtual Tour Backend Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const mongoSanitize = require('express-mongo-sanitize');

// Load .env file from Backend directory
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Database connection
const { connectDB } = require('./config/database');

// Routes
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000', 'http://127.0.0.1:3000'];

// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // Log CORS rejection for debugging
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      // In development, be more permissive
      if (process.env.NODE_ENV === 'development') {
        console.warn(`   Development mode: Allowing request`);
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());

// API Routes (must come before static files)
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  res.json({ 
    status: 'OK', 
    message: 'Truman Virtual Tour Backend is running',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    version: '1.1.0'
  });
});

// Session routes
app.use('/api/sessions', sessionRoutes);

// Analytics endpoint (placeholder for future implementation)
app.get('/api/analytics', async (req, res) => {
  try {
    const Session = require('./models/Session');
    const mongoose = require('mongoose');
    
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ isComplete: true });
    const totalResponses = await Session.aggregate([
      { $project: { responseCount: { $size: '$responses' } } },
      { $group: { _id: null, total: { $sum: '$responseCount' } } }
    ]);
    
    res.json({
      success: true,
      analytics: {
        totalSessions,
        completedSessions,
        totalResponses: totalResponses[0]?.total || 0,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Frontend route handlers (must come BEFORE static files to take precedence)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/welcome.html'));
});

app.get('/tour', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.get('/welcome-flow', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/welcome-flow.html'));
});

app.get('/transition', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/transition.html'));
});

// Placeholder route (interim page between welcome and skybox)
app.get('/placeholder', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/placeholder.html'));
});

// Queries route (question flow with questionTree integration)
app.get('/queries', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/queries.html'));
});

// Handle favicon requests (prevent 404 errors)
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(__dirname, '../Frontend/favicon.ico');
  res.sendFile(faviconPath, (err) => {
    if (err) {
      // If favicon doesn't exist, return 204 No Content instead of 404
      res.status(204).end();
    }
  });
});

// Static files (must come AFTER route handlers to avoid serving index.html for /)
app.use(express.static(path.join(__dirname, '../Frontend')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler - serve welcome page for non-API routes
app.use((req, res) => {
  // If it's an API route, return JSON error
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  // For frontend routes, serve welcome page (SPA fallback)
  res.sendFile(path.join(__dirname, '../Frontend/welcome.html'));
});

// Initialize server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start server with error handling
    const server = app.listen(PORT, () => {
      console.log('==========================================');
      console.log('🚀 Truman Virtual Tour Backend');
      console.log('==========================================');
      console.log(`📱 Server running on port ${PORT}`);
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
      console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      const mongoose = require('mongoose');
      console.log(`🗄️  Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
      console.log('==========================================');
    });
    
    // Handle port already in use error
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        console.error(`\n🔧 Quick Fix:`);
        console.error(`   Run this command to free the port:`);
        console.error(`   kill $(lsof -ti :${PORT})`);
        console.error(`\n   Or use a different port by setting PORT in .env file\n`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if not in Vercel serverless environment
// Vercel will handle the serverless function invocation
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  startServer();
}

module.exports = app;
