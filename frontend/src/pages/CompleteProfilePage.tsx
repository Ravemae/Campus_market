import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { updateProfile } from '../api/endpoints';
import { motion } from 'framer-motion';

export default function CompleteProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'vendor'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await updateProfile(user.id, {
        full_name: fullName,
        phone: phone,
        role: role as any
      });
      
      // Update store with new user data
      const token = localStorage.getItem('token') || '';
      setAuth(res.data.user, token);
      
      // Redirect based on role
      if (role === 'vendor') {
        navigate('/vendor-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 overflow-hidden border-4 border-white">
            {user.avatar_url ? (
               <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <span className="text-3xl font-black text-white">{user.full_name?.charAt(0)}</span>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Complete Your Profile</h1>
          <p className="text-slate-600 font-bold">Just a few more details to get you started</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email (Registered)</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-400 font-bold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 px-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500/50 focus:ring-8 focus:ring-orange-500/10 transition-all outline-none font-bold"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 px-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 focus:border-orange-500/50 focus:ring-8 focus:ring-orange-500/10 transition-all outline-none font-bold"
              placeholder="08012345678"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 px-1">I want to...</label>
            <div className="grid grid-cols-2 gap-4">
               <button
                 type="button"
                 onClick={() => setRole('user')}
                 className={`py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
                   role === 'user' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200'
                 }`}
               >
                 Buy Items
               </button>
               <button
                 type="button"
                 onClick={() => setRole('vendor')}
                 className={`py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${
                   role === 'vendor' ? 'bg-orange-600 border-orange-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200'
                 }`}
               >
                 Sell Items
               </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-slate-900/20 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
}
