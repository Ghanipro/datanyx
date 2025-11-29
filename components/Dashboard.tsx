
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Asset, AssetStatus, AssetType } from '../types';
import { AlertTriangle, TrendingUp, DollarSign, Building, AlertCircle } from 'lucide-react';

interface DashboardProps {
  assets: Asset[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC<DashboardProps> = ({ assets }) => {
  const totalOutstanding = assets.reduce((acc, curr) => acc + curr.outstandingAmount, 0);
  const totalPotentialRecovery = assets.reduce((acc, curr) => acc + curr.marketValue, 0);
  const highRiskAssets = assets.filter(a => a.riskScore > 70).length;
  
  const statusData = Object.values(AssetStatus).map(status => ({
    name: status,
    count: assets.filter(a => a.status === status).length
  }));

  const typeData = Object.values(AssetType).map(type => ({
    name: type,
    value: assets.filter(a => a.type === type).length
  })).filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Exposure</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{(totalOutstanding / 10000000).toFixed(2)} Cr
              </h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <span className="text-2xl text-red-600">₹</span>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Recovery Potential</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                ₹{(totalPotentialRecovery / 10000000).toFixed(2)} Cr
              </h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            Cover Ratio: {((totalPotentialRecovery / totalOutstanding) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Cases</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {assets.length}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">
            {assets.filter(a => a.status === AssetStatus.AUCTION_SCHEDULED).length} in Auction
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">High Risk Assets</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {highRiskAssets}
              </h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-orange-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span>Need immediate action</span>
          </div>
        </div>
      </div>

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart - Assets by Type */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-6">Asset Portfolio by Type</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart - Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-6">Case Status Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Assets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
