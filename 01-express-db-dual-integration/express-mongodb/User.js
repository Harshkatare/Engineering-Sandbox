const mongoose = require('mongoose');

// defining the sub-document schema for login logs
const LoginLogSchema = new mongoose.Schema({
  device_type: { type: String, required: true },
  ip_address: { type: String, required: true },
  logged_at: { type: Date, default: Date.now }
}, {_id: true}); //_id:true, keep true so each log entry gets its own unique ID automatically

// Mongoose schema defines how the application maps data to the db collections
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  preferences: { type: mongoose.Schema.Types.Mixed }, // Mixed allows any arbitrary nested JSON structure

  // Embed the logs directly as an array of sub-docs.
  login_history: [LoginLogSchema]
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // automatically manages timestamps
});

module.exports = mongoose.model('User', UserSchema);