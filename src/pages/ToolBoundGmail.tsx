import React, { useState } from 'react';
import { Mail, Key, Shield, ShoppingBag, MessageCircle, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { apiRequest } from '../api';

interface ToolBoundGmailProps {
  user: User;
  onNavigate: (page: string) => void;
  onRefreshUser: () => void;
}

export const ToolBoundGmail: React.FC<ToolBoundGmailProps> = ({ user, onNavigate, onRefreshUser }) => {
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
      const res = await apiRequest('/api/tools/bound-gmail', {
        method: 'POST',
        body: JSON.stringify({ access_token: accessToken.trim() }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Failed checking bound gmail');
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
          <h1 className="text-sm font-bold text-white">01 BOUND GMAIL CHECKER</h1>
          <span className="text-[10px] text-cyan-400 font-semibold">1 Credit Required</span>
        </div>
      </div>

      {/* Credit Warning if 0 */}
      {hasInsufficientCredits && (
        <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-4 text-center space-y-3">
          <div className="inline-flex p-2.5 rounded-full bg-red-900/40 text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-red-200">INSUFFICIENT CREDITS</h3>
          <p className="text-[11px] text-red-300">You need 1 Credit to run Bound Gmail Checker.</p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onNavigate('buy-credits')}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-cyan-500 text-gray-950 hover:bg-cyan-400 flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>BUY 1 CR — ₹99</span>
            </button>
            <a
              href={`https://wa.me/919569086611?text=${encodeURIComponent('Hello, I need help buying credits for AMIT FF INFO STORE.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>SUPPORT</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Input Form */}
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
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
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
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-950 hover:from-cyan-400 hover:to-emerald-400 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            {loading ? 'Checking Status...' : 'CHECK BOUND GMAIL (1 CREDIT)'}
          </button>
        </form>
      </div>

      {/* Detailed Result Output */}
      {result && (
        <div className="bg-gray-900/90 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>GARENA BIND INFO RESULT</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {result.status || 'CHECKED'}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-gray-800/60">
              <span className="text-gray-400">Current Email:</span>
              <span className="text-emerald-400 font-bold">{result.current_email || result.bound_gmail || 'Not Bound'}</span>
            </div>
            {result.pending_email && result.pending_email !== 'None' && (
              <div className="flex justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Pending Email:</span>
                <span className="text-yellow-400 font-bold">{result.pending_email}</span>
              </div>
            )}
            {result.email_to_be && result.email_to_be !== 'None' && (
              <div className="flex justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Email To Be:</span>
                <span className="text-cyan-400 font-bold">{result.email_to_be}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-gray-800/60">
              <span className="text-gray-400">Mobile Number:</span>
              <span className="text-white font-bold">{result.mobile || 'None'}</span>
            </div>
            {result.countdown_human && (
              <div className="flex justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Countdown Timer:</span>
                <span className="text-yellow-300 font-bold">{result.countdown_human}</span>
              </div>
            )}
            {result.bind_status_text && (
              <div className="flex justify-between py-1.5 border-b border-gray-800/60">
                <span className="text-gray-400">Bind Status:</span>
                <span className="text-cyan-300 font-bold">{result.bind_status_text}</span>
              </div>
            )}
          </div>

          {/* Secondary Links / Bounded Platforms */}
          {result.bounded_accounts && result.bounded_accounts.length > 0 ? (
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wide">Secondary Links / Bounded Platforms</h4>
              <div className="space-y-1.5">
                {result.bounded_accounts.map((acc: any, idx: number) => (
                  <div key={idx} className="bg-gray-950 p-2.5 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-cyan-400">{acc.platform}</span>
                      {acc.nickname && <span className="text-gray-400 text-[10px] block">Name: {acc.nickname}</span>}
                      {acc.email && <span className="text-gray-300 text-[11px] block">{acc.email}</span>}
                    </div>
                    {acc.uid && <span className="text-[10px] font-mono text-gray-500">UID: {acc.uid}</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-800 text-[11px] text-gray-400">
              <span>Secondary Links: None found</span>
            </div>
          )}

          {/* Summary / Note */}
          {result.summary && (
            <div className="bg-cyan-950/40 border border-cyan-800/40 p-3 rounded-xl text-[11px] text-cyan-300">
              <p className="font-semibold">{result.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
