import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginUser } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const mutation = useMutation({
    mutationFn: () => loginUser(email, password),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.access_token);
      navigate('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Blobs for Bright Sensation */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] -mr-40 -mt-40" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[80px] -ml-20 -mb-20" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Sign in to your CampusMarket account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm"
              placeholder="you@university.edu"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>

          {mutation.isError && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {(mutation.error as any)?.response?.data?.detail || 'Invalid credentials'}
            </div>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-4 rounded-2xl font-black text-white bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-xl shadow-orange-600/25 hover:shadow-orange-600/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {mutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-600 hover:text-orange-500 font-bold">
              Sign up
            </Link>
          </p>
          <p className="text-sm text-slate-400 font-medium">
            Want to sell?{' '}
            <Link to="/signup/vendor" className="text-orange-400 hover:text-orange-300 font-bold">
              Register as vendor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
