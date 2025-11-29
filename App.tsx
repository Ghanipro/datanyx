
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Building2, Gavel, Users, Settings as SettingsIcon, 
  Menu, Bell, Search, LogOut, ChevronDown, Plus, X, Loader2
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AssetList } from './components/AssetList';
import { AssetDetail } from './components/AssetDetail';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { BidderPortal } from './components/BidderPortal';
import { BidderManagement } from './components/BidderManagement';
import { Asset, User, Notification, AssetType, AssetStatus } from './types';
import { fetchAssets, createAsset, fetchNotifications } from './services/apiClient';
import { analyzeAssetRisk } from './services/geminiService';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeModule, setActiveModule] = useState<'dashboard' | 'assets' | 'auctions' | 'bidders' | 'settings'>('dashboard');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Modals & Popups
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Auth Effect
  useEffect(() => {
    if (user && user.role === 'Recovery Officer') {
      loadAssets();
      loadNotifications();
    }
  }, [user]);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAssets();
      setAssets(data);
    } catch (error) {
      console.error("Failed to load assets", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    if(!user) return;
    try {
      const data = await fetchNotifications(user.id);
      setNotifications(data);
    } catch (e) {
      console.log("Error loading notifications", e);
    }
  };

  const handleUpdateAsset = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    setSelectedAsset(updatedAsset);
  };

  // Add Asset Form Handler
  const handleAddAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingAsset(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // 1. Get description and values for AI analysis
    const description = formData.get('description') as string;
    const amount = Number(formData.get('amount'));
    const type = formData.get('type') as string;

    // 2. Perform AI Risk Analysis
    setAiAnalyzing(true);
    let riskData = { riskScore: 50, recoveryProbability: 50 };
    try {
      riskData = await analyzeAssetRisk(description, amount, type);
    } catch (e) {
      console.error("AI Analysis failed, using defaults");
    }
    setAiAnalyzing(false);

    // 3. Prepare Payload (using FormData for file upload)
    // We already have the form data, we just need to append the AI fields and computed fields
    // Note: To send strict JSON types alongside File in standard FormData, typical approach is appending fields
    
    // Required fields mapping
    formData.append('outstandingAmount', amount.toString());
    formData.append('loanAccountNumber', formData.get('loanAccount') as string);
    formData.append('riskScore', riskData.riskScore.toString());
    formData.append('recoveryProbability', riskData.recoveryProbability.toString());
    formData.append('reservePrice', (Number(formData.get('marketValue')) * 0.85).toString());
    formData.append('status', AssetStatus.NEW);
    formData.append('coordinates[lat]', '20.5937');
    formData.append('coordinates[lng]', '78.9629');

    // The 'image' file input is already in formData as 'image'

    try {
      const created = await createAsset(formData);
      setAssets([...assets, created]);
      setShowAddAssetModal(false);
      loadNotifications();
    } catch (error) {
      console.error(error);
      alert("Failed to create asset.");
    } finally {
      setIsSubmittingAsset(false);
    }
  };

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

  // --- BIDDER PORTAL VIEW ---
  if (user.role === 'Bidder') {
    return <BidderPortal user={user} onLogout={() => setUser(null)} />;
  }

  // --- RECOVERY OFFICER VIEW ---
  const NavItem = ({ id, icon: Icon, label }: { id: typeof activeModule, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveModule(id); setSelectedAsset(null); }}
      className={`w-full flex items-center px-4 py-3 mb-1 rounded-lg transition-colors ${
        activeModule === id && !selectedAsset
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden animate-fade-in">
      
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex-shrink-0 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
             <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
               <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                 <Building2 className="w-5 h-5 text-white" />
               </div>
               RecoverAI
             </div>
          ) : (
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto">
              <Building2 className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <NavItem id="dashboard" icon={LayoutDashboard} label={isSidebarOpen ? "Dashboard" : ""} />
          <NavItem id="assets" icon={Building2} label={isSidebarOpen ? "Assets" : ""} />
          <NavItem id="auctions" icon={Gavel} label={isSidebarOpen ? "Auctions" : ""} />
          <NavItem id="bidders" icon={Users} label={isSidebarOpen ? "Bidders" : ""} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => { setActiveModule('settings'); setSelectedAsset(null); }}
            className={`flex items-center w-full px-4 py-2 transition-colors ${
              activeModule === 'settings' ? 'text-white bg-slate-800 rounded-lg' : 'text-slate-400 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-5 h-5 mr-3" />
            {isSidebarOpen && <span>Settings</span>}
          </button>
          
          <button 
            onClick={() => setUser(null)}
            className="flex items-center text-slate-400 hover:text-red-400 w-full px-4 py-2 mt-2 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 mr-4"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-fade-in">
                  <div className="p-3 border-b border-slate-100 font-semibold text-slate-800 bg-slate-50">Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-sm text-slate-500">No new notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                          <div className="flex justify-between items-start">
                             <p className="text-sm font-medium text-slate-800">{n.title}</p>
                             <span className={`w-2 h-2 rounded-full mt-1.5 ${n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1 text-right">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                {user.name.slice(0, 2)}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Dynamic View Area */}
        <main className="flex-1 overflow-auto bg-slate-50">
          {selectedAsset ? (
            <AssetDetail 
              asset={selectedAsset} 
              onBack={() => setSelectedAsset(null)}
              onUpdateAsset={handleUpdateAsset}
            />
          ) : (
            <div className="p-6 max-w-7xl mx-auto w-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                   <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                   <span className="ml-3 text-slate-500 font-medium">Loading Data...</span>
                </div>
              ) : (
                <>
                  {activeModule === 'dashboard' && (
                    <>
                      <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                        <p className="text-slate-500">Overview of recovery performance and risks</p>
                      </div>
                      <Dashboard assets={assets} />
                    </>
                  )}

                  {activeModule === 'assets' && (
                    <>
                      <div className="mb-8 flex justify-between items-end">
                        <div>
                          <h1 className="text-2xl font-bold text-slate-800">Asset Management</h1>
                          <p className="text-slate-500">Manage and track non-performing assets</p>
                        </div>
                        <button 
                          onClick={() => setShowAddAssetModal(true)}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Add New Asset
                        </button>
                      </div>
                      <AssetList assets={assets} onSelectAsset={setSelectedAsset} />
                    </>
                  )}

                  {/* Add Asset Modal */}
                  {showAddAssetModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
                      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                          <h2 className="text-xl font-bold text-slate-800">Add New Asset</h2>
                          <button onClick={() => setShowAddAssetModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <form onSubmit={handleAddAsset} className="p-6 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Borrower Name</label>
                               <input name="borrowerName" required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Acme Corp" />
                             </div>
                             <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Loan Account No.</label>
                               <input name="loanAccount" required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="LN-XXXX-XXXX" />
                             </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                               <select name="type" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                 {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                               </select>
                             </div>
                             <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Outstanding Amount (₹)</label>
                               <input name="amount" required type="number" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                             </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Property Address</label>
                            <input name="address" required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Street Address" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                               <input name="city" required type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="City" />
                             </div>
                             <div>
                               <label className="block text-sm font-medium text-slate-700 mb-1">Market Value (Est. ₹)</label>
                               <input name="marketValue" required type="number" min="0" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" />
                             </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Property Image</label>
                            <input type="file" name="image" accept="image/*" className="w-full border border-slate-300 rounded-lg p-2 text-sm" required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description (used for AI Risk Score)</label>
                            <textarea name="description" required className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 outline-none resize-none" placeholder="Detailed description of the asset..."></textarea>
                          </div>
                          
                          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
                            <button type="button" onClick={() => setShowAddAssetModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                            <button 
                              type="submit" 
                              disabled={isSubmittingAsset || aiAnalyzing}
                              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                              {(isSubmittingAsset || aiAnalyzing) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                              {aiAnalyzing ? 'Analyzing Risk...' : isSubmittingAsset ? 'Creating...' : 'Create Asset'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {activeModule === 'auctions' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                      <div className="p-6 border-b border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800">Auction Overview</h2>
                        <p className="text-slate-500">Live auctions and bidding activity</p>
                      </div>
                      <div className="p-6">
                        <p className="text-slate-500">As a Recovery Officer, you can manage auctions from the individual Asset detail pages. Use the "Schedule Auction" button in the Asset view.</p>
                      </div>
                    </div>
                  )}

                  {activeModule === 'bidders' && (
                    <BidderManagement />
                  )}

                  {activeModule === 'settings' && (
                    <Settings />
                  )}
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
