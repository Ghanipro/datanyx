
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  role: { type: String, enum: ['Recovery Officer', 'Bidder'], default: 'Recovery Officer' },
  branch: { type: String, default: 'Head Office' },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

module.exports = mongoose.model('User', UserSchema);
