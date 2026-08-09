import React, { useState } from 'react';
import { Phone, MessageCircle, Copy, Check, Zap, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface BuyCreditsProps {
  user: User;
  onPaymentSubmitted: () => void;
}

export const BuyCredits: React.FC<BuyCreditsProps> = ({ user }) => {
  const [copiedPhone, setCopiedPhone] = useState(false);

  const phoneNum = '9569086611';
  const whatsappNum = '919569086611';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneNum);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // WhatsApp pre-filled message
  const waMsg = encodeURIComponent(
    `Hello, I want to buy AMIT FF INFO STORE credits.\n\nMy Registered Email: ${user.email}\nMy User ID: #${user.id}\n\nPlease share payment details.`
  );
  const waUrl = `https://wa.me/${whatsappNum}?text=${waMsg}`;

  return (
    <div className="max-w-md mx-auto space-y-4 pb-16">
      {/* Header Banner */}
      <div className="text-center bg-gray-900/90 border border-gray-800 rounded-2xl p-4 shadow-xl">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase tracking-wide">
          OFFICIAL SUPPORT & SALES
        </span>
        <h1 className="text-xl font-black text-white mt-2">BUY CREDITS VIA WHATSAPP</h1>
        <p className="text-xs text-cyan-400 font-bold mt-1">1 CREDIT = ₹99 • DIRECT INSTANT ADDITION</p>
      </div>

      {/* Main WhatsApp Direct Buy Card */}
      <div className="bg-gradient-to-b from-emerald-950/80 via-gray-900 to-gray-900 border border-emerald-800/60 rounded-2xl p-5 text-center shadow-2xl space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
          <MessageCircle className="w-9 h-9 fill-emerald-500/20" />
        </div>

        <div>
          <h2 className="text-lg font-black text-white tracking-wide">CONNECT ON WHATSAPP</h2>
          <p className="text-xs text-emerald-300 font-medium mt-1">
            Buy credits directly by sending a WhatsApp message to our admin support team.
          </p>
        </div>

        {/* Contact Phone Display Box */}
        <div className="bg-gray-950 border border-emerald-900/60 rounded-xl p-3.5 flex items-center justify-between">
          <div className="text-left flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase">WhatsApp Contact Number</p>
              <p className="text-sm font-mono font-black text-white tracking-wider">{phoneNum}</p>
            </div>
          </div>
          <button
            onClick={handleCopyPhone}
            className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            {copiedPhone ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Big Direct WhatsApp Redirect Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-gray-950 hover:from-emerald-400 hover:to-cyan-400 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 tracking-wider"
        >
          <MessageCircle className="w-5 h-5 fill-gray-950" />
          <span>BUY CREDITS ON WHATSAPP DIRECT</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* How it Works Step List */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 text-xs space-y-2.5">
        <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>HOW TO BUY CREDITS</span>
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-300 leading-relaxed">
          <li>Click <strong className="text-emerald-400">"BUY CREDITS ON WHATSAPP DIRECT"</strong> above.</li>
          <li>Send the pre-filled message with your email ID: <strong className="text-white">{user.email}</strong></li>
          <li>Make payment via UPI / QR provided by admin on WhatsApp.</li>
          <li>Your credits will be added to your account balance instantly (+1 Credit per ₹99)!</li>
        </ol>
      </div>

      {/* Quick Call Button */}
      <div className="text-center">
        <a
          href={`tel:${phoneNum}`}
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-xs bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 transition-all active:scale-98"
        >
          <Phone className="w-4 h-4 text-cyan-400" />
          <span>CALL SUPPORT: {phoneNum}</span>
        </a>
      </div>
    </div>
  );
};

