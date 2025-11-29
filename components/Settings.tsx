import React from 'react';
import { Bell, Shield, User, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Platform Settings</h1>
        <p className="text-slate-500">Manage your account and system preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-800">Profile Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input type="text" defaultValue="John Doe" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <input type="text" defaultValue="Senior Recovery Officer" disabled className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" defaultValue="john.doe@bank.com" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
              <input type="text" defaultValue="Mumbai - Andheri East" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-800">Notifications & Alerts</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Legal Deadline Alerts</p>
                <p className="text-sm text-slate-500">Get notified 3 days before legal submission deadlines</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Auction Bids</p>
                <p className="text-sm text-slate-500">Real-time alerts for new bids on managed assets</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-800">Security & Compliance</h2>
          </div>
          <div className="p-6 space-y-4">
             <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
              </div>
              <button className="text-blue-600 font-medium hover:underline text-sm">Enable 2FA</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800">Audit Logs</p>
                <p className="text-sm text-slate-500">View recent account activity and access logs</p>
              </div>
              <button className="text-blue-600 font-medium hover:underline text-sm">View Logs</button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg flex items-center transition-colors shadow-sm">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};