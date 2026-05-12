import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyOtp, resetPassword } from '../api/endpoints';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email] = useState(searchParams.get('email') || '');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Verify OTP, 2: Reset Password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await verifyOtp(otpCode);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword({ email, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-orange-500/10 border-2 border-orange-50 overflow-hidden">
          <div className="bg-orange-600 p-10 text-white text-center relative">
             <div className="flex justify-center mb-4">
                <div className={`w-2 h-2 rounded-full mx-1 transition-all duration-500 ${step === 1 ? 'bg-white w-6' : 'bg-white/40'}`} />
                <div className={`w-2 h-2 rounded-full mx-1 transition-all duration-500 ${step === 2 ? 'bg-white w-6' : 'bg-white/40'}`} />
             </div>
            <h2 className="text-3xl font-black tracking-tight">{step === 1 ? 'Verify OTP' : 'New Password'}</h2>
            <p className="text-orange-100 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
              {step === 1 ? `Sent to ${email}` : 'Security first, make it strong'}
            </p>
          </div>

          <div className="p-10">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.form
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">OTP Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.toUpperCase())}
                      className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all font-black text-2xl text-center tracking-[0.5em] text-slate-900 placeholder:text-slate-200"
                      placeholder="000000"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
                  >
                    {isLoading ? 'Verifying...' : 'Verify Code →'}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleResetPassword}
                  className="space-y-5"
                >
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-900"
                      placeholder="••••••••"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100">{error}</p>
                  )}

                  {success && (
                    <div className="text-center py-4 space-y-3">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <p className="text-emerald-600 text-xs font-bold uppercase tracking-widest">Password reset successful!</p>
                    </div>
                  )}

                  {!success && (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-600/30 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                      {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

            <button
              onClick={() => step === 2 ? setStep(1) : navigate('/forgot-password')}
              className="w-full mt-6 text-[10px] font-black text-slate-400 hover:text-orange-600 uppercase tracking-widest transition-colors"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
