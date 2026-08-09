import React, { useEffect, useState } from 'react';
import { Gift, Copy, Check, Plus, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { RedeemCode } from '../types';
import { apiRequest } from '../api';

interface AdminCodesProps {
  onNavigate: (page: string) => void;
}

export const AdminCodes: React.FC<AdminCodesProps> = ({ onNavigate }) => {
  const [codes, setCodes] = useState<RedeemCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditsInput, setCreditsInput] = useState('1');
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/admin/codes');

      if (res.ok && res.data) {
        setCodes(res.data.codes || []);
      }
    } catch (err) {
      console.error('Failed fetching redeem codes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (presetCredits?: number) => {
    const num = presetCredits || parseInt(creditsInput, 10);
    if (isNaN(num) || num <= 0) {
      setMsg({ type: 'error', text: 'Please enter a valid credit amount.' });
      return;
    }

    setGenerating(true);
    setMsg(null);
    try {
      const res = await apiRequest('/api/admin/codes', {
        method: 'POST',
        body: JSON.stringify({ credits: num }),
      });

      if (!res.ok) {
        throw new Error(res.error || 'Failed generating code');
      }

      setMsg({ type: 'success', text: `Generated code: ${res.data.code?.code || 'success'}` });
      fetchCodes();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error generating code' });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
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
          <h1 className="text-sm font-bold text-white">REDEEM CODE GENERATOR</h1>
          <span className="text-[10px] text-amber-400 font-semibold">{codes.length} Total Codes Created</span>
        </div>
      </div>

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

      {/* Code Generation Card */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-amber-400" />
          <span>GENERATE NEW CREDIT CODE</span>
        </h3>

        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 5, 10, 20].map((preset) => (
            <button
              key={preset}
              onClick={() => handleGenerate(preset)}
              disabled={generating}
              className="py-2 px-2 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 text-amber-300 font-bold text-xs rounded-xl transition-all"
            >
              +{preset} CR
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="flex gap-2 pt-1">
          <input
            type="number"
            min="1"
            placeholder="Custom Amount"
            value={creditsInput}
            onChange={(e) => setCreditsInput(e.target.value)}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleGenerate()}
            disabled={generating}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-gray-950 flex items-center gap-1 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE</span>
          </button>
        </div>
      </div>

      {/* Codes List */}
      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading redeem codes...</div>
      ) : (
        <div className="space-y-2">
          {codes.map((c) => {
            const isUsed = !!c.used_by_user_id;

            return (
              <div
                key={c.id}
                className="bg-gray-900/90 border border-gray-800 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-300 text-sm tracking-wider">
                      {c.code}
                    </span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                      {c.credits} CR
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {isUsed
                      ? `Used by: ${c.used_by_email} on ${new Date(c.used_at!).toLocaleDateString()}`
                      : `Created: ${new Date(c.created_at).toLocaleDateString()}`}
                  </p>
                </div>

                {isUsed ? (
                  <span className="px-2 py-1 rounded text-[10px] font-bold bg-gray-950 text-gray-500 border border-gray-800 uppercase">
                    CLAIMED
                  </span>
                ) : (
                  <button
                    onClick={() => handleCopy(c.code)}
                    className="p-2 rounded-lg bg-gray-950 hover:bg-gray-800 text-gray-300 border border-gray-800 flex items-center gap-1 text-xs font-bold"
                  >
                    {copiedCode === c.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
