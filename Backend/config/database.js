// MongoDB Atlas Connection Configuration
const mongoose = require('mongoose');
const path = require('path');

// Load .env file from Backend directory
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // Check if MONGODB_URI is set
    if (!process.env.MONGODB_URI) {
      const error = new Error('MONGODB_URI is not defined');
      console.error('❌ MONGODB_URI is not defined');
      console.error('💡 Make sure .env file exists in Backend/ directory or set MONGODB_URI in Vercel environment variables');
      
      // Don't exit process in serverless environment (Vercel)
      if (process.env.VERCEL || process.env.VERCEL_ENV) {
        console.warn('⚠️  Running in serverless mode without database - API routes will fail');
        throw error;
      }
      process.exit(1);
    }
    
    // MongoDB connection options
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);

    // Connection event handlers (only set once)
    if (!mongoose.connection.listeners('connected').length) {
      mongoose.connection.on('connected', () => {
        console.log('🟢 Mongoose connected to MongoDB Atlas');
      });

      mongoose.connection.on('error', (err) => {
        console.error('❌ Mongoose connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('🔴 Mongoose disconnected from MongoDB Atlas');
      });

      // Graceful shutdown (only in non-serverless environments)
      if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
        process.on('SIGINT', async () => {
          await mongoose.connection.close();
          console.log('🛑 Mongoose connection closed due to app termination');
          process.exit(0);
        });
      }
    }

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.error('💡 Tips:');
    console.error('   1. Check your MONGODB_URI in .env file or Vercel environment variables');
    console.error('   2. Ensure your IP is whitelisted in MongoDB Atlas (or use 0.0.0.0/0 for Vercel)');
    console.error('   3. Verify username/password are correct');
    console.error('   4. Check network connection');
    
    // Don't exit process in serverless environment
    if (process.env.VERCEL || process.env.VERCEL_ENV) {
      throw error; // Let the route handlers deal with it
    }
    process.exit(1);
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const conn = await connectDB();
    console.log('🧪 Testing database operations...');
    
    // Test write operation
    const testCollection = conn.connection.db.collection('test');
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Write test passed');
    
    // Test read operation
    const result = await testCollection.findOne({ test: true });
    console.log('✅ Read test passed:', result ? 'Found document' : 'No document');
    
    // Cleanup
    await testCollection.deleteOne({ test: true });
    console.log('✅ Delete test passed');
    
    console.log('🎉 Database connection test successful!');
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
};

module.exports = { connectDB, testConnection };