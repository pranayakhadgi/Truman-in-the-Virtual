// Vercel serverless function entry point
// This exports the Express app as a serverless function handler

// Set Vercel environment flag before requiring server
process.env.VERCEL = '1';

// Import the Express app with detailed error handling
let app;
try {
  console.log('Loading Express server...');
  app = require('../Backend/server.js');
  console.log('Express server loaded successfully');
} catch (error) {
  console.error('Failed to load server:', error);
  console.error('Error stack:', error.stack);
  
  // Create a minimal Express app as fallback
  const express = require('express');
  app = express();
  
  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Error handler
  app.use((err, req, res, next) => {
    console.error('Fallback error handler:', err);
    res.status(500).json({ 
      error: 'Server initialization failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
  
  // Catch-all route
  app.get('*', (req, res) => {
    res.status(500).json({ 
      error: 'Server initialization failed',
      message: 'The server failed to initialize. Please check the logs.',
      path: req.path
    });
  });
  
  app.post('*', (req, res) => {
    res.status(500).json({ 
      error: 'Server initialization failed',
      message: 'The server failed to initialize. Please check the logs.',
      path: req.path
    });
  });
}

// Export as Vercel serverless function handler
// Vercel expects the handler to be the Express app directly
module.exports = app;

