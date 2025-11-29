const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: String,
  uploadDate: String,
  extractedData: Object, // Stores the JSON from Gemini
  status: {
    type: String,
    enum: ['pending', 'processing', 'verified', 'flagged'],
    default: 'pending'
  },
  filePath: String // To store the path of uploaded file
});

const LegalEventSchema = new mongoose.Schema({
  id: String,
  title: String,
  date: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue']
  },
  description: String,
  type: {
    type: String,
    enum: ['notice', 'hearing', 'possession', 'valuation']
  }
});

const AssetSchema = new mongoose.Schema({
  borrowerName: { type: String, required: true },
  loanAccountNumber: { type: String, required: true },
  type: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial', 'Vehicle', 'Land'],
    required: true
  },
  address: String,
  city: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  outstandingAmount: Number,
  reservePrice: Number,
  marketValue: Number,
  status: {
    type: String,
    enum: ['New NPA', 'Notice Sent', 'Possession Taken', 'Auction Scheduled', 'Sold', 'Settled'],
    default: 'New NPA'
  },
  documents: { type: [DocumentSchema], default: [] },
  timeline: { type: [LegalEventSchema], default: [] },
  riskScore: { type: Number, default: 50 },
  recoveryProbability: { type: Number, default: 50 },
  imageUrl: String,
  description: String
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

module.exports = mongoose.model('Asset', AssetSchema);