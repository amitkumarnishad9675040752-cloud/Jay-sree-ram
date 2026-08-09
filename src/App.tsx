import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { User } from './types';
import { apiRequest } from './api';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { BuyCredits } from './pages/BuyCredits';
import { ToolBoundGmail } from './pages/ToolBoundGmail';
import { ToolOtpDemo } from './pages/ToolOtpDemo';
import { ToolSecurityDemo } from './pages/ToolSecurityDemo';
import { Transactions } from './pages/Transactions';
import { Account } from './pages/Account';

// Admin Pages
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminPayments } from './pages/AdminPayments';
import { AdminTransactions } from './pages/AdminTransactions';
import { AdminCodes } from './pages/AdminCodes';
import { AdminActivityLogs } from './pages/AdminActivityLogs';
import { AdminSettings } from './pages/AdminSettings';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<string>('login');
  const [loading, setLoading] = useState<boolean>(true);

  // Check stored JWT session token on mount
  useEffect(() => {
    checkAuthSession(true);
  }, []);

  const checkAuthSession = async (isInitialCheck: boolean = false) => {
    const token = localStorage.getItem('bindstore_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/api/auth/me');

      if (res.ok && res.data?.user) {
        setUser(res.data.user);
        if (isInitialCheck) {
          setActivePage(res.data.user.role === 'admin' ? 'admin-dashboard' : 'dashboard');
        }
      } else {
        localStorage.removeItem('bindstore_token');
        setUser(null);
        setActivePage('login');
      }
    } catch (err) {
      console.error('Session verify error:', err);
      localStorage.removeItem('bindstore_token');
      setUser(null);
      setActivePage('login');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (token: string, loggedUser: User) => {
    localStorage.setItem('bindstore_token', token);
    setUser(loggedUser);
    setActivePage(loggedUser.role === 'admin' ? 'admin-dashboard' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('bindstore_token');
    setUser(null);
    setActivePage('login');
  };

  const handleRefreshUser = () => {
    checkAuthSession();
  };

  const navigateTo = (page: string) => {
    // Authorization check for admin pages
    if (page.startsWith('admin-') && page !== 'admin-login') {
      if (!user || user.role !== 'admin') {
        setActivePage('admin-login');
        return;
      }
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-0.5 animate-pulse mb-3">
          <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center font-bold text-cyan-400">
            BS
          </div>
        </div>
        <p className="text-xs text-amber-400 font-bold tracking-widest uppercase">LOADING AMIT FF INFO STORE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header Navbar */}
      <Navbar
        user={user}
        activePage={activePage}
        onNavigate={navigateTo}
        onLogout={handleLogout}
      />

      {/* Main Content Area (360px-430px Mobile Container Target) */}
      <main className="max-w-md mx-auto px-4 py-4 min-h-[calc(100vh-60px)]">
        {/* PUBLIC AUTH ROUTES */}
        {!user && (activePage === 'login' || activePage === 'dashboard' || activePage === 'buy-credits' || activePage === 'account' || activePage === 'tools') && (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onNavigateToSignup={() => navigateTo('signup')}
            onNavigateToAdminLogin={() => navigateTo('admin-login')}
          />
        )}

        {!user && activePage === 'signup' && (
          <Signup
            onSignupSuccess={handleLoginSuccess}
            onNavigateToLogin={() => navigateTo('login')}
          />
        )}

        {(!user || user?.role !== 'admin') && activePage === 'admin-login' && (
          <AdminLogin
            onAdminLoginSuccess={handleLoginSuccess}
            onNavigateToUserLogin={() => navigateTo('login')}
          />
        )}

        {/* USER ROUTES (Logged In) */}
        {user && (activePage === 'dashboard' || activePage === 'tools' || activePage === 'login' || activePage === 'signup') && (
          <Dashboard
            user={user}
            onNavigate={navigateTo}
            onRefreshUser={handleRefreshUser}
          />
        )}

        {user && activePage === 'buy-credits' && (
          <BuyCredits
            user={user}
            onPaymentSubmitted={() => navigateTo('transactions')}
          />
        )}

        {user && activePage === 'tool-bound-gmail' && (
          <ToolBoundGmail
            user={user}
            onNavigate={navigateTo}
            onRefreshUser={handleRefreshUser}
          />
        )}

        {user && activePage === 'tool-otp-demo' && (
          <ToolOtpDemo
            user={user}
            onNavigate={navigateTo}
            onRefreshUser={handleRefreshUser}
          />
        )}

        {user && activePage === 'tool-security-demo' && (
          <ToolSecurityDemo
            user={user}
            onNavigate={navigateTo}
            onRefreshUser={handleRefreshUser}
          />
        )}

        {user && activePage === 'transactions' && <Transactions />}

        {user && activePage === 'account' && (
          <Account
            user={user}
            onLogout={handleLogout}
            onNavigateToAdmin={() => navigateTo('admin-dashboard')}
          />
        )}

        {/* ADMIN ROUTES */}
        {user?.role === 'admin' && activePage === 'admin-dashboard' && (
          <AdminDashboard onNavigate={navigateTo} onLogout={handleLogout} />
        )}

        {user?.role === 'admin' && activePage === 'admin-users' && (
          <AdminUsers onNavigate={navigateTo} />
        )}

        {user?.role === 'admin' && activePage === 'admin-payments' && (
          <AdminPayments onNavigate={navigateTo} />
        )}

        {user?.role === 'admin' && activePage === 'admin-transactions' && (
          <AdminTransactions onNavigate={navigateTo} />
        )}

        {user?.role === 'admin' && activePage === 'admin-codes' && (
          <AdminCodes onNavigate={navigateTo} />
        )}

        {user?.role === 'admin' && activePage === 'admin-activity' && (
          <AdminActivityLogs onNavigate={navigateTo} />
        )}

        {user?.role === 'admin' && activePage === 'admin-settings' && (
          <AdminSettings onNavigate={navigateTo} />
        )}
      </main>

      {/* Bottom Android Fixed Navigation Bar */}
      <BottomNav user={user} activePage={activePage} onNavigate={navigateTo} />
    </div>
  );
}
