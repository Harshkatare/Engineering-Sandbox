const mongoose = require('mongoose');

// Mongoose schema defines how the application maps data to the db collections
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  preferences: { type: mongoose.Schema.Types.Mixed } // Mixed allows any arbitrary nested JSON structure
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // automatically manages timestamps
});

module.exports = mongoose.model('User', UserSchema);