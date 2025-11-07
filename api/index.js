// Vercel serverless function entry point
// This exports the Express app as a serverless function handler
const app = require('../Backend/server.js');

// Export as Vercel serverless function handler
module.exports = app;

