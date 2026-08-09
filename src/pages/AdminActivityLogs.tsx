import React, { useEffect, useState } from 'react';
import { Activity, ArrowLeft } from 'lucide-react';
import { ActivityLog } from '../types';
import { apiRequest } from '../api';

interface AdminActivityLogsProps {
  onNavigate: (page: string) => void;
}

export const AdminActivityLogs: React.FC<AdminActivityLogsProps> = ({ onNavigate }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/admin/activity');

      if (res.ok && res.data) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Failed fetching activity logs:', err);
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
          <h1 className="text-sm font-bold text-white">ADMIN ACTIVITY LOGS</h1>
          <span className="text-[10px] text-purple-400 font-semibold">{logs.length} Logged Audit Trail</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading activity logs...</div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-900/90 border border-gray-800 rounded-xl p-3 space-y-1 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-purple-300 uppercase tracking-wider text-[11px]">
                  {log.action}
                </span>
                <span className="text-[10px] text-gray-500">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>

              <p className="text-gray-300 text-[11px] leading-relaxed">{log.details}</p>
              <p className="text-[9px] text-gray-500 font-mono">Actor: {log.admin_email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
