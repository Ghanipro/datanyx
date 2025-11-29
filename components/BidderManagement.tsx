
import React, { useState, useEffect } from 'react';
import { Bidder } from '../types';
import { createBidder, fetchBidders } from '../services/apiClient';
import { Plus, CheckCircle, Clock, X } from 'lucide-react';

export const BidderManagement: React.FC = () => {
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBidders();
  }, []);

  const loadBidders = async () => {
    const data = await fetchBidders();
    setBidders(data);
  };

  const handleAddBidder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const newBidder = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      kycStatus: 'pending' as const
    };

    try {
      await createBidder(newBidder);
      await loadBidders();
      setShowModal(false);
      alert("Bidder created successfully. Credentials have been sent to their email.");
    } catch (e) {
      alert("Failed to create bidder");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bidder Management</h1>
          <p className="text-slate-500">Register and verify auction participants</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center hover:bg-slate-800"
        >
          <Plus className="w-4 h-4 mr-2" /> Register Bidder
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Contact Info</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">KYC Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bidders.map((bidder) => (
              <tr key={bidder.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{bidder.name}</div>
                  <div className="text-xs text-slate-400">ID: {bidder.id.slice(-6)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-600">{bidder.email}</div>
                  <div className="text-sm text-slate-600">{bidder.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    bidder.kycStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bidder.kycStatus === 'verified' ? <CheckCircle className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                    {bidder.kycStatus.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                </td>
              </tr>
            ))}
            {bidders.length === 0 && (
               <tr>
                 <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No bidders registered yet.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Register New Bidder</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleAddBidder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input name="name" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input name="email" type="email" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input name="phone" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
                  {submitting ? 'Creating...' : 'Create Bidder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
