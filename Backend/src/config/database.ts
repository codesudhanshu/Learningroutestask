import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dashboard-builder';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📁 Database: ${mongoose.connection.db?.databaseName}`);
    
    // Connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check if MongoDB is running:');
    console.log('      - Windows: Run "services.msc" and start MongoDB');
    console.log('      - Mac: Run "brew services start mongodb-community"');
    console.log('      - Linux: Run "sudo systemctl start mongod"');
    console.log('   2. Check MongoDB connection string:');
    console.log(`      Current: ${MONGODB_URI}`);
    process.exit(1);
  }
};