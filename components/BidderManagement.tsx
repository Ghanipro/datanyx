import React, { useState, useEffect } from 'react';
import { Bidder } from '../types';
import { fetchBidders, updateBidderStatus } from '../services/apiClient';
import { CheckCircle, Clock, XCircle, ShieldCheck, Eye, Loader2 } from 'lucide-react';

export const BidderManagement: React.FC = () => {
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'verified'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadBidders();
  }, []);

  const loadBidders = async () => {
    try {
      const data = await fetchBidders();
      setBidders(Array.isArray(data) ? data : []);
    } catch (e) {
      setBidders([]);
    }
  };

  const handleStatusChange = async (id: string, status: 'verified' | 'rejected') => {
    if(!confirm(`Are you sure you want to ${status} this bidder?`)) return;
    setProcessing(id);
    try {
      await updateBidderStatus(id, status);
      await loadBidders();
    } catch (e) {
      alert("Action failed. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const getDocUrl = (path?: string) => {
    if(!path) return '#';
    return `http://127.0.0.1:5000/${path}`;
  }

  const pendingBidders = bidders.filter(b => b.kycStatus === 'pending');
  const verifiedBidders = bidders.filter(b => b.kycStatus !== 'pending');

  const displayedBidders = activeTab === 'pending' ? pendingBidders : verifiedBidders;

  return (
    <div className="space-y-6 animate-fade-in pb-12 px-6">
      <div className="mb-6 mt-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Bidder Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Review KYC documents and approve auction participants</p>
      </div>

      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-4 font-medium transition-colors relative ${
            activeTab === 'pending' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Pending Requests
          {pendingBidders.length > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
              {pendingBidders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'verified' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          Verified / Rejected Database
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Bidder Info</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Identity Proofs</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {displayedBidders.map((bidder) => (
              <tr key={bidder.id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800 dark:text-white">{bidder.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{bidder.email}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{bidder.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                      <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center">
                          <span className="font-medium w-16 text-slate-500">Aadhar:</span> 
                          {bidder.aadharNumber || 'N/A'}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center">
                          <span className="font-medium w-16 text-slate-500">PAN:</span> 
                          {bidder.panUrl ? (
                              <a href={getDocUrl(bidder.panUrl)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
                                  View Doc <Eye className="w-3 h-3 ml-1" />
                              </a>
                          ) : <span className="text-slate-400">Not Uploaded</span>}
                      </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    bidder.kycStatus === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                    bidder.kycStatus === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {bidder.kycStatus === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {bidder.kycStatus === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {bidder.kycStatus === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                    {bidder.kycStatus.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {bidder.kycStatus === 'pending' ? (
                     <div className="flex gap-2">
                        <button 
                            onClick={() => handleStatusChange(bidder.id, 'verified')}
                            disabled={!!processing}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center text-sm shadow-sm"
                        >
                            {processing === bidder.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <> <ShieldCheck className="w-4 h-4 mr-1" /> Approve </>}
                        </button>
                        <button 
                            onClick={() => handleStatusChange(bidder.id, 'rejected')}
                            disabled={!!processing}
                            className="bg-white border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors flex items-center text-sm"
                        >
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                        </button>
                     </div>
                  ) : (
                    <span className="text-sm text-slate-400 italic">No actions available</span>
                  )}
                </td>
              </tr>
            ))}
            {displayedBidders.length === 0 && (
               <tr>
                 <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-2">
                      <ShieldCheck className="w-6 h-6 text-slate-400" />
                    </div>
                    No {activeTab} bidders found.
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};