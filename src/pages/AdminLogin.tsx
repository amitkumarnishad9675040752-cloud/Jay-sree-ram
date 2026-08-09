import React, { useState } from 'react';
import { Shield, Lock, Mail, LogIn, AlertCircle } from 'lucide-react';
import { FFLogo } from '../components/FFLogo';
import { apiRequest } from '../api';

interface AdminLoginProps {
  onAdminLoginSuccess: (token: string, user: any) => void;
  onNavigateToUserLogin: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onAdminLoginSuccess,
  onNavigateToUserLogin,
}) => {
  const [email, setEmail] = useState('akffking956908@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Admin email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Admin login failed');
      }

      onAdminLoginSuccess(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-4 py-6 max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-amber-950/80 border border-amber-800/80 mb-3 shadow-xl shadow-amber-500/10">
          <FFLogo size="xl" />
        </div>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200 tracking-wider">
          AMIT FF INFO STORE
        </h1>
        <p className="text-xs text-amber-300 font-semibold mt-1">Admin Portal System</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Login Card */}
      <div className="bg-gray-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-950 hover:from-cyan-400 hover:to-emerald-400 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? (
              'Authenticating Admin...'
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>ACCESS ADMIN SYSTEM</span>
              </>
            )}
          </button>
        </form>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={onNavigateToUserLogin}
          className="text-xs text-gray-400 hover:text-cyan-400 underline"
        >
          Return to Normal User Login
        </button>
      </div>
    </div>
  );
};
