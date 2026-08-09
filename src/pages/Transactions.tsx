import React, { useEffect, useState } from 'react';
import { History, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { CreditTransaction, PaymentRequest } from '../types';
import { apiRequest } from '../api';

export const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'credits' | 'payments'>('credits');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/user/transactions');

      if (res.ok && res.data) {
        setTransactions(res.data.transactions || []);
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error('Error loading transaction history:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-16">
      {/* Header */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-5 h-5 text-cyan-400" />
          <h1 className="text-base font-bold text-white">TRANSACTION & PAYMENT LOGS</h1>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-gray-950 p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('credits')}
            className={`py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'credits'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Credit History
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'payments'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Payment Requests
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading history...</div>
      ) : activeTab === 'credits' ? (
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 text-center text-xs text-gray-500">
              No credit transactions found.
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="bg-gray-900/90 border border-gray-800 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      tx.amount > 0
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white">{tx.description}</p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(tx.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono font-bold">
                  <span className={tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount} CR
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {payments.length === 0 ? (
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 text-center text-xs text-gray-500">
              No payment requests submitted yet.
            </div>
          ) : (
            payments.map((p) => (
              <div
                key={p.id}
                className="bg-gray-900/90 border border-gray-800 rounded-xl p-3 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-cyan-400 font-bold">UTR: {p.utr}</span>
                    <p className="text-[10px] text-gray-500">
                      {new Date(p.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">₹{p.amount}</p>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        p.status === 'approved'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : p.status === 'rejected'
                          ? 'bg-red-950 text-red-400 border-red-800'
                          : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}
                    >
                      {p.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                      {p.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {p.status === 'pending' && <Clock className="w-3 h-3" />}
                      <span className="uppercase">{p.status}</span>
                    </span>
                  </div>
                </div>

                {p.admin_note && (
                  <p className="text-[10px] text-red-300 bg-red-950/40 p-2 rounded-lg border border-red-900/40">
                    Note: {p.admin_note}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
