import React, { useState } from 'react';
import { Mail, ShieldCheck, ShoppingBag, MessageCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import { apiRequest } from '../api';

interface ToolOtpDemoProps {
  user: User;
  onNavigate: (page: string) => void;
  onRefreshUser: () => void;
}

export const ToolOtpDemo: React.FC<ToolOtpDemoProps> = ({ user, onNavigate, onRefreshUser }) => {
  const [gmail, setGmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!gmail || !gmail.includes('@')) {
      setError('Please enter a valid Gmail address.');
      return;
    }

    if (user.role !== 'admin' && user.credits < 1) {
      setError('Insufficient credits. 1 Credit required (₹99).');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest('/api/tools/unsubscribe-otp', {
        method: 'POST',
        body: JSON.stringify({ gmail: gmail.trim() }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Failed generating demo OTP');
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
          <h1 className="text-sm font-bold text-white">02 SSO DOUBLE UNSUB OTP</h1>
          <span className="text-[10px] text-emerald-400 font-semibold">1 Credit Required</span>
        </div>
      </div>

      {/* Credit Warning */}
      {hasInsufficientCredits && (
        <div className="bg-red-950/60 border border-red-800/80 rounded-2xl p-4 text-center space-y-3">
          <div className="inline-flex p-2.5 rounded-full bg-red-900/40 text-red-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-red-200">INSUFFICIENT CREDITS</h3>
          <p className="text-[11px] text-red-300">You need 1 Credit to run SSO Double Unsubscribe OTP Sender.</p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onNavigate('buy-credits')}
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-500 text-gray-950 hover:bg-emerald-400 flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>BUY CREDIT</span>
            </button>
            <a
              href={`https://wa.me/919569086611?text=${encodeURIComponent('Hello, I need help buying credits for AMIT FF INFO STORE.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gray-950 border border-gray-800 text-emerald-300 hover:bg-gray-900 flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>SUPPORT</span>
            </a>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-xl">
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Target Gmail ID</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="target@gmail.com"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
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
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 hover:from-emerald-400 hover:to-teal-400 active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Sending Request...' : 'SEND OTP (1 CREDIT)'}
          </button>
        </form>
      </div>

      {/* Output Result */}
      {result && (
        <div className="bg-gray-900/90 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>UNSUBSCRIBE OTP RESULT</span>
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${result.status === 'SUCCESS' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'}`}>
              {result.status || 'PROCESSED'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-800">
              <span className="text-gray-400">Target Email:</span>
              <span className="text-white font-bold">{result.original_email || result.target_gmail || gmail}</span>
            </div>
            {result.using_email && (
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400">Converted Email:</span>
                <span className="text-emerald-400 font-mono font-bold">{result.using_email}</span>
              </div>
            )}
            {result.http_code && (
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span className="text-gray-400">HTTP Status Code:</span>
                <span className="text-cyan-400 font-bold">{result.http_code}</span>
              </div>
            )}
          </div>

          {result.response_message && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-left">
              <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">API Response:</p>
              <p className="text-xs font-mono text-gray-200 break-all">{typeof result.response_message === 'object' ? JSON.stringify(result.response_message, null, 2) : result.response_message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
