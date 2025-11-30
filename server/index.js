const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import encryption middleware
const { encryptionAudit, verifyDataIntegrity, checkEncryptedDataAccess } = require('./middleware/encryptionMiddleware');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Apply encryption security middleware
app.use(encryptionAudit);
app.use(verifyDataIntegrity);
app.use(checkEncryptedDataAccess);

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Database Connection
const MONGO_URI = 'mongodb+srv://admin:admin@cluster0.pezspbi.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
const assetRoutes = require('./routes/assetRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidderRoutes = require('./routes/bidderRoutes');

app.use('/api/assets', assetRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bidders', bidderRoutes);

app.get('/', (req, res) => {
    res.send('RecoverAI API is running...');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});