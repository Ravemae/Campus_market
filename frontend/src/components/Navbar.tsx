import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black bg-linear-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300 bg-clip-text text-transparent leading-none">
                CampusMarket
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Community Commerce</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
            >
              Explore
            </Link>
            {user && (
              <Link
                to="/orders"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              >
                My Orders
              </Link>
            )}
            {user?.role === 'vendor' && (
              <Link
                to="/vendor-dashboard"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              >
                Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {user && <NotificationCenter />}
            
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40 border-2 border-white dark:border-slate-900 animate-in zoom-in duration-300">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user.full_name}</p>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-200 dark:border-slate-800 transition-all"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 active:scale-95"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
