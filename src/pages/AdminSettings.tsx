import React, { useEffect, useState } from 'react';
import { Settings, Shield, Key, Terminal, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../api';

interface AdminSettingsProps {
  onNavigate: (page: string) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiRequest('/api/admin/settings');
      if (res.ok && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
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
          <h1 className="text-sm font-bold text-white">ADMIN SECURITY & CONFIG</h1>
          <span className="text-[10px] text-cyan-400 font-semibold">Environment Settings</span>
        </div>
      </div>

      {settings && (
        <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-4 space-y-3 text-xs">
          <h3 className="font-bold text-white uppercase tracking-wider text-xs border-b border-gray-800 pb-2">
            Active Configuration
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">Admin Email:</span>
              <span className="font-bold text-cyan-400">{settings.admin_email}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">Credit Price:</span>
              <span className="font-bold text-emerald-400">₹{settings.credit_price} per CR</span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">UPI ID:</span>
              <span className="font-mono text-white">{settings.upi_id}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">WhatsApp Number:</span>
              <span className="font-mono text-white">+{settings.whatsapp_number}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-800/60">
              <span className="text-gray-400">Real SMTP Configured:</span>
              <span className={settings.smtp_configured ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {settings.smtp_configured ? 'ACTIVE (Real Email OTP)' : 'SIMULATED (Server Log)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Admin Password Hash Tutorial Box */}
      <div className="bg-gray-900/90 border border-cyan-500/30 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
          <Key className="w-4 h-4" />
          <span>ADMIN PASSWORD HASH GUIDE</span>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          For maximum security, never commit plaintext passwords. Hash your owner password using Node.js bcrypt or Python PBKDF2/SHA256, then set it in your environment:
        </p>

        <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 text-[10px] font-mono text-cyan-300 space-y-2">
          <p className="text-gray-500 font-sans font-semibold">Generate in Node.js terminal:</p>
          <div className="bg-black/80 p-2 rounded border border-gray-800 overflow-x-auto text-emerald-400 select-all">
            node -e "console.log(require('bcryptjs').hashSync('YOUR_CHOSEN_PASSWORD', 10))"
          </div>

          <p className="text-gray-500 font-sans font-semibold mt-2">Then set in .env file:</p>
          <div className="bg-black/80 p-2 rounded border border-gray-800 text-amber-300">
            ADMIN_EMAIL={settings?.admin_email || 'akffking956908@gmail.com'}<br />
            ADMIN_PASSWORD_HASH="$2a$10$YourGeneratedBcryptHashHere..."
          </div>
        </div>
      </div>
    </div>
  );
};
