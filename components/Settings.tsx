
import React, { useState } from 'react';
import { Bell, Shield, User, Save, Moon, Sun, Loader2 } from 'lucide-react';
import { User as UserType } from '../types';
import { updateUserProfile } from '../services/apiClient';

interface SettingsProps {
  user: UserType;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onUpdateUser: (updatedUser: UserType) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, darkMode, toggleDarkMode, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    branch: user.branch || 'Head Office'
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = await updateUserProfile(user.id, formData);
      onUpdateUser(updatedUser);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Failed to update profile.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10 px-6">
      <div className="mb-8 mt-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Platform Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account and system preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Profile Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input 
                name="name" 
                type="text" 
                value={formData.name} 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
              <input type="text" value={user.role} disabled className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Branch</label>
              <input 
                name="branch" 
                type="text" 
                value={formData.branch} 
                onChange={handleInputChange} 
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white" 
              />
            </div>
          </div>
        </div>

         {/* Appearance */}
         <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-purple-500" /> : <Sun className="w-5 h-5 text-orange-500" />}
            <h2 className="font-semibold text-slate-800 dark:text-white">Appearance</h2>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800 dark:text-white">Dark Mode</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-slate-800 dark:text-white">Notifications & Alerts</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800 dark:text-white">Legal Deadline Alerts</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Get notified 3 days before legal submission deadlines</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-800 dark:text-white">Auction Bids</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Real-time alerts for new bids on managed assets</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center transition-colors shadow-sm disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
