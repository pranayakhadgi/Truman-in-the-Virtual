// Vercel serverless function entry point
// This exports the Express app as a serverless function handler

// Set Vercel environment flag before requiring server
process.env.VERCEL = '1';

// Import the Express app
let app;
try {
  app = require('../Backend/server.js');
} catch (error) {
  console.error('Failed to load server:', error);
  // Create a minimal Express app as fallback
  const express = require('express');
  app = express();
  app.get('*', (req, res) => {
    res.status(500).json({ 
      error: 'Server initialization failed',
      message: error.message 
    });
  });
}

// Export as Vercel serverless function handler
module.exports = app;

