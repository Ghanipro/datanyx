
import React, { useState, useEffect } from 'react';
import { Auction } from '../types';
import { fetchAuctions, selectAuctionWinner } from '../services/apiClient';
import { Gavel, Clock, Trophy, Check } from 'lucide-react';

export const AuctionList: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      const data = await fetchAuctions();
      setAuctions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectWinner = async (auctionId: string, bidId?: string) => {
    if(!bidId) return;
    if(!confirm("Confirm this bidder as the winner? This will mark the asset as Sold.")) return;
    
    setProcessing(auctionId);
    try {
        await selectAuctionWinner(auctionId, bidId);
        await loadAuctions();
    } catch (e) {
        alert("Failed to close auction");
    } finally {
        setProcessing(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 px-6">
      <div className="mb-6 mt-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Auction Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Monitor live auctions and finalize winners</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map(auction => {
            const isEnded = auction.status === 'ended' || auction.status === 'closed';
            const sortedBids = [...auction.bids].sort((a, b) => b.amount - a.amount).slice(0, 3);

            return (
            <div key={auction.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors">
              <div className="h-48 bg-slate-200 dark:bg-slate-700 relative">
                  <img 
                  src={auction.assetSnapshot?.imageUrl?.startsWith('http') ? auction.assetSnapshot.imageUrl : `http://127.0.0.1:5000/${auction.assetSnapshot?.imageUrl}`} 
                  className="w-full h-full object-cover" 
                  alt="Asset"
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/800x400?text=No+Image'; }}
                  />
                  <div className={`absolute top-3 right-3 text-white px-3 py-1 rounded-full text-xs font-bold ${
                      auction.status === 'live' ? 'bg-red-600 animate-pulse' : 
                      auction.status === 'closed' ? 'bg-green-600' : 'bg-slate-600'
                  }`}>
                    {auction.status.toUpperCase()}
                  </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{auction.assetSnapshot?.borrowerName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{auction.assetSnapshot?.city}</p>

                {auction.status === 'closed' ? (
                     <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800 mb-4">
                         <div className="flex items-center text-green-700 dark:text-green-400 font-bold mb-1">
                             <Trophy className="w-4 h-4 mr-2" /> Winner Selected
                         </div>
                         <p className="text-slate-700 dark:text-slate-300 text-sm">Amount: ₹{auction.winningBid?.toLocaleString()}</p>
                     </div>
                ) : (
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Reserve Price</span>
                            <span className="font-medium text-slate-900 dark:text-white">₹{auction.reservePrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Ends:</span>
                            <span>{new Date(auction.endDate).toLocaleTimeString()}</span>
                        </div>
                    </div>
                )}
                
                {/* Top 3 Bids */}
                <div className="bg-slate-50 dark:bg-slate-900 p-4 border-t border-slate-100 dark:border-slate-700 rounded-lg mt-auto">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Top Bids</p>
                    <div className="space-y-3">
                        {sortedBids.length === 0 ? <span className="text-xs text-slate-400 italic">No bids yet</span> : 
                        sortedBids.map((bid, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                        i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'
                                    }`}>{i+1}</span>
                                    <span className="text-slate-700 dark:text-slate-300">{bid.bidderName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 dark:text-white">₹{bid.amount.toLocaleString()}</span>
                                    {isEnded && !auction.winner && (
                                        <button 
                                            onClick={() => handleSelectWinner(auction.id, bid._id)}
                                            disabled={!!processing}
                                            className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded transition-colors"
                                            title="Select as Winner"
                                        >
                                            <Check className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            </div>
            );
        })}
        </div>
    </div>
  );
};
