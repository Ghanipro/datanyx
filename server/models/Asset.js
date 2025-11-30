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
    filePath: String, // To store the path of uploaded file

    // Encryption metadata for documents
    isEncrypted: {
        type: Boolean,
        default: true
    },
    encryptedContent: {
        iv: String,
        encryptedData: String,
        algorithm: String
    },
    dataIntegrityHash: String, // SHA-256 hash for verification
    encryptionTimestamp: Date,
    encryptedBy: String // User who encrypted the document
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
    areaSqFt: { type: Number }, // Mandatory for real estate
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
    description: String,
    summary: String,
    keywords: [String],

    // Asset-level encryption metadata
    encryptionMetadata: {
        isEncrypted: {
            type: Boolean,
            default: true
        },
        encryptionMethod: {
            type: String,
            default: 'aes-256-cbc'
        },
        encryptedAt: Date,
        encryptedBy: String, // User ID who encrypted
        dataClassification: {
            type: String,
            enum: ['public', 'confidential', 'restricted'],
            default: 'confidential'
        },
        lastEncryptionKeyRotation: Date
    },

    // Sensitive fields that should be encrypted
    sensitiveData: {
        encryptedBorrowerDetails: Object, // Encrypted borrower info
        encryptedCoordinates: Object, // Encrypted location data
        encryptedFinancialData: Object, // Encrypted financial details
    },

    dataIntegrityHash: String, // Hash for document integrity verification
    auditLog: [{
        action: String,
        timestamp: Date,
        userId: String,
        details: String
    }]
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