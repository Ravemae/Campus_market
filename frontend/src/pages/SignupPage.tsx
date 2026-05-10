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
    <div className="min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Blobs for Bright Sensation */}
      <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-orange-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-[100px] -ml-20 -mb-20" />
      
      <div className="w-full max-w-md relative z-10 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Create your account</h1>
          <p className="text-slate-600 font-bold">Start shopping on QuickMart</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest px-1">Full Name</label>
            <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm font-bold"
              placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest px-1">Email Address</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm font-bold"
              placeholder="you@university.edu" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest px-1">Phone Number</label>
            <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm font-bold"
              placeholder="08012345678" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest px-1">Security Password</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm font-bold"
              placeholder="Min 8 characters" />
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight px-1">Must include uppercase, lowercase, number, and special character</p>
          </div>

          {mutation.isError && (
            <div className="px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600 font-bold">
              {(mutation.error as any)?.response?.data?.detail || 'Something went wrong'}
            </div>
          )}

           <button type="submit" disabled={mutation.isPending}
            className="w-full py-4.5 rounded-2xl font-black text-white bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-xl shadow-orange-600/30 transition-all disabled:opacity-50 active:scale-95 uppercase tracking-widest text-sm">
            {mutation.isPending ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-10 text-center space-y-4">
          <p className="text-sm text-slate-600 font-bold">Already have an account? <Link to="/login" className="text-orange-600 hover:underline">Sign in</Link></p>
          <p className="text-sm text-slate-500 font-bold">Want to sell? <Link to="/signup/vendor" className="text-orange-500 hover:underline">Register as vendor</Link></p>
        </div>
      </div>
    </div>
  );
}
