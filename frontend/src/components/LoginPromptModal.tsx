import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  isOpen,
  onClose,
  message = 'You need to be logged in to add items to your cart.',
}) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="bg-white rounded-4xl shadow-2xl shadow-orange-500/20 border-2 border-orange-50 p-8 w-full max-w-sm text-center"
            >
              {/* Icon */}
              <div className="w-16 h-16 rounded-[1.5rem] bg-orange-50 border-2 border-orange-100 flex items-center justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>

              <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.25em] mb-2">Login Required</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Hold on!</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">{message}</p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl border-2 border-slate-100 text-slate-500 hover:border-slate-200 font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-600/30 transition-all active:scale-95"
                >
                  Login →
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginPromptModal;
