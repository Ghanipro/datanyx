import React, { useState } from 'react';
import { 
  LayoutDashboard, Building2, Gavel, Users, Settings, 
  Menu, Bell, Search, LogOut, ChevronDown 
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AssetList } from './components/AssetList';
import { AssetDetail } from './components/AssetDetail';
import { Asset } from './types';
import { MOCK_ASSETS } from './services/mockData';

function App() {
  const [activeModule, setActiveModule] = useState<'dashboard' | 'assets' | 'auctions' | 'bidders'>('dashboard');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleUpdateAsset = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
    setSelectedAsset(updatedAsset);
  };

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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
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
          <button className="flex items-center text-slate-400 hover:text-white w-full px-4 py-2 transition-colors">
            <Settings className="w-5 h-5 mr-3" />
            {isSidebarOpen && <span>Settings</span>}
          </button>
          <button className="flex items-center text-slate-400 hover:text-white w-full px-4 py-2 mt-1 transition-colors">
            <LogOut className="w-5 h-5 mr-3" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 mr-4">
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
            <button className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                JD
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-800">John Doe</p>
                <p className="text-xs text-slate-500">Recovery Officer</p>
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
                    <button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      + Add New Asset
                    </button>
                  </div>
                  <AssetList assets={assets} onSelectAsset={setSelectedAsset} />
                </>
              )}

              {activeModule === 'auctions' && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <Gavel className="w-16 h-16 text-slate-300 mb-4" />
                  <h2 className="text-xl font-semibold text-slate-700">Auction Module</h2>
                  <p className="text-slate-500 mt-2">Access active listings and bidding history.</p>
                </div>
              )}

              {activeModule === 'bidders' && (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <Users className="w-16 h-16 text-slate-300 mb-4" />
                  <h2 className="text-xl font-semibold text-slate-700">Bidder Network</h2>
                  <p className="text-slate-500 mt-2">Manage KYC and outreach campaigns.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
