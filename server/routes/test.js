import mongoose from "mongoose";
import { generateToken } from "../middleware/auth.js";
import { connectDB } from "../config/database.js";

export const handleTestConnection = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    // Check MongoDB connection
    const mongoStatus = mongoose.connection.readyState;
    const statusText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[mongoStatus] || 'unknown';

    // Test database operations
    const collections = await mongoose.connection.db?.collections();

    // Test JWT token generation
    const testToken = generateToken('test-user-id');

    res.json({
      success: true,
      status: {
        mongodb: {
          status: statusText,
          readyState: mongoStatus,
          collections: collections?.length || 0,
          dbName: mongoose.connection.name
        },
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        },
        auth: {
          jwtSecret: process.env.JWT_SECRET ? 'configured' : 'using default',
          testTokenGenerated: !!testToken
        }
      }
    });

  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: {
        mongodb: {
          status: 'error',
          readyState: mongoose.connection.readyState
        }
      }
    });
  }
};
