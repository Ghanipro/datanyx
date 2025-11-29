const mongoose = require('mongoose');

const AuctionSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
  startDate: Date,
  endDate: Date,
  reservePrice: Number,
  currentBid: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming', 'live', 'ended', 'closed'], default: 'upcoming' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Bidder' },
  winningBid: Number,
  bids: [{
    bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bidder' },
    bidderName: String,
    amount: Number,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('Auction', AuctionSchema);