import React, { useState } from 'react';
import { Zap, ShoppingBag, Gift, ArrowRight, ShieldCheck, MailCheck, Lock, Sparkles, CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import { User } from '../types';
import { FFLogo } from '../components/FFLogo';
import { apiRequest } from '../api';

interface DashboardProps {
  user: User;
  onNavigate: (page: string) => void;
  onRefreshUser: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate, onRefreshUser }) => {
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;

    setRedeemLoading(true);
    setRedeemMessage(null);

    try {
      const res = await apiRequest('/api/user/redeem', {
        method: 'POST',
        body: JSON.stringify({ code: redeemCode.trim() }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Redeem code failed');
      }

      setRedeemMessage({ type: 'success', text: res.data.message });
      setRedeemCode('');
      onRefreshUser();
    } catch (err: any) {
      setRedeemMessage({ type: 'error', text: err.message || 'Error redeeming code' });
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Brand Store Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950 via-gray-900 to-orange-950 border border-amber-800/60 p-4 shadow-xl flex items-center gap-3">
        <div className="shrink-0 p-1 bg-gray-950/80 rounded-xl border border-amber-500/30">
          <FFLogo size="lg" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200">
            AMIT FF INFO STORE
          </h1>
          <p className="text-[11px] text-amber-200/90 font-bold leading-snug">
            Garena Free Fire Official Tools & Account Services
          </p>
        </div>
      </div>

      {/* Account Credits Overview Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 border border-gray-800 p-5 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Account Balance</p>
            <h2 className="text-3xl font-black text-white flex items-center gap-1.5 mt-0.5">
              <span>{user.role === 'admin' ? 'UNLIMITED' : user.credits}</span>
              <span className="text-sm font-bold text-cyan-400">CREDITS</span>
            </h2>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              1 CR = ₹99
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-800/80">
          <button
            onClick={() => onNavigate('buy-credits')}
            className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-950 hover:from-cyan-400 hover:to-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>BUY CREDITS</span>
          </button>

          <button
            onClick={() => onNavigate('transactions')}
            className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gray-950 border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>TRANSACTIONS</span>
          </button>
        </div>
      </div>

      {/* Direct Contact Support Box (Sampark Karein) */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-gray-900 to-teal-950/90 border border-emerald-800/80 rounded-2xl p-4 shadow-xl text-center space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider">Direct Helpline / Sampark</p>
              <h3 className="text-sm font-black text-white tracking-wide">DIRECT CONTACT HELP & SUPPORT</h3>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-900 text-emerald-300 border border-emerald-700 animate-pulse">
            24/7 ONLINE
          </span>
        </div>

        <p className="text-xs text-gray-300 text-left leading-relaxed">
          Koi bhi sawal ya help ke liye hamse direct baat karein. Call ya WhatsApp par sampark karein:
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href="tel:9569086611"
            className="py-2.5 px-3 rounded-xl font-extrabold text-xs bg-emerald-500 hover:bg-emerald-400 text-gray-950 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Phone className="w-3.5 h-3.5 fill-gray-950" />
            <span>CALL: 9569086611</span>
          </a>

          <a
            href={`https://wa.me/919569086611?text=${encodeURIComponent('Hello, I want to talk to support regarding AMIT FF INFO STORE.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl font-extrabold text-xs bg-gray-950 hover:bg-gray-900 border border-emerald-800 text-emerald-300 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>WHATSAPP</span>
          </a>
        </div>
      </div>

      {/* Redeem Code Section */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white tracking-wide">REDEEM GIFT CODE</h3>
        </div>

        {redeemMessage && (
          <div
            className={`mb-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              redeemMessage.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                : 'bg-red-950/60 border border-red-800 text-red-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{redeemMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleRedeem} className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. BS-5-XYZAB"
            value={redeemCode}
            onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
            className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 font-mono uppercase"
          />
          <button
            type="submit"
            disabled={redeemLoading || !redeemCode.trim()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-gray-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
          >
            {redeemLoading ? '...' : 'CLAIM'}
          </button>
        </form>
      </div>

      {/* Tools Section Header */}
      <div className="flex items-center justify-between pt-1">
        <h3 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>AVAILABLE TOOLS</span>
        </h3>
        <span className="text-[10px] text-gray-500">1 Credit Per Run</span>
      </div>

      {/* Tools Grid (Compact Android Cards) */}
      <div className="space-y-3">
        {/* Tool 01 */}
        <div
          onClick={() => onNavigate('tool-bound-gmail')}
          className="group relative overflow-hidden bg-gray-900/90 border border-gray-800 hover:border-cyan-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer active:scale-98 shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-extrabold text-sm group-hover:scale-105 transition-transform">
                01
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  Bound Gmail Checker
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Check current & pending email status</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800 shrink-0">
              1 CR
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-800/60 text-[11px] text-cyan-400 font-semibold">
            <span className="flex items-center gap-1">
              <MailCheck className="w-3.5 h-3.5" />
              <span>Safe Sandbox Checker</span>
            </span>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Tool 02 */}
        <div
          onClick={() => onNavigate('tool-otp-demo')}
          className="group relative overflow-hidden bg-gray-900/90 border border-gray-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer active:scale-98 shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-extrabold text-sm group-hover:scale-105 transition-transform">
                02
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  SSO Double Unsub OTP
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Safe demo OTP verification sender</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
              1 CR
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-800/60 text-[11px] text-emerald-400 font-semibold">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safe Demo Generator</span>
            </span>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Tool 03 */}
        <div
          onClick={() => onNavigate('tool-security-demo')}
          className="group relative overflow-hidden bg-gray-900/90 border border-gray-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer active:scale-98 shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 font-extrabold text-sm group-hover:scale-105 transition-transform">
                03
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  Check Security Code
                </h4>
                <p className="text-[11px] text-gray-400 mt-0.5">Generate fresh random sandbox code</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
              1 CR
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-800/60 text-[11px] text-amber-400 font-semibold">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Safe Sandbox Generator</span>
            </span>
            <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};
