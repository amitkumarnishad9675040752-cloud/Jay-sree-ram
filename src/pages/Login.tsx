import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Shield, Phone, MessageCircle } from 'lucide-react';
import { FFLogo } from '../components/FFLogo';
import { apiRequest } from '../api';

interface LoginProps {
  onLoginSuccess: (token: string, user: any) => void;
  onNavigateToSignup: () => void;
  onNavigateToAdminLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  onNavigateToSignup,
  onNavigateToAdminLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Login failed');
      }

      onLoginSuccess(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4 py-6 max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-amber-950/60 border border-amber-800/80 mb-3 shadow-xl shadow-amber-500/10">
          <FFLogo size="xl" />
        </div>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200 tracking-wider">
          AMIT FF INFO STORE
        </h1>
        <p className="text-xs text-amber-300/90 font-bold mt-1">Garena Free Fire Tools & Account Portal</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Card */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-950 hover:from-cyan-400 hover:to-emerald-400 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? (
              'Authenticating...'
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>LOG IN</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Account Links */}
      <div className="text-center mt-5 space-y-3">
        <p className="text-xs text-gray-400">
          Don't have a account yet?{' '}
          <button
            onClick={onNavigateToSignup}
            className="font-bold text-cyan-400 hover:underline ml-1"
          >
            Sign Up
          </button>
        </p>

        <div>
          <button
            onClick={onNavigateToAdminLogin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-[11px] font-medium text-gray-400 hover:text-cyan-300 hover:border-cyan-800 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Admin Portal Login</span>
          </button>
        </div>

        {/* Sampark / Direct Call & Support */}
        <div className="pt-2 border-t border-gray-800/60">
          <p className="text-[11px] text-gray-400 font-medium mb-2">Sampark Karein / Direct Helpline:</p>
          <div className="flex items-center justify-center gap-2">
            <a
              href="tel:9569086611"
              className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              <span>Call: 9569086611</span>
            </a>
            <a
              href={`https://wa.me/919569086611?text=${encodeURIComponent('Hello, I need help logging into AMIT FF INFO STORE.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-emerald-300 hover:bg-gray-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
