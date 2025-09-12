import mongoose from 'mongoose';
import { config } from './index.js';

/**
 * Connect to MongoDB database
 */
export const connectDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    await mongoose.connect(config.mongodb.uri, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      socketTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Listen for connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('💤 MongoDB connection closed through app termination');
    });
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
};

/**
 * Test database connection
 */
export const testConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      // Already connected
      return true;
    }
    
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    return false;
  }
};