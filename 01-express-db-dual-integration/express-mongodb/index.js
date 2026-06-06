const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 3001; // Running on 3001,so it never collides with Postgres(3000)

app.use(express.json());

// initialize the persistent DB connection loop
connectDB();

app.get('/health', (req, res) => {
  // readyState codes: 0 = disconnected,1 = connected,2 = connecting, 3 = disconnecting
  const dbStatus = mongoose.connection.readyState;
  
  if (dbStatus === 1) {
    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      engine: 'MongoDB / Mongoose ODM',
      message: 'Express and MongoDB are communicating perfectly!'
    });
  } else {
    return res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      readyState_code: dbStatus
    });
  }
});

app.listen(PORT, () => {
  console.log(`Sandbox API server running on http://localhost:${PORT}`);
});