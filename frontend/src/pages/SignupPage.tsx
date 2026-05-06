import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signupUser } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';

export default function SignupPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' });
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const mutation = useMutation({
    mutationFn: () => signupUser(form),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.access_token);
      navigate('/');
    },
  });

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm">Start shopping on CampusMarket</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
            <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800/50 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800/50 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="you@university.edu" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800/50 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="08012345678" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required
              className="w-full px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800/50 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="Min 8 chars, uppercase, number, special" />
            <p className="text-[11px] text-gray-600 mt-1.5">Must include uppercase, lowercase, number, and special character</p>
          </div>

          {mutation.isError && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {(mutation.error as any)?.response?.data?.detail || 'Something went wrong'}
            </div>
          )}

          <button type="submit" disabled={mutation.isPending}
            className="w-full py-3 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
            {mutation.isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">Already have an account? <Link to="/login" className="text-emerald-400 font-medium">Sign in</Link></p>
          <p className="text-sm text-gray-600">Want to sell? <Link to="/signup/vendor" className="text-teal-400 font-medium">Register as vendor</Link></p>
        </div>
      </div>
    </div>
  );
}
