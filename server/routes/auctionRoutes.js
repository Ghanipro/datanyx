
const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const Asset = require('../models/Asset');

// POST Schedule Auction
router.post('/schedule', async (req, res) => {
  try {
    const { assetId, reservePrice } = req.body;
    
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (12 * 60 * 60 * 1000)); // 12 hours from now

    const auction = new Auction({
      assetId,
      startDate,
      endDate,
      reservePrice,
      currentBid: reservePrice,
      status: 'live'
    });

    await auction.save();

    // Update Asset Status
    await Asset.findByIdAndUpdate(assetId, { status: 'Auction Scheduled' });

    res.status(201).json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Live Auctions
router.get('/live', async (req, res) => {
  try {
    // Populate asset details for the bidder card
    const auctions = await Auction.find({ status: 'live' }).populate('assetId', 'borrowerName city imageUrl');
    
    // Transform to include assetSnapshot equivalent
    const formatted = auctions.map(a => ({
      id: a._id,
      assetId: a.assetId._id,
      startDate: a.startDate,
      endDate: a.endDate,
      reservePrice: a.reservePrice,
      currentBid: a.currentBid,
      status: a.status,
      bids: a.bids,
      assetSnapshot: {
        borrowerName: a.assetId.borrowerName,
        city: a.assetId.city,
        imageUrl: a.assetId.imageUrl
      }
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Place Bid
router.post('/:id/bid', async (req, res) => {
  try {
    const { bidderName, amount } = req.body;
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).json({ message: "Auction not found" });
    if (auction.status !== 'live') return res.status(400).json({ message: "Auction not active" });
    if (amount <= auction.currentBid) return res.status(400).json({ message: "Bid must be higher than current bid" });

    auction.bids.push({ bidderName, amount });
    auction.currentBid = amount;
    
    await auction.save();
    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
