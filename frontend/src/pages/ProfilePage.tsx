import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { uploadFile, updateProfile, resolveMediaUrl } from '../api/endpoints';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage: React.FC = () => {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const itemCount = useCartStore((s) => s.getItemCount());
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="text-center py-32 pb-28">
        <p className="text-slate-500 font-bold mb-4">You are not logged in</p>
        <Link to="/login" className="text-orange-600 font-black uppercase tracking-widest text-xs">Login →</Link>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const res = await uploadFile(file);
      const updateRes = await updateProfile(user.id, { avatar_url: res.data.url });
      updateUser(updateRes.data.user);
      alert('Avatar updated successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdateError('');
    setUpdateSuccess(false);

    try {
      const res = await updateProfile(user.id, editData);
      updateUser(res.data.user);
      setUpdateSuccess(true);
      setTimeout(() => setIsEditing(false), 1500);
    } catch (err: any) {
      setUpdateError(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  const initial = user.full_name?.charAt(0)?.toUpperCase() ?? '?';
  const avatarUrl = resolveMediaUrl(user.avatar_url);

  // Role-specific items
  const accountLinks = [
    {
      section: 'My Activity',
      items: [
        {
          label: 'My Orders',
          desc: 'Track and view all your orders',
          path: '/orders',
          badge: null,
          color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
        },
        {
          label: 'Shopping Cart',
          desc: 'View items in your basket',
          path: '/cart',
          badge: itemCount > 0 ? itemCount.toString() : null,
          color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
          ),
        },
      ],
    },
  ];

  if (user.role === 'vendor') {
    accountLinks.push({
      section: 'Vendor',
      items: [
        {
          label: 'Vendor Dashboard',
          desc: 'Manage products, orders & analytics',
          path: '/vendor-dashboard',
          badge: null,
          color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
            </svg>
          ),
        },
      ],
    });
  }

  if (user.role === 'admin') {
    accountLinks.push({
      section: 'Administration',
      items: [
        {
          label: 'Admin Panel',
          desc: 'Manage users, vendors & platform',
          path: '/admin',
          badge: null,
          color: 'bg-rose-50 text-rose-600 group-hover:bg-rose-100',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
      ],
    });
  }

  const roleBadgeColor =
    user.role === 'admin' ? 'bg-rose-100 text-rose-700 border-rose-200' :
    user.role === 'vendor' ? 'bg-purple-100 text-purple-700 border-purple-200' :
    'bg-orange-100 text-orange-700 border-orange-200';

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-32 sm:pb-16">

      {/* Profile Card — Cover + Avatar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/60 mb-5">
        {/* Cover gradient */}
        <div className="h-24 sm:h-32 bg-linear-to-br from-orange-500 via-orange-600 to-amber-500 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-400/20 rounded-full blur-xl" />
          <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white text-[9px] font-black uppercase tracking-widest">Active</span>
          </div>
        </div>

        {/* Avatar row */}
        <div className="px-5 sm:px-8 pb-6">
          <div className="flex items-end justify-between -mt-8 sm:-mt-10 mb-4">
            {/* Avatar */}
            <div 
              onClick={handleAvatarClick}
              className="relative group cursor-pointer"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-linear-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shadow-xl shadow-orange-500/40 border-4 border-white shrink-0 overflow-hidden">
                {user.avatar_url ? (
                  <img src={avatarUrl} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </div>
            {/* Edit hint */}
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-500 hover:text-orange-600 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 transition-all uppercase tracking-wider"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
              Edit
            </button>
          </div>

          {/* Name & info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{user.full_name}</h1>
              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${roleBadgeColor}`}>
                {user.role}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-bold">{user.email}</p>
            {user.phone && (
              <p className="text-xs text-slate-400 font-bold mt-0.5">{user.phone}</p>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
            <div className="text-center">
              <p className="text-lg sm:text-xl font-black text-slate-900">{itemCount}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Cart Items</p>
            </div>
            <div className="text-center border-x border-slate-100">
              <p className="text-lg sm:text-xl font-black text-orange-600">—</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-xl font-black text-slate-900 capitalize">{user.role}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="space-y-4">
        {accountLinks.map((section) => (
          <div key={section.section}>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-2">
              {section.section}
            </p>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {section.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-4 px-4 sm:px-5 py-3.5 sm:py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${item.color}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">{item.label}</p>
                    <p className="text-[11px] text-slate-400 font-bold">{item.desc}</p>
                  </div>
                  {item.badge && (
                    <span className="w-6 h-6 bg-orange-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">
                      {item.badge}
                    </span>
                  )}
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-orange-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Account info section */}
        <div>
          <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-2">
            Account
          </p>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-50 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-700">Member ID</p>
                <p className="text-[10px] text-slate-400 font-bold font-mono mt-0.5 truncate max-w-[200px]">{user.id}</p>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(user.id)}
                className="p-2 rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-600 transition-all"
                title="Copy ID"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
              </button>
            </div>
            <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-700">Member Since</p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Recently joined'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className="mt-6 w-full flex items-center justify-center gap-3 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 font-black py-4 rounded-2xl border border-red-100 hover:border-red-200 transition-all active:scale-95 uppercase tracking-widest text-xs shadow-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        Sign Out of Account
      </button>

      <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest mt-6">
        QuickMart v1.0 · Campus Commerce
      </p>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setIsEditing(false)}
            />
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-slate-100"
              >
                <div className="bg-orange-600 p-8 text-white text-center">
                  <h3 className="text-2xl font-black tracking-tight">Edit Profile</h3>
                  <p className="text-orange-100 text-xs font-bold uppercase tracking-widest mt-1">Keep your info up to date</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="p-8 space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editData.full_name}
                      onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                    />
                  </div>

                  {updateError && (
                    <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100">{updateError}</p>
                  )}

                  {updateSuccess && (
                    <p className="text-emerald-500 text-xs font-bold text-center bg-emerald-50 py-3 rounded-xl border border-emerald-100">Profile updated successfully! ✓</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 border-2 border-slate-100 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-600/30 transition-all active:scale-95"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
