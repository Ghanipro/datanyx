
import React, { useState } from 'react';
import { Building2, Lock, Mail, ArrowRight, User as UserIcon, Gavel } from 'lucide-react';
import { loginUser, registerUser, forgotPassword } from '../services/apiClient';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { user } = await loginUser(email, password);
        onLogin(user);
      } else if (mode === 'signup') {
        const { user } = await registerUser(name, email, password);
        onLogin(user);
      } else if (mode === 'forgot') {
        const { message } = await forgotPassword(email);
        setSuccessMsg(message); // Displays the temp password message
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4 shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">FortiFi</h2>
          <p className="text-slate-400 mt-2 text-sm">Bank Asset Recovery Platform</p>
        </div>
        
        {/* Tabs */}
        {mode !== 'forgot' && (
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Login
            </button>
            <button 
              onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${mode === 'signup' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign Up
            </button>
          </div>
        )}

        <div className="p-8">
          {mode === 'forgot' && (
             <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
                <p className="text-sm text-slate-500">Enter your email to receive a temporary password.</p>
             </div>
          )}

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-200">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    required={mode === 'signup'}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                  placeholder="officer@bank.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : (
                <>
                  {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm space-y-3">
            {mode === 'login' && (
              <button onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }} className="text-blue-600 hover:underline">Forgot Password?</button>
            )}
            {mode === 'forgot' && (
              <button onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }} className="text-slate-500 hover:text-slate-700">Back to Login</button>
            )}
            {mode === 'signup' && (
              <button onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }} className="text-slate-500 hover:text-slate-700">Already have an account? Login</button>
            )}

            <div className="pt-4 border-t border-slate-100">
               <a href="/bid" className="inline-flex items-center text-slate-600 hover:text-blue-700 font-medium">
                  <Gavel className="w-4 h-4 mr-2" /> Go to Bidder Portal
               </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
