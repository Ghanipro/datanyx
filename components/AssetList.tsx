
import React, { useState } from 'react';
import { Asset, AssetStatus, AssetType } from '../types';
import { MapPin, AlertCircle, ChevronRight } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
  onSelectAsset: (asset: Asset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({ assets, onSelectAsset }) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = assets.filter(asset => {
    const matchesType = filterType === 'All' || asset.type === filterType;
    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
    const matchesSearch = asset.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/800x400?text=No+Image';
    if (url.startsWith('http')) return url;
    return `http://127.0.0.1:5000/${url.replace(/\\/g, '/')}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between transition-colors">
        <div className="flex gap-4 flex-wrap">
           <input 
            type="text" 
            placeholder="Search borrower or location..." 
            className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-white dark:bg-slate-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select 
            className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Showing {filteredAssets.length} assets
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map(asset => (
          <div 
            key={asset.id} 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onSelectAsset(asset)}
          >
            <div className="h-48 w-full bg-slate-100 dark:bg-slate-700 relative">
              <img 
                src={getImageUrl(asset.imageUrl)} 
                alt={asset.borrowerName} 
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/800x400?text=No+Image'; }} 
              />
              <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
                {asset.type}
              </div>
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold shadow-sm text-white ${
                asset.status === AssetStatus.AUCTION_SCHEDULED ? 'bg-green-500' : 
                asset.status === AssetStatus.NEW ? 'bg-blue-500' : 'bg-slate-600'
              }`}>
                {asset.status}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                {asset.borrowerName}
              </h3>
              <div className="flex items-start text-slate-500 dark:text-slate-400 text-sm mb-4">
                <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{asset.address}, {asset.city}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Outstanding</p>
                  <p className="font-semibold text-slate-800 dark:text-white">₹{(asset.outstandingAmount/100000).toFixed(1)} L</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 p-2 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Recovery Value</p>
                  <p className="font-semibold text-green-700 dark:text-green-400">₹{(asset.marketValue/100000).toFixed(1)} L</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <AlertCircle className={`w-4 h-4 mr-1 ${asset.riskScore > 70 ? 'text-red-500' : 'text-orange-400'}`} />
                  Risk Score: {asset.riskScore}/100
                </div>
                <button className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-400 text-sm font-medium flex items-center">
                  Details <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
