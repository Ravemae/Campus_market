import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createReview } from '../api/endpoints';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  vendorId: string;
  vendorName: string;
  onSuccess: () => void;
}

const StarButton: React.FC<{ filled: boolean; hovered: boolean; onClick: () => void; onHover: () => void; onLeave: () => void }> = ({ filled, hovered, onClick, onHover, onLeave }) => (
  <button
    onClick={onClick}
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
    className="transition-transform active:scale-90 hover:scale-110"
  >
    <svg className={`w-9 h-9 transition-colors duration-150 ${filled || hovered ? 'text-amber-400' : 'text-slate-200'}`} fill={filled || hovered ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  </button>
);

const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, orderId, vendorId, vendorName, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await createReview({ vendor_id: vendorId, order_id: orderId, rating, comment: comment.trim() || undefined });
      setDone(true);
      setTimeout(() => { onSuccess(); onClose(); setDone(false); setRating(0); setComment(''); }, 1800);
    } catch {
      alert('Failed to submit review. You may have already reviewed this order.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-[2rem] shadow-2xl shadow-orange-500/20 border-2 border-orange-50 p-8 w-full max-w-md"
            >
              {done ? (
                <div className="text-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}
                    className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </motion.div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">Review Submitted!</h3>
                  <p className="text-slate-400 text-sm font-bold">Thank you for your feedback 🙏</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Rate Your Experience</p>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{vendorName}</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors p-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Star Rating */}
                  <div className="flex flex-col items-center gap-3 mb-6 py-6 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <StarButton
                          key={star}
                          filled={star <= rating}
                          hovered={star <= hoverRating && hoverRating > 0}
                          onClick={() => setRating(star)}
                          onHover={() => setHoverRating(star)}
                          onLeave={() => setHoverRating(0)}
                        />
                      ))}
                    </div>
                    <p className={`text-sm font-black uppercase tracking-widest transition-colors ${rating > 0 ? 'text-amber-500' : 'text-slate-300'}`}>
                      {RATING_LABELS[hoverRating || rating] || 'Tap to rate'}
                    </p>
                  </div>

                  {/* Comment */}
                  <div className="mb-6">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      Comment <span className="text-slate-300 normal-case tracking-normal font-medium">(optional)</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Tell others about your experience..."
                      rows={3}
                      className="w-full bg-slate-50 border-2 border-slate-100 focus:border-orange-400 rounded-2xl p-4 text-sm text-slate-900 font-medium placeholder:text-slate-300 resize-none transition-colors outline-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || submitting}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-600/30 transition-all active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>
                        Submit Review
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;
