import React from 'react';
import { Shield, Zap, LogOut, User as UserIcon, Lock, Phone } from 'lucide-react';
import { User } from '../types';
import { FFLogo } from './FFLogo';

interface NavbarProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout, activePage }) => {
  return (
    <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-amber-900/40 px-3 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate(user ? 'dashboard' : 'login')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="group-hover:scale-105 transition-transform">
            <FFLogo size="md" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200 uppercase">
                AMIT FF INFO STORE
              </span>
              {user?.role === 'admin' && (
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-950 text-amber-300 border border-amber-800 rounded">
                  ADMIN
                </span>
              )}
            </div>
            <p className="text-[10px] text-amber-400/80 font-bold tracking-tight -mt-0.5">GARENA FREE FIRE STORE</p>
          </div>
        </div>

        {/* User Stats / Controls */}
        <div className="flex items-center gap-2">
          {/* Sampark / Call Direct Button */}
          <a
            href="tel:9569086611"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 transition-all text-xs font-bold shadow-sm active:scale-95"
            title="Direct Call Support: 9569086611"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            <span className="text-[11px] font-mono">9569086611</span>
          </a>

          {user ? (
            <>
              {/* Credits Counter Badge */}
              <button
                onClick={() => onNavigate('buy-credits')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-950/80 to-emerald-950/80 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 transition-all shadow-sm active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white">
                  {user.role === 'admin' ? '∞' : user.credits}
                </span>
                <span className="text-[10px] font-semibold text-cyan-400">CR</span>
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-900 border border-transparent hover:border-red-900/40 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('login')}
                className="px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-gray-900 border border-gray-800 rounded-lg hover:border-gray-700"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate('admin-login')}
                className="p-1.5 text-cyan-400 bg-cyan-950/50 border border-cyan-800/60 rounded-lg hover:bg-cyan-900/50"
                title="Admin Login"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
