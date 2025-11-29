const mongoose = require('mongoose');

const BidderSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  registeredAuctions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auction' }]
});

module.exports = mongoose.model('Bidder', BidderSchema);