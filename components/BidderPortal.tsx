
import React, { useState, useEffect } from 'react';
import { Auction, User } from '../types';
import { fetchAuctions, placeBid } from '../services/apiClient';
import { Gavel, Clock, LogOut, TrendingUp, DollarSign } from 'lucide-react';

interface BidderPortalProps {
  user: User;
  onLogout: () => void;
}

export const BidderPortal: React.FC<BidderPortalProps> = ({ user, onLogout }) => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [placingBid, setPlacingBid] = useState<string | null>(null);

  useEffect(() => {
    loadAuctions();
    // Poll for live updates every 5 seconds
    const interval = setInterval(loadAuctions, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAuctions = async () => {
    try {
      const data = await fetchAuctions();
      setAuctions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBid = async (auctionId: string, currentBid: number) => {
    const amount = prompt(`Current Highest Bid: ₹${currentBid}\nEnter your bid amount (must be higher):`);
    if (!amount) return;
    
    const bidAmount = parseFloat(amount);
    if (isNaN(bidAmount) || bidAmount <= currentBid) {
      alert("Invalid bid amount. Must be higher than current bid.");
      return;
    }

    setPlacingBid(auctionId);
    try {
      await placeBid(auctionId, user.name, bidAmount);
      alert("Bid placed successfully!");
      loadAuctions();
    } catch (e) {
      alert("Failed to place bid. Auction might have ended.");
    } finally {
      setPlacingBid(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Gavel className="w-6 h-6 text-yellow-500" />
            <span className="font-bold text-xl tracking-tight">FortiFi Auctions</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-400">Verified Bidder</p>
            </div>
            <button onClick={onLogout} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <LogOut className="w-5 h-5 text-slate-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Live Auctions</h1>
          <p className="text-slate-500">Real-time bidding on bank assets</p>
        </div>

        {auctions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-700">No Live Auctions</h3>
            <p className="text-slate-500 mt-2">Check back later for new listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map(auction => (
              <div key={auction.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="h-48 bg-slate-200 relative">
                   <img 
                    src={auction.assetSnapshot?.imageUrl?.startsWith('http') ? auction.assetSnapshot.imageUrl : `http://127.0.0.1:5000/${auction.assetSnapshot?.imageUrl}`} 
                    className="w-full h-full object-cover" 
                    alt="Asset"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/800x400?text=No+Image'; }}
                   />
                   <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                     LIVE
                   </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-slate-800 mb-1">{auction.assetSnapshot?.borrowerName}</h3>
                  <p className="text-sm text-slate-500 mb-4">{auction.assetSnapshot?.city}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Reserve Price</span>
                      <span className="font-medium text-slate-900">₹{auction.reservePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                      <span className="text-green-700 font-medium">Highest Bid</span>
                      <span className="text-xl font-bold text-green-700">₹{auction.currentBid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-500">
                      <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Ends:</span>
                      <span>{new Date(auction.endDate).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleBid(auction.id, auction.currentBid)}
                    disabled={placingBid === auction.id}
                    className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center"
                  >
                    {placingBid === auction.id ? 'Placing Bid...' : 'Place Bid Now'}
                  </button>
                </div>
                
                {/* Bid History (Last 3) */}
                <div className="bg-slate-50 p-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Recent Activity</p>
                  <div className="space-y-2">
                    {auction.bids.slice(-2).reverse().map((bid, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-slate-600">{bid.bidderName}</span>
                        <span className="font-medium text-slate-900">₹{bid.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {auction.bids.length === 0 && <span className="text-xs text-slate-400 italic">No bids yet</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
