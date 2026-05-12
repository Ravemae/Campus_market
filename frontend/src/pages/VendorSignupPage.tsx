import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signupVendor } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';

export default function VendorSignupPage() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '',
    shop_name: '', shop_description: '', shop_location: '', shop_category: 'Food'
  });
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const mutation = useMutation({
    mutationFn: () => signupVendor(form),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.access_token);
      navigate('/vendor-dashboard');
    },
  });

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Open your shop</h1>
          <p className="text-slate-600 font-bold">Join QuickMart as a vendor and start selling today</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-10">
          {/* Owner Info */}
          <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/50">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-linear-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center text-sm shadow-lg shadow-orange-500/30 font-black">1</span>
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 px-1">Full Name</label>
                <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 px-1">Email Address</label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 px-1">Phone Number</label>
                <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 px-1">Security Password</label>
                <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-slate-400" />
              </div>
            </div>
          </div>

          {/* Shop Info */}
          <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/50">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
              <span className="w-10 h-10 rounded-2xl bg-linear-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center text-sm shadow-lg shadow-orange-500/30 font-black">2</span>
              Shop Details
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 px-1">Shop Name</label>
                  <input type="text" value={form.shop_name} onChange={(e) => update('shop_name', e.target.value)} required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 px-1">Shop Category</label>
                  <select value={form.shop_category} onChange={(e) => update('shop_category', e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all cursor-pointer">
                    <option>Food</option><option>Drinks</option><option>Snacks</option><option>Groceries</option>
                    <option>Electronics</option><option>Fashion</option><option>Services</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 px-1">Pickup/Delivery Location</label>
                <input type="text" value={form.shop_location} onChange={(e) => update('shop_location', e.target.value)} required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 px-1">Shop Description</label>
                <textarea value={form.shop_description} onChange={(e) => update('shop_description', e.target.value)} required rows={3}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-slate-400 resize-none" />
              </div>
            </div>
          </div>

          {mutation.isError && (
            <div className="px-6 py-4 rounded-2xl bg-red-500/10 border-2 border-red-500/20 text-sm text-red-600 font-black uppercase tracking-tight">
              {(mutation.error as any)?.response?.data?.detail || 'Something went wrong during registration'}
            </div>
          )}

          <button type="submit" disabled={mutation.isPending}
            className="w-full py-5 rounded-2xl font-black text-white bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-2xl shadow-orange-600/40 transition-all disabled:opacity-50 active:scale-95 text-sm uppercase tracking-widest">
            {mutation.isPending ? 'Launching Shop...' : 'Launch My Shop'}
          </button>
        </form>
      </div>
    </div>
  );
}
