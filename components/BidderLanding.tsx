import React, { useState } from 'react';
import { Building2, ArrowRight, ShieldCheck, Gavel, User, Mail, Lock, Phone, FileText, Loader2, Upload } from 'lucide-react';
import { loginUser, registerBidder } from '../services/apiClient';
import { User as UserType } from '../types';

interface BidderLandingProps {
  onLogin: (user: UserType) => void;
}

export const BidderLanding: React.FC<BidderLandingProps> = ({ onLogin }) => {
  const [view, setView] = useState<'home' | 'login' | 'register'>('home');
  const [isLoading, setIsLoading] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Register State
  const [regData, setRegData] = useState({ name: '', email: '', phone: '', aadhar: '', password: '' });
  const [panFile, setPanFile] = useState<File | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { user } = await loginUser(email, password);
      if (user.role !== 'Bidder') {
          setError("Access Denied: Only Bidders can login here.");
          return;
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!panFile) {
        alert("Please upload PAN Card");
        return;
    }
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('name', regData.name);
    formData.append('email', regData.email);
    formData.append('phone', regData.phone);
    formData.append('aadharNumber', regData.aadhar);
    formData.append('password', regData.password);
    formData.append('panDocument', panFile);

    try {
      await registerBidder(formData);
      alert("Registration Successful! Please wait for approval from the Recovery Officer.");
      setView('login');
    } catch (err: any) {
      alert(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors">
      
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-800 dark:text-white">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            FortiFi <span className="text-blue-600">Auctions</span>
          </div>
          <div className="flex gap-4">
             {view !== 'home' && (
                 <button onClick={() => setView('home')} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 font-medium">Home</button>
             )}
             {view === 'home' && (
                 <>
                    <button onClick={() => setView('login')} className="text-slate-600 dark:text-slate-300 hover:text-blue-600 font-medium px-4">Login</button>
                    <button onClick={() => setView('register')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">Register to Bid</button>
                 </>
             )}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center min-h-[80vh]">
        
        {view === 'home' && (
            <div className="text-center max-w-3xl animate-fade-in">
                <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
                    Premium Bank Assets. <br />
                    <span className="text-blue-600">Transparent Auctions.</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                    FortiFi is the official digital auction platform for participating in the sale of secured banking assets. 
                    Register today, get verified, and bid on residential, commercial, and industrial properties in real-time.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <ShieldCheck className="w-10 h-10 text-green-500 mx-auto mb-4" />
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Verified Listings</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">All assets are legally verified and compliant with SARFAESI Act.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <Gavel className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Fair E-Auctions</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Transparent real-time bidding system with instant updates.</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <Building2 className="w-10 h-10 text-purple-500 mx-auto mb-4" />
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Prime Properties</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Access to a wide range of commercial and residential real estate.</p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <button onClick={() => setView('register')} className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:transform hover:scale-105 transition-all">
                      Start Bidding Today <ArrowRight className="inline ml-2" />
                  </button>
                  <a href="/" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 text-sm mt-4 flex items-center">
                    <Building2 className="w-4 h-4 mr-1" /> Bank Officer Login
                  </a>
                </div>
            </div>
        )}

        {view === 'login' && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-700 animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">Bidder Login</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                            <input 
                                type="email" required 
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                                value={email} onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
                            <input 
                                type="password" required 
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white"
                                value={password} onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition-colors flex justify-center">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Login'}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <button onClick={() => setView('register')} className="text-sm text-slate-500 hover:text-blue-600">Don't have an account? Register</button>
                </div>
            </div>
        )}

        {view === 'register' && (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-lg border border-slate-100 dark:border-slate-700 animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 text-center">Bidder Registration</h2>
                <p className="text-center text-slate-500 text-sm mb-6">Complete KYC to get approved for bidding.</p>
                
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                <input required className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm" 
                                    value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                <input required className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm" 
                                    value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            <input type="email" required className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm" 
                                value={regData.email} onChange={e => setRegData({...regData, email: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Aadhar Number</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            <input required className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm" 
                                placeholder="XXXX-XXXX-XXXX"
                                value={regData.aadhar} onChange={e => setRegData({...regData, aadhar: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload PAN Card</label>
                        <div className="border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">
                             <input type="file" required accept="image/*,.pdf" onChange={e => setPanFile(e.target.files?.[0] || null)} className="hidden" id="pan-upload" />
                             <label htmlFor="pan-upload" className="cursor-pointer flex flex-col items-center">
                                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">{panFile ? panFile.name : "Click to upload PAN Card (Image/PDF)"}</span>
                             </label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Create Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                            <input type="password" required className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-700 dark:text-white text-sm" 
                                value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})}
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition-colors flex justify-center">
                        {isLoading ? <Loader2 className="animate-spin" /> : 'Submit Registration'}
                    </button>
                </form>
            </div>
        )}

      </div>
    </div>
  );
};