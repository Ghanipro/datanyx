
const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const Asset = require('../models/Asset');
const Bidder = require('../models/Bidder');

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
    await Asset.findByIdAndUpdate(assetId, { status: 'Auction Scheduled' });

    res.status(201).json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET All Auctions (Live & Ended)
router.get('/live', async (req, res) => {
  try {
    // Populate asset details
    const auctions = await Auction.find().populate('assetId', 'borrowerName city imageUrl').sort({ startDate: -1 });
    
    const formatted = auctions.map(a => {
      // Check if expired but still marked live
      let status = a.status;
      if (status === 'live' && new Date() > new Date(a.endDate)) {
        status = 'ended';
      }

      return {
        id: a._id,
        assetId: a.assetId ? a.assetId._id : null,
        startDate: a.startDate,
        endDate: a.endDate,
        reservePrice: a.reservePrice,
        currentBid: a.currentBid,
        status: status,
        bids: a.bids,
        winner: a.winner,
        winningBid: a.winningBid,
        assetSnapshot: a.assetId ? {
          borrowerName: a.assetId.borrowerName,
          city: a.assetId.city,
          imageUrl: a.assetId.imageUrl
        } : null
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Place Bid
router.post('/:id/bid', async (req, res) => {
  try {
    const { bidderName, amount } = req.body; // In real app, get bidderId from token
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).json({ message: "Auction not found" });
    
    if (new Date() > new Date(auction.endDate)) {
        auction.status = 'ended';
        await auction.save();
        return res.status(400).json({ message: "Auction has ended" });
    }

    if (amount <= auction.currentBid) return res.status(400).json({ message: "Bid must be higher than current bid" });

    // Find bidder (using name for now, simpler for this demo)
    const bidder = await Bidder.findOne({ name: bidderName });
    
    auction.bids.push({ 
        bidderId: bidder ? bidder._id : null, 
        bidderName, 
        amount 
    });
    auction.currentBid = amount;
    
    await auction.save();
    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST Select Winner
router.post('/:id/select-winner', async (req, res) => {
  try {
    const { bidId } = req.body; // The specific bid selected
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    const selectedBid = auction.bids.find(b => b._id.toString() === bidId);
    if (!selectedBid) return res.status(404).json({ message: "Bid not found" });

    auction.winner = selectedBid.bidderId;
    auction.winningBid = selectedBid.amount;
    auction.status = 'closed';
    await auction.save();

    await Asset.findByIdAndUpdate(auction.assetId, { status: 'Sold' });

    res.json(auction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
