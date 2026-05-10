import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.getItemCount());
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-2 border-orange-100 shadow-lg shadow-orange-500/10 transition-all duration-500">
      <div className="section-container">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-linear-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:shadow-orange-500/60 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:-translate-y-1">
              <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-2xl font-black bg-linear-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent leading-none tracking-tight">
                QuickMart
              </span>
              <span className="text-[7px] sm:text-[9px] font-black text-orange-600 uppercase tracking-[0.25em] mt-0.5 sm:mt-1">Campus Commerce</span>
            </div>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl text-sm font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-wider"
            >
              Explore
            </Link>
            {user && (
              <Link
                to="/orders"
                className="px-4 py-2.5 rounded-xl text-sm font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-wider"
              >
                My Orders
              </Link>
            )}
            {user?.role === 'vendor' && (
              <Link
                to="/vendor-dashboard"
                className="px-4 py-2.5 rounded-xl text-sm font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-wider"
              >
                Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2.5 rounded-xl text-sm font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-wider"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user && <NotificationCenter />}

            {/* Cart */}
            {user && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all group shrink-0 active:scale-90"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-red-600 text-white text-[9px] sm:text-[11px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 border-2 border-white animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-black text-slate-900 leading-tight">{user.full_name}</p>
                  <p className="text-[9px] text-orange-600 font-black uppercase tracking-[0.2em]">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-100 border-2 border-slate-200 transition-all shrink-0 active:scale-90"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-widest border border-slate-200"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 sm:px-8 py-2.5 sm:py-3 rounded-2xl text-[10px] sm:text-xs font-black text-white bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-xl shadow-orange-500/40 hover:shadow-orange-600/50 transition-all duration-500 active:scale-95 uppercase tracking-[0.2em]"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu - Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-6 border-t-2 border-orange-100 space-y-2 animate-in slide-in-from-top duration-300 bg-orange-50">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600"
            >
              Explore
            </Link>
            {user && (
              <Link
                to="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600"
              >
                My Orders
              </Link>
            )}
            {user?.role === 'vendor' && (
              <Link
                to="/vendor-dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600"
              >
                Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600"
              >
                Admin
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
