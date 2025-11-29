const mongoose = require('mongoose');
const Asset = require('./models/Asset');
require('dotenv').config();

const MOCK_ASSETS = [
  {
    borrowerName: 'Greenfield Textiles Pvt Ltd',
    loanAccountNumber: 'LN-2023-8842',
    type: 'Industrial',
    address: 'Plot 45, Industrial Area, Phase 2',
    city: 'Ahmedabad',
    coordinates: { lat: 23.0225, lng: 72.5714 },
    outstandingAmount: 45000000,
    reservePrice: 38000000,
    marketValue: 42000000,
    status: 'Notice Sent',
    riskScore: 85,
    recoveryProbability: 60,
    imageUrl: 'https://picsum.photos/800/600?random=1',
    description: 'Textile manufacturing unit with 20000 sqft constructed area and heavy machinery.',
    documents: [],
    timeline: [
      { id: '1', title: 'NPA Declaration', date: '2023-10-15', status: 'completed', description: 'Account classified as NPA', type: 'notice' },
      { id: '2', title: '13(2) Notice Sent', date: '2023-11-01', status: 'completed', description: 'Demand notice issued', type: 'notice' },
      { id: '3', title: 'Possession Notice', date: '2024-02-15', status: 'pending', description: 'Physical possession to be taken', type: 'possession' },
    ]
  },
  {
    borrowerName: 'Rajesh Kumar & Sons',
    loanAccountNumber: 'LN-2022-1102',
    type: 'Commercial',
    address: 'Shop 12, Galaxy Mall, MG Road',
    city: 'Bangalore',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    outstandingAmount: 12000000,
    reservePrice: 10500000,
    marketValue: 13000000,
    status: 'Auction Scheduled',
    riskScore: 45,
    recoveryProbability: 90,
    imageUrl: 'https://picsum.photos/800/600?random=2',
    description: 'Premium retail space on ground floor, high footfall area.',
    documents: [],
    timeline: [
      { id: '1', title: 'NPA Declaration', date: '2023-01-10', status: 'completed', description: 'Account classified as NPA', type: 'notice' },
      { id: '2', title: 'Symbolic Possession', date: '2023-06-15', status: 'completed', description: 'Possession notice pasted', type: 'possession' },
      { id: '3', title: 'Auction Notice', date: '2024-01-20', status: 'completed', description: 'Auction date published', type: 'notice' },
    ]
  }
];

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/recoverai_db';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    await Asset.deleteMany({});
    console.log('Cleared existing assets');
    await Asset.insertMany(MOCK_ASSETS);
    console.log('Seeded Assets');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });