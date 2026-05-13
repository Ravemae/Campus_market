import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import NotificationCenter from './NotificationCenter';
import ProfileDropdown from './ProfileDropdown';

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
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b-2 border-orange-100 shadow-lg shadow-orange-500/10 transition-all duration-500">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between h-14 sm:h-20 lg:h-24">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl sm:rounded-2xl bg-linear-to-br from-orange-700 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-900/20 group-hover:shadow-orange-900/30 transition-all duration-500 group-hover:scale-110">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg lg:text-2xl font-black bg-linear-to-r from-orange-700 to-amber-600 bg-clip-text text-transparent leading-none tracking-tight">
                QuickMart
              </span>
              <span className="text-[6px] sm:text-[7px] lg:text-[9px] font-black text-orange-700 uppercase tracking-[0.25em] mt-0.5">Campus Commerce</span>
            </div>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link to={user ? "/dashboard" : "/"} className="px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-wider">
              {user ? 'Dashboard' : 'Home'}
            </Link>
            <Link to="/products" className="px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-wider">
              Items
            </Link>
            <Link to="/vendors" className="px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-wider">
              Vendors
            </Link>
            {user && (
              <Link to="/orders" className="px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-wider">
                My Orders
              </Link>
            )}
            {user?.role === 'vendor' && (
              <Link to="/vendor-dashboard" className="px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-wider">
                Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-wider">
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {user && <NotificationCenter />}

            {/* Cart */}
            {user && (
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all group shrink-0 active:scale-90"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-red-600 text-white text-[8px] sm:text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 border-2 border-white">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth — desktop: ProfileDropdown | mobile: show nothing here (handled by hamburger menu) */}
            {user ? (
              <ProfileDropdown />
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="px-3 sm:px-5 py-2 rounded-xl text-[10px] sm:text-xs font-black text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all uppercase tracking-widest border border-slate-200"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black text-white bg-linear-to-r from-orange-700 to-orange-600 hover:from-orange-800 hover:to-orange-700 shadow-lg shadow-orange-900/20 transition-all active:scale-95 uppercase tracking-[0.15em]"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button — right side */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-100 transition-all active:scale-90 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-orange-100 space-y-1 bg-orange-50/50 -mx-6 sm:-mx-10 lg:-mx-16 px-6 sm:px-10 lg:px-16">
            <Link to={user ? "/dashboard" : "/"} onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600">
              {user ? 'Dashboard' : 'Home'}
            </Link>
            <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600">
              Items
            </Link>
            <Link to="/vendors" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600">
              Vendors
            </Link>
            {user && (
              <>
                <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600">
                  My Orders
                </Link>
                <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600">
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600">
                  Profile
                </Link>
              </>
            )}
            {user?.role === 'vendor' && (
              <Link to="/vendor-dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600">
                Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-white hover:text-orange-600">
                Admin
              </Link>
            )}
            {user && (
              <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50">
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
