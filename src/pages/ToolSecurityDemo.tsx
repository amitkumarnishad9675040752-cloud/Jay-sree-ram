import React, { useState } from 'react';
import { Key, Lock, Shield, ShoppingBag, MessageCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { apiRequest } from '../api';

interface ToolSecurityDemoProps {
  user: User;
  onNavigate: (page: string) => void;
  onRefreshUser: () => void;
}

export const ToolSecurityDemo: React.FC<ToolSecurityDemoProps> = ({ user, onNavigate, onRefreshUser }) => {
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!accessToken.trim()) {
      setError('Access Token is required.');
      return;
    }

    if (user.role !== 'admin' && user.credits < 1) {
      setError('Insufficient credits. 1 Credit required (₹99).');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/api/tools/check-security-code', {
        method: 'POST',
        body: JSON.stringify({ access_token: accessToken.trim() }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Failed generating security code');
      }

      setResult(res.data.data);
      onRefreshUser();
    } catch (err: any) {
      setError(err.message || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const hasInsufficientCredits = user.role !== 'admin' && user.credits < 1;

  return (
    <div className="max-w-md mx-auto space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-xl">
        <button
          onClick={() => onNavigate('dashboard')}
          className="p-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-right">
          <h1 className="text-sm font-bold text-white">03 CHECK SECURITY CODE</h1>
          <span className="text-[10px] text-amber-400 font-semibold">1 Credit Required</span>
        </div>
      </div>

      {/* Insufficient credits warning */}
      {hasInsufficientCredits && (
        <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-4 text-center space-y-3">
          <div className="inline-flex p-2.5 rounded-full bg-red-900/40 text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-red-200">INSUFFICIENT CREDITS</h3>
          <p className="text-[11px] text-red-300">You need 1 Credit to Check Security Code.</p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onNavigate('buy-credits')}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500 text-gray-950 hover:bg-amber-400 flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>BUY CREDIT</span>
            </button>
            <a
              href={`https://wa.me/919569086611?text=${encodeURIComponent('Hello, I need help buying credits for AMIT FF INFO STORE.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gray-950 border border-gray-800 text-amber-300 hover:bg-gray-900 flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>SUPPORT</span>
            </a>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-xl">
        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Access Token</label>
            <div className="relative">
              <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <textarea
                rows={3}
                required
                placeholder="Paste Access Token here..."
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-900/40">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || hasInsufficientCredits}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 hover:from-amber-400 hover:to-orange-400 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading ? 'Generating Code...' : 'CHECK (1 CREDIT)'}
          </button>
        </form>
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-gray-900/90 border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              <span>SECURITY CODE GENERATED</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
              {result.status}
            </span>
          </div>

          <div className="text-center py-3 bg-gray-950 border border-amber-500/30 rounded-xl">
            <p className="text-[10px] text-gray-400 font-semibold uppercase">SECURITY CODE</p>
            <p className="text-3xl font-mono font-black text-amber-400 tracking-widest mt-1">
              {result.security_code}
            </p>
          </div>

          <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-center">
            <p className="text-xs font-bold text-amber-300">{result.note}</p>
          </div>
        </div>
      )}
    </div>
  );
};
