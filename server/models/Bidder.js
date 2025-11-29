const mongoose = require('mongoose');

const BidderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  phone: String,
  aadharNumber: String,
  panUrl: String, // Path to uploaded PAN card
  kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  registeredAuctions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Auction' }]
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('Bidder', BidderSchema);