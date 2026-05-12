import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { signupVendor } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { PiArrowRightBold, PiArrowLeftBold, PiStorefrontBold, PiUserCircleBold } from 'react-icons/pi';
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function VendorSignupPage() {
  const [step, setStep] = useState(1);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '',
    shop_name: '', shop_description: '', shop_location: '', shop_category: 'Food'
  });
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const mutation = useMutation({
    mutationFn: () => signupVendor({ ...form, captcha_token: captchaToken || "" }),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.access_token);
      navigate('/vendor-dashboard');
    },
  });

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const nextStep = () => {
    if (step === 1) {
      if (!form.full_name || !form.email || !form.phone || !form.password) {
        alert('Please fill all personal details');
        return;
      }
      setStep(2);
    }
  };

  const prevStep = () => setStep(1);

  const slideVariants = {
    initial: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    animate: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -50 : 50, opacity: 0 })
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Open your shop</h1>
          <p className="text-slate-600 font-bold">Join QuickMart as a vendor and start selling today</p>
          
          {/* Progress Indicator */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <div className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-orange-600' : 'bg-slate-200'}`} />
            <div className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-orange-600' : 'bg-slate-200'}`} />
          </div>
        </div>

        <form onSubmit={(e) => { 
          e.preventDefault(); 
          if (step === 2) {
            if (!captchaToken) {
              alert('Please complete the captcha verification');
              return;
            }
            mutation.mutate();
          }
        }} className="relative min-h-[450px]">
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 ? (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/50"
              >
                <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                  <span className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl shadow-sm">
                    <PiUserCircleBold />
                  </span>
                  Personal Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
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
                <button type="button" onClick={nextStep}
                  className="w-full py-5 rounded-2xl font-black text-white bg-linear-to-r from-orange-600 to-orange-500 flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 active:scale-95 transition-all uppercase tracking-widest text-sm"
                >
                  Next Step <PiArrowRightBold />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                custom={2}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-slate-200/50"
              >
                <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-4">
                  <span className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl shadow-sm">
                    <PiStorefrontBold />
                  </span>
                  Shop Details
                </h2>
                <div className="space-y-6 mb-8">
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

                {mutation.isError && (
                  <div className="mb-6 px-6 py-4 rounded-2xl bg-red-500/10 border-2 border-red-500/20 text-sm text-red-600 font-black uppercase tracking-tight">
                    {(mutation.error as any)?.response?.data?.detail || 'Something went wrong during registration'}
                  </div>
                )}

                <div className="flex justify-center scale-90 sm:scale-100 origin-center mb-6">
                  <HCaptcha
                    sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-000000000001"}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                  />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={prevStep}
                    className="w-1/3 py-5 rounded-2xl font-black text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-3 active:scale-95 transition-all uppercase tracking-widest text-xs"
                  >
                    <PiArrowLeftBold /> Back
                  </button>
                  <button type="submit" disabled={mutation.isPending || !captchaToken}
                    className="flex-1 py-5 rounded-2xl font-black text-white bg-linear-to-r from-orange-700 to-orange-600 hover:from-orange-800 hover:to-orange-700 shadow-xl shadow-orange-900/20 active:scale-95 transition-all uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {mutation.isPending ? 'Launching...' : 'Launch Shop'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}

