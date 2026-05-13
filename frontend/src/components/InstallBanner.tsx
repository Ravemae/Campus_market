import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallBannerProps {
  show: boolean;
  onInstall: () => void;
  onClose: () => void;
}

const InstallBanner: React.FC<InstallBannerProps> = ({ show, onInstall, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 bg-slate-900 rounded-3xl p-4 flex items-center gap-3 shadow-2xl z-50 border border-slate-800"
        >
          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0">
             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
             </svg>
          </div>
          <div className="flex-1">
            <p className="font-black text-white text-sm tracking-tight">Add QuickMart to Home Screen</p>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Get faster access to campus shopping</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onInstall}
              className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-xl text-white text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-600/20"
            >
              Add
            </button>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallBanner;
