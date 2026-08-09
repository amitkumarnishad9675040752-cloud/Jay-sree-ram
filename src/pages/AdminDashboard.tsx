import React, { useEffect, useState } from 'react';
import { Shield, Users, CreditCard, History, Gift, Activity, Settings, LogOut, Clock, CheckCircle2, Zap } from 'lucide-react';
import { AdminStats } from '../types';
import { apiRequest } from '../api';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/admin/stats');

      if (res.ok && res.data) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-16">
      {/* Admin Title Card */}
      <div className="bg-gradient-to-br from-cyan-950 via-gray-900 to-gray-950 border border-cyan-800/80 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-cyan-400 font-extrabold text-xs tracking-wider uppercase">
            <Shield className="w-4 h-4" />
            <span>AMIT FF INFO STORE ADMIN PANEL</span>
          </div>
          <h1 className="text-xl font-black text-white mt-1">SYSTEM CONTROL</h1>
        </div>
        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900"
          title="Logout Admin"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Admin Overview Stats Cards */}
      {loading || !stats ? (
        <div className="text-center py-6 text-xs text-gray-500">Loading admin statistics...</div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {/* Total Users */}
          <div
            onClick={() => onNavigate('admin-users')}
            className="bg-gray-900/90 border border-gray-800 hover:border-cyan-500/50 rounded-2xl p-3.5 cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Total Users</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{stats.total_users}</p>
          </div>

          {/* Pending Payments */}
          <div
            onClick={() => onNavigate('admin-payments')}
            className="bg-gray-900/90 border border-amber-800/60 hover:border-amber-500/50 rounded-2xl p-3.5 cursor-pointer active:scale-98 transition-all relative overflow-hidden"
          >
            {stats.pending_payments > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-300 font-bold uppercase">Pending Payments</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400 mt-1">{stats.pending_payments}</p>
          </div>

          {/* Approved Payments */}
          <div
            onClick={() => onNavigate('admin-payments')}
            className="bg-gray-900/90 border border-emerald-800/60 hover:border-emerald-500/50 rounded-2xl p-3.5 cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-emerald-300 font-bold uppercase">Approved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-emerald-400 mt-1">{stats.approved_payments}</p>
          </div>

          {/* Total Credits Issued */}
          <div
            onClick={() => onNavigate('admin-transactions')}
            className="bg-gray-900/90 border border-gray-800 hover:border-cyan-500/50 rounded-2xl p-3.5 cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Credits Issued</span>
              <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1">{stats.total_credits_issued}</p>
          </div>
        </div>
      )}

      {/* Admin Navigation Menu */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 space-y-2">
        <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Admin Navigation</h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('admin-users')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-950 hover:bg-gray-800/80 border border-gray-800 text-xs font-bold text-white transition-colors"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Manage Users</span>
          </button>

          <button
            onClick={() => onNavigate('admin-payments')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-950 hover:bg-gray-800/80 border border-gray-800 text-xs font-bold text-white transition-colors"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Payment Requests</span>
          </button>

          <button
            onClick={() => onNavigate('admin-codes')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-950 hover:bg-gray-800/80 border border-gray-800 text-xs font-bold text-white transition-colors"
          >
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Redeem Codes</span>
          </button>

          <button
            onClick={() => onNavigate('admin-transactions')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-950 hover:bg-gray-800/80 border border-gray-800 text-xs font-bold text-white transition-colors"
          >
            <History className="w-4 h-4 text-teal-400" />
            <span>Transactions</span>
          </button>

          <button
            onClick={() => onNavigate('admin-activity')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-950 hover:bg-gray-800/80 border border-gray-800 text-xs font-bold text-white transition-colors"
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Activity Logs</span>
          </button>

          <button
            onClick={() => onNavigate('admin-settings')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-950 hover:bg-gray-800/80 border border-gray-800 text-xs font-bold text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span>Admin Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
