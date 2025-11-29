const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
  startDate: Date,
  endDate: Date,
  reservePrice: Number,
  currentBid: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' },
  bids: [{
    bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bidder' },
    amount: Number,
    timestamp: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Auction', AuctionSchema);