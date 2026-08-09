import React from 'react';
import { LayoutDashboard, Wrench, ShoppingBag, History, User as UserIcon, ShieldAlert } from 'lucide-react';
import { User } from '../types';

interface BottomNavProps {
  user: User | null;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ user, activePage, onNavigate }) => {
  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'buy-credits', label: 'Buy CR', icon: ShoppingBag, highlight: true },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'account', label: 'Account', icon: UserIcon },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin-dashboard', label: 'Admin', icon: ShieldAlert, highlight: false });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-950/95 backdrop-blur-md border-t border-gray-800/80 px-2 py-2 max-w-md mx-auto">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id || (item.id === 'admin-dashboard' && activePage.startsWith('admin-'));

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  item.highlight
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-gray-950 shadow-md shadow-cyan-500/20'
                    : isActive
                    ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50'
                    : ''
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
