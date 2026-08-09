import React, { useEffect, useState } from 'react';
import { User as UserIcon, Shield, Calendar, Zap, Lock, LogOut, Phone, MessageCircle } from 'lucide-react';
import { User } from '../types';
import { apiRequest } from '../api';

interface AccountProps {
  user: User;
  onLogout: () => void;
  onNavigateToAdmin: () => void;
}

export const Account: React.FC<AccountProps> = ({ user, onLogout, onNavigateToAdmin }) => {
  const [stats, setStats] = useState({ transactionsCount: 0, paymentsCount: 0 });

  useEffect(() => {
    fetchAccountStats();
  }, []);

  const fetchAccountStats = async () => {
    try {
      const res = await apiRequest('/api/user/transactions');

      if (res.ok && res.data) {
        setStats({
          transactionsCount: (res.data.transactions || []).length,
          paymentsCount: (res.data.payments || []).length,
        });
      }
    } catch (err) {
      console.error('Error loading account stats:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-16">
      {/* Account Profile Card */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 shadow-xl text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 p-0.5 mx-auto mb-3 shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-gray-950 rounded-full flex items-center justify-center">
            <UserIcon className="w-8 h-8 text-cyan-400" />
          </div>
        </div>

        <h1 className="text-lg font-bold text-white">{user.email}</h1>
        <p className="text-xs text-gray-400 font-mono mt-0.5">USER ID #{user.id}</p>

        {user.role === 'admin' && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>SYSTEM ADMINISTRATOR</span>
          </div>
        )}
      </div>

      {/* Account Details */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 space-y-3 text-xs">
        <h3 className="font-bold text-white uppercase tracking-wider text-xs border-b border-gray-800 pb-2">
          Account Overview
        </h3>

        <div className="space-y-2">
          <div className="flex justify-between py-1.5 border-b border-gray-800/60">
            <span className="text-gray-400">Current Balance:</span>
            <span className="font-bold text-cyan-400">
              {user.role === 'admin' ? 'UNLIMITED' : `${user.credits} CREDITS`}
            </span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-gray-800/60">
            <span className="text-gray-400">Registered On:</span>
            <span className="text-white font-mono">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-gray-800/60">
            <span className="text-gray-400">Account Status:</span>
            <span className="text-emerald-400 font-bold uppercase">{user.status}</span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-gray-800/60">
            <span className="text-gray-400">Total Tool Runs:</span>
            <span className="text-white font-bold">{stats.transactionsCount}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-gray-400">Submitted Payments:</span>
            <span className="text-white font-bold">{stats.paymentsCount}</span>
          </div>
        </div>
      </div>

      {/* Direct Contact Support Section */}
      <div className="bg-gradient-to-b from-gray-900 to-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 space-y-3 text-xs">
        <div className="flex items-center gap-2 border-b border-emerald-900/40 pb-2">
          <Phone className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">
            Direct Support & Sampark
          </h3>
        </div>

        <p className="text-gray-300">
          Agar aapko koi samasya ho ya credit kharidna ho, toh direct contact karein:
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href="tel:9569086611"
            className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-500 text-gray-950 hover:bg-emerald-400 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 fill-gray-950" />
            <span>CALL 9569086611</span>
          </a>

          <a
            href={`https://wa.me/919569086611?text=${encodeURIComponent('Hello AMIT FF INFO STORE Support, I need help with my account.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gray-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-950 flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>WHATSAPP</span>
          </a>
        </div>
      </div>

      {/* Security Guarantee Note */}
      <div className="bg-gray-950 border border-gray-800/80 rounded-xl p-3 text-[11px] text-gray-400 space-y-1">
        <p className="font-semibold text-gray-300 flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Security & Privacy Boundary</span>
        </p>
        <p>
          Your account credentials & sessions are protected via salted bcrypt password hashing and secure token auth.
        </p>
      </div>

      {/* Admin Quick Action */}
      {user.role === 'admin' && (
        <button
          onClick={onNavigateToAdmin}
          className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 flex items-center justify-center gap-2 transition-colors shadow-lg"
        >
          <Shield className="w-4 h-4" />
          <span>OPEN ADMIN DASHBOARD</span>
        </button>
      )}

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>LOG OUT</span>
      </button>
    </div>
  );
};
