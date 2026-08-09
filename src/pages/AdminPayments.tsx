import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, XCircle, Clock, ArrowLeft, AlertCircle, ShieldCheck, Search } from 'lucide-react';
import { PaymentRequest } from '../types';
import { apiRequest } from '../api';

interface AdminPaymentsProps {
  onNavigate: (page: string) => void;
}

export const AdminPayments: React.FC<AdminPaymentsProps> = ({ onNavigate }) => {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reject Modal
  const [rejectingPayment, setRejectingPayment] = useState<PaymentRequest | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/admin/payments');
      if (res.ok && res.data) {
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error('Failed fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: number) => {
    if (!window.confirm(`Approve Payment #${paymentId} and add credits to user?`)) return;

    setMsg(null);
    setActionLoading(true);
    try {
      const res = await apiRequest(`/api/admin/payments/${paymentId}/approve`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(res.error || 'Failed approving payment');
      }

      setMsg({ type: 'success', text: res.data.message });
      fetchPayments();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error approving payment' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingPayment) return;

    setMsg(null);
    setActionLoading(true);
    try {
      const res = await apiRequest(`/api/admin/payments/${rejectingPayment.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ note: rejectNote }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Failed rejecting payment');
      }

      setMsg({ type: 'success', text: res.data?.message || 'Payment rejected' });
      setRejectingPayment(null);
      setRejectNote('');
      fetchPayments();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error rejecting payment' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

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
          <h1 className="text-sm font-bold text-white">PAYMENT REQUESTS</h1>
          <span className="text-[10px] text-emerald-400 font-semibold">{payments.filter(p => p.status === 'pending').length} Pending Requests</span>
        </div>
      </div>

      {/* Message Banner */}
      {msg && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border border-red-800 text-red-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-[11px] font-bold">
        <button
          onClick={() => setFilter('pending')}
          className={`py-2 rounded-lg transition-colors ${
            filter === 'pending' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-gray-400 hover:text-white'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`py-2 rounded-lg transition-colors ${
            filter === 'approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-gray-400 hover:text-white'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`py-2 rounded-lg transition-colors ${
            filter === 'rejected' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-gray-400 hover:text-white'
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`py-2 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-gray-400 hover:text-white'
          }`}
        >
          All ({payments.length})
        </button>
      </div>

      {/* Payment Requests List */}
      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading payment requests...</div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 text-center text-xs text-gray-500">
          No payment requests found for filter "{filter}".
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((p) => (
            <div
              key={p.id}
              className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
                <div>
                  <span className="text-xs font-mono font-bold text-cyan-400">Payment #{p.id}</span>
                  <p className="text-[10px] text-gray-500">{new Date(p.created_at).toLocaleString()}</p>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                    p.status === 'approved'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : p.status === 'rejected'
                      ? 'bg-red-950 text-red-400 border-red-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}
                >
                  {p.status}
                </span>
              </div>

              {/* User Email & ID */}
              <div className="bg-gray-950 p-2.5 rounded-xl border border-gray-800/80 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Registered Email:</span>
                  <span className="font-bold text-white truncate max-w-[200px]">{p.user_email}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">User ID:</span>
                  <span className="font-mono text-cyan-400 font-bold">#{p.user_id}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-400">₹{p.amount}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-gray-800/60">
                  <span className="text-gray-400">UTR Reference:</span>
                  <span className="font-mono font-bold text-amber-300 tracking-wider">{p.utr}</span>
                </div>
              </div>

              {p.admin_note && (
                <p className="text-[11px] text-red-300 bg-red-950/40 p-2 rounded-lg border border-red-900/40">
                  Admin Note: {p.admin_note}
                </p>
              )}

              {/* Action Buttons for Pending Payments */}
              {p.status === 'pending' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(p.id)}
                    disabled={actionLoading}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-gray-950 flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>APPROVE</span>
                  </button>

                  <button
                    onClick={() => setRejectingPayment(p)}
                    disabled={actionLoading}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs bg-red-950 border border-red-800 hover:bg-red-900 text-red-300 flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>REJECT</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* REJECT PAYMENT MODAL */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h2 className="text-sm font-bold text-white">REJECT PAYMENT #{rejectingPayment.id}</h2>
            <p className="text-xs text-gray-400">
              Rejecting UTR <span className="font-mono font-bold text-amber-300">{rejectingPayment.utr}</span> for {rejectingPayment.user_email}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Reason / Admin Note</label>
              <textarea
                rows={2}
                placeholder="Enter rejection reason (optional)..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setRejectingPayment(null)}
                className="py-2.5 rounded-xl font-bold text-xs bg-gray-950 border border-gray-800 text-gray-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white"
              >
                CONFIRM REJECT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
