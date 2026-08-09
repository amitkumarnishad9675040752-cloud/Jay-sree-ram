import React, { useEffect, useState } from 'react';
import { History, ArrowLeft, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { CreditTransaction } from '../types';
import { apiRequest } from '../api';

interface AdminTransactionsProps {
  onNavigate: (page: string) => void;
}

export const AdminTransactions: React.FC<AdminTransactionsProps> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/admin/transactions');

      if (res.ok && res.data) {
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error('Failed fetching admin transactions:', err);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-sm font-bold text-white">ALL SYSTEM TRANSACTIONS</h1>
          <span className="text-[10px] text-cyan-400 font-semibold">{transactions.length} Total Logged</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading system credit transactions...</div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-gray-900/90 border border-gray-800 rounded-xl p-3 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{tx.user_email}</span>
                <span
                  className={`font-mono font-bold ${
                    tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} CR
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span>{tx.description}</span>
                <span>{new Date(tx.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
