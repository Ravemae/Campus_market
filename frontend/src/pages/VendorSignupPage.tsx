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
          <h1 className="text-2xl font-bold text-white mb-1">Open your shop</h1>
          <p className="text-gray-500 text-sm">Join CampusMarket as a vendor</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-8">
          {/* Owner Info */}
          <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span>
              Personal Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
                <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all" />
              </div>
            </div>
          </div>

          {/* Shop Info */}
          <div className="bg-gray-900/40 border border-gray-800/50 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs">2</span>
              Shop Details
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Shop Name</label>
                  <input type="text" value={form.shop_name} onChange={(e) => update('shop_name', e.target.value)} required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
                  <select value={form.shop_category} onChange={(e) => update('shop_category', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white focus:outline-none focus:border-teal-500/50 transition-all">
                    <option>Food</option><option>Drinks</option><option>Snacks</option><option>Groceries</option>
                    <option>Electronics</option><option>Fashion</option><option>Services</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Location (e.g., Student Union Building)</label>
                <input type="text" value={form.shop_location} onChange={(e) => update('shop_location', e.target.value)} required
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                <textarea value={form.shop_description} onChange={(e) => update('shop_description', e.target.value)} required rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-800/50 border border-gray-700/50 text-white placeholder-gray-600 focus:outline-none focus:border-teal-500/50 transition-all" />
              </div>
            </div>
          </div>

          {mutation.isError && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {(mutation.error as any)?.response?.data?.detail || 'Something went wrong'}
            </div>
          )}

          <button type="submit" disabled={mutation.isPending}
            className="w-full py-3.5 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
            {mutation.isPending ? 'Registering Shop...' : 'Register Shop'}
          </button>
        </form>
      </div>
    </div>
  );
}
