import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyPayment, verifyFlutterwavePayment } from '../api/endpoints';
import { useCartStore } from '../stores/cartStore';

/* ── Tiny confetti particle ── */
const COLORS = ['#f97316', '#fb923c', '#fbbf24', '#34d399', '#60a5fa', '#f472b6'];
const Particle: React.FC<{ x: number; color: string; delay: number }> = ({ x, color, delay }) => (
  <motion.div
    initial={{ y: -20, x, opacity: 1, rotate: 0, scale: 1 }}
    animate={{ y: 400, opacity: 0, rotate: 720, scale: 0.3 }}
    transition={{ duration: 2.5, delay, ease: 'easeIn' }}
    className="absolute top-0 w-3 h-3 rounded-sm"
    style={{ backgroundColor: color, left: `${x}%` }}
  />
);

const PaymentVerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get('reference');
  const txRef = searchParams.get('tx_ref');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const clearCart = useCartStore((state) => state.clearCart);
  const [showConfetti, setShowConfetti] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!reference && !txRef) {
      setStatus('error');
      setErrorMessage('No payment reference found. Please contact support if you were charged.');
      return;
    }

    const verify = async () => {
      try {
        if (reference) {
          await verifyPayment(reference);
        } else if (txRef) {
          await verifyFlutterwavePayment(txRef);
        }
        clearCart();
        setStatus('success');
        setShowConfetti(true);
        timerRef.current = setTimeout(() => setShowConfetti(false), 3000);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(
          err.response?.data?.detail ||
          'Payment verification failed. Please check your orders page or contact support.'
        );
      }
    };

    verify();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [reference, txRef, clearCart]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 0.8,
  }));

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 pb-28 sm:pb-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto w-full max-w-md relative">
        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((p, i) => (
                <Particle key={i} {...p} />
              ))}
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ── LOADING ── */}
          {status === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="bg-white py-12 px-8 shadow-xl rounded-[2.5rem] border-2 border-orange-50 text-center">
              <div className="w-20 h-20 rounded-[1.8rem] bg-orange-50 border-2 border-orange-100 flex items-center justify-center mx-auto mb-6">
                <svg className="animate-spin h-9 w-9 text-orange-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-3">Confirming Payment</p>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Verifying your order...</h2>
              <p className="text-slate-400 text-sm font-bold">Please don't close this window.</p>
              <div className="flex justify-center gap-1.5 mt-8">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ── */}
          {status === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-white py-12 px-8 shadow-2xl shadow-orange-500/10 rounded-[2.5rem] border-2 border-orange-50 text-center">

              {/* Animated success icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
                className="w-24 h-24 rounded-[2rem] bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center mx-auto mb-6 relative"
              >
                <svg className="h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <div className="absolute inset-0 rounded-[2rem] border-2 border-emerald-300 animate-ping opacity-20" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2">Order Confirmed</p>
                <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Payment Successful! 🎉</h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                  Your order has been placed and the vendor has been notified.<br />
                  You'll receive updates as your order progresses.
                </p>
              </motion.div>

              {/* Order status timeline preview */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="bg-orange-50/60 border border-orange-100 rounded-2xl p-4 mb-8 text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">What happens next?</p>
                {[
                  { label: 'Order Received', desc: 'Vendor has been notified', done: true },
                  { label: 'Being Prepared', desc: 'Vendor is processing your order', done: false },
                  { label: 'Ready for Pickup / Delivery', desc: 'Your order is on its way!', done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${step.done ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      {step.done
                        ? <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        : <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      }
                    </div>
                    <div>
                      <p className={`text-xs font-black ${step.done ? 'text-emerald-700' : 'text-slate-500'}`}>{step.label}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Action buttons */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-lg shadow-orange-600/30 transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  Track My Order
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 font-black rounded-2xl border-2 border-slate-100 hover:border-slate-200 transition-all active:scale-95 uppercase tracking-widest text-sm"
                >
                  Continue Shopping →
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ── ERROR ── */}
          {status === 'error' && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="bg-white py-12 px-8 shadow-xl rounded-[2.5rem] border-2 border-red-50 text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-6">
                <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-2">Verification Failed</p>
              <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Something went wrong</h2>
              <p className="text-slate-500 font-medium text-sm mb-2 leading-relaxed">{errorMessage}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">If you were charged, please check your orders page.</p>

              <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/orders')}
                  className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-lg shadow-orange-600/30 transition-all active:scale-95 uppercase tracking-widest text-sm">
                  Check My Orders
                </button>
                <button onClick={() => navigate('/checkout')}
                  className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 font-black rounded-2xl border-2 border-slate-100 transition-all active:scale-95 uppercase tracking-widest text-sm">
                  Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaymentVerifyPage;
