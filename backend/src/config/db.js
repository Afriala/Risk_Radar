// MongoDB Atlas Connection Manager
// Hybrid Architecture: Seamless Cloud Persistence with Local Fallback Guard

import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log('[Database] MONGODB_URI not set. Running in local file-backed persistence mode.');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[Database] MongoDB connection warning: ${error.message}. Seamlessly falling back to local file store.`);
    return false;
  }
};

export const getDbStatus = () => ({
  isConnected,
  database: mongoose.connection?.name || 'riskradar (file-fallback)',
  host: mongoose.connection?.host || 'local',
});

