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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Open your shop</h1>
          <p className="text-slate-500 font-medium">Join QuickMart as a vendor</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-8">
          {/* Owner Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center text-xs shadow-lg shadow-orange-500/20">1</span>
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Full Name</label>
                <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 rounded-2xl py-3.5 px-5 text-slate-900 dark:text-white font-bold focus:border-orange-500 focus:ring-0 transition-all placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 rounded-2xl py-3.5 px-5 text-slate-900 dark:text-white font-bold focus:border-orange-500 focus:ring-0 transition-all placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} required
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 rounded-2xl py-3.5 px-5 text-slate-900 dark:text-white font-bold focus:border-orange-500 focus:ring-0 transition-all placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Password</label>
                <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 rounded-2xl py-3.5 px-5 text-slate-900 dark:text-white font-bold focus:border-orange-500 focus:ring-0 transition-all placeholder:text-slate-400" />
              </div>
            </div>
          </div>

          {/* Shop Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center text-xs shadow-lg shadow-orange-500/20">2</span>
              Shop Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Shop Name</label>
                  <input type="text" value={form.shop_name} onChange={(e) => update('shop_name', e.target.value)} required
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 rounded-2xl py-3.5 px-5 text-slate-900 dark:text-white font-bold focus:border-orange-500 focus:ring-0 transition-all placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Category</label>
                  <select value={form.shop_category} onChange={(e) => update('shop_category', e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 rounded-2xl py-3.5 px-5 text-slate-900 dark:text-white font-bold focus:border-orange-500 focus:ring-0 transition-all cursor-pointer">
                    <option>Food</option><option>Drinks</option><option>Snacks</option><option>Groceries</option>
                    <option>Electronics</option><option>Fashion</option><option>Services</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Location</label>
                <input type="text" value={form.shop_location} onChange={(e) => update('shop_location', e.target.value)} required
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 rounded-2xl py-3.5 px-5 text-slate-900 dark:text-white font-bold focus:border-orange-500 focus:ring-0 transition-all placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Description</label>
                <textarea value={form.shop_description} onChange={(e) => update('shop_description', e.target.value)} required rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-900 rounded-2xl py-3.5 px-5 text-slate-900 dark:text-white font-bold focus:border-orange-500 focus:ring-0 transition-all placeholder:text-slate-400 resize-none" />
              </div>
            </div>
          </div>

          {mutation.isError && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {(mutation.error as any)?.response?.data?.detail || 'Something went wrong'}
            </div>
          )}

          <button type="submit" disabled={mutation.isPending}
            className="w-full py-5 rounded-2xl font-black text-white bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-xl shadow-orange-500/25 transition-all disabled:opacity-50 active:scale-95 text-xs uppercase tracking-widest">
            {mutation.isPending ? 'Registering Shop...' : 'Register Shop'}
          </button>
        </form>
      </div>
    </div>
  );
}
