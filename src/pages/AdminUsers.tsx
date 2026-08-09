import React, { useEffect, useState } from 'react';
import { Users, Search, PlusCircle, MinusCircle, Ban, CheckCircle, ArrowLeft, Zap, Shield, X, AlertCircle } from 'lucide-react';
import { User, CreditTransaction, PaymentRequest } from '../types';
import { apiRequest } from '../api';

interface AdminUsersProps {
  onNavigate: (page: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<{ transactions: CreditTransaction[]; payments: PaymentRequest[] } | null>(null);

  // Credit Modification Modal State
  const [creditAmount, setCreditAmount] = useState('1');
  const [creditReason, setCreditReason] = useState('Payment verified');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/admin/users');
      if (res.ok && res.data) {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageUser = async (user: User) => {
    setSelectedUser(user);
    setUserDetails(null);
    setMsg(null);

    try {
      const res = await apiRequest(`/api/admin/users/${user.id}`);
      if (res.ok && res.data) {
        setUserDetails({ transactions: res.data.transactions || [], payments: res.data.payments || [] });
      }
    } catch (err) {
      console.error('Failed fetching user details:', err);
    }
  };

  const handleModifyCredits = async (isAdd: boolean) => {
    if (!selectedUser) return;
    setMsg(null);

    const amountNum = parseInt(creditAmount, 10);
    if (isNaN(amountNum) || amountNum <= 0) {
      setMsg({ type: 'error', text: 'Enter a valid positive number for credits.' });
      return;
    }

    const finalAmount = isAdd ? amountNum : -amountNum;

    setActionLoading(true);
    try {
      const res = await apiRequest(`/api/admin/users/${selectedUser.id}/credits`, {
        method: 'POST',
        body: JSON.stringify({ amount: finalAmount, reason: creditReason }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Failed modifying credits');
      }

      setMsg({ type: 'success', text: `Successfully ${isAdd ? 'added' : 'removed'} ${amountNum} credit(s)!` });
      setSelectedUser(res.data.user);
      fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error modifying credits' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (newStatus: 'active' | 'suspended') => {
    if (!selectedUser) return;
    setMsg(null);

    setActionLoading(true);
    try {
      const res = await apiRequest(`/api/admin/users/${selectedUser.id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Failed updating status');
      }

      setMsg({ type: 'success', text: `User account is now ${newStatus}.` });
      setSelectedUser(res.data.user);
      fetchUsers();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error updating status' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) || u.id.toString().includes(search));

  return (
    <div className="max-w-md mx-auto space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-xl">
        <button
          onClick={() => onNavigate('admin-dashboard')}
          className="p-2 rounded-xl bg-gray-950 border border-gray-800 text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="text-right">
          <h1 className="text-sm font-bold text-white">USER MANAGEMENT</h1>
          <span className="text-[10px] text-cyan-400 font-semibold">{users.length} Total Registered Users</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by Email or User ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* User Cards List (Mobile-first format) */}
      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading user database...</div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-lg flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">USER #{u.id}</span>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                      u.status === 'active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {u.status}
                  </span>
                  {u.role === 'admin' && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      ADMIN
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-white truncate max-w-[200px]">{u.email}</p>

                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span>Credits: <strong className="text-cyan-400">{u.role === 'admin' ? '∞' : u.credits}</strong></span>
                  <span>•</span>
                  <span>Joined: {new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <button
                onClick={() => handleManageUser(u)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 active:scale-95 transition-all shrink-0"
              >
                MANAGE
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MANAGE USER MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">MANAGE USER ACCOUNT</span>
              <h2 className="text-base font-bold text-white">{selectedUser.email}</h2>
              <p className="text-xs text-gray-400 font-mono">User ID #{selectedUser.id} | Joined: {new Date(selectedUser.created_at).toLocaleDateString()}</p>
            </div>

            {msg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  msg.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                    : 'bg-red-950/60 border border-red-800 text-red-300'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{msg.text}</span>
              </div>
            )}

            {/* Current Balance & Quick Stats */}
            <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
              <div>
                <p className="text-gray-400">Current Credits</p>
                <p className="text-xl font-bold text-cyan-400">{selectedUser.role === 'admin' ? '∞' : selectedUser.credits}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400">Account Status</p>
                <p className={`font-bold uppercase ${selectedUser.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedUser.status}
                </p>
              </div>
            </div>

            {/* ADD / REMOVE CREDITS FORM */}
            <div className="space-y-3 bg-gray-950/60 p-3 rounded-xl border border-gray-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Modify Credit Balance</h3>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Credits Amount</label>
                <input
                  type="number"
                  min="1"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Payment verified / Manual adjustment"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleModifyCredits(true)}
                  disabled={actionLoading}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-gray-950 flex items-center justify-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>ADD CREDITS</span>
                </button>

                <button
                  onClick={() => handleModifyCredits(false)}
                  disabled={actionLoading}
                  className="py-2.5 px-3 rounded-xl font-bold text-xs bg-red-950 border border-red-800 hover:bg-red-900 text-red-300 flex items-center justify-center gap-1"
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>REMOVE CREDITS</span>
                </button>
              </div>
            </div>

            {/* ACCOUNT STATUS CONTROL */}
            <div className="pt-2 border-t border-gray-800">
              {selectedUser.status === 'active' ? (
                <button
                  onClick={() => handleToggleStatus('suspended')}
                  disabled={actionLoading || selectedUser.role === 'admin'}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-red-950/80 border border-red-800 text-red-300 hover:bg-red-900 flex items-center justify-center gap-1.5"
                >
                  <Ban className="w-4 h-4" />
                  <span>SUSPEND USER ACCOUNT</span>
                </button>
              ) : (
                <button
                  onClick={() => handleToggleStatus('active')}
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-950/80 border border-emerald-800 text-emerald-300 hover:bg-emerald-900 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>ACTIVATE USER ACCOUNT</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
