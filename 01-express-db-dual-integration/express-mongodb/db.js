const mongoose = require('mongoose');

// Construct the secure Connection URI using the Docker credentials
const MONGO_URI = 'mongodb://sandbox_admin:sandbox_admin_password@localhost:27017/sandbox_nosql_db?authSource=admin';

const connectDB = async () => {
  try {
    // Mongoose maintains a single, persistent connection state across the application
    await mongoose.connect(MONGO_URI);
    console.log('🔌 [MongoDB] Successfully established a persistent connection stream.');
  } catch (error) {
    console.error('❌ [MongoDB] Connection stream critical failure:', error.message);
    process.exit(1); // Crash process safely if database infrastructure is missing
  }
};

module.exports = connectDB;