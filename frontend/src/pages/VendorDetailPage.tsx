import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getVendor, getVendorProducts, getVendorReviews, resolveMediaUrl } from '../api/endpoints';
import { motion } from 'framer-motion';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import type { Product } from '../types';
import LoginPromptModal from '../components/LoginPromptModal';

const VendorDetailPage: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showLoginPrompt, setShowLoginPrompt] = React.useState(false);

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => vendorId ? getVendor(vendorId).then((r) => r.data) : Promise.reject('No vendorId'),
    enabled: !!vendorId,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['vendorProducts', vendorId],
    queryFn: () => vendorId ? getVendorProducts(vendorId).then((r) => r.data) : Promise.reject('No vendorId'),
    enabled: !!vendorId,
  });

  const { data: reviewData } = useQuery({
    queryKey: ['vendorReviews', vendorId],
    queryFn: () => vendorId ? getVendorReviews(vendorId).then((r) => r.data) : Promise.reject('No vendorId'),
    enabled: !!vendorId,
  });

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    addItem({
      productId: product.id, vendorId: product.vendor_id, name: product.name,
      price: product.price, quantity: 1, imageUrl: product.image_url || '',
    });
  };

  if (vendorLoading) {
    return <div className="text-center py-32 text-slate-700 font-bold uppercase tracking-widest animate-pulse">Loading shop...</div>;
  }

  if (!vendor) {
    return (
      <div className="text-center py-32 bg-white rounded-2xl border border-slate-100">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Shop not found</h2>
        <button onClick={() => navigate('/')} className="text-orange-600 font-bold">Back to Explore</button>
      </div>
    );
  }

  return (
    <div className="pb-28 sm:pb-20 pt-4 sm:pt-8">
      {/* Vendor Header */}
      <div className="relative rounded-2xl sm:rounded-[2.5rem] overflow-hidden mb-8 sm:mb-16 bg-white border border-slate-100 shadow-xl">
        <div className="h-40 sm:h-64 md:h-80 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500 z-10" />
          {vendor.image_url && (
            <img src={resolveMediaUrl(vendor.image_url)} alt={vendor.shop_name} className="w-full h-full object-cover scale-110 blur-sm opacity-40" />
          )}
          <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 -mt-20 -mr-20 w-64 sm:w-96 h-64 sm:h-96 bg-white/20 rounded-full blur-[80px] z-20" />
          
          <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 z-30">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-2xl">{vendor.shop_name}</h1>
              <span className="px-3 py-1 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] bg-white/20 text-white backdrop-blur-xl border border-white/30 shadow-lg">
                {vendor.category}
              </span>
            </div>
            <p className="text-white/80 text-xs sm:text-base font-bold max-w-2xl leading-tight line-clamp-2">{vendor.description}</p>
          </div>
        </div>

        <div className="px-4 sm:px-8 pb-6 sm:pb-8 relative z-30 -mt-8 sm:-mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
            <div className="w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-xl sm:rounded-4xl border-4 sm:border-8 border-white bg-white overflow-hidden shadow-xl shrink-0">
              {vendor.image_url ? (
                <img src={resolveMediaUrl(vendor.image_url)} alt={vendor.shop_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-50 to-amber-50 text-orange-600">
                  <span className="text-3xl sm:text-5xl font-black">{vendor.shop_name?.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pb-2">
              <div className="flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-100 shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                <span className="text-xs font-black uppercase tracking-widest">{vendor.location}</span>
              </div>
              <div className="flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-xs font-black uppercase tracking-widest">Open Now</span>
              </div>
              <div className="flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                <span className="text-xs font-black uppercase tracking-widest">{products.length} Products</span>
              </div>
              {/* Rating badge */}
              {reviewData && reviewData.total_reviews > 0 && (
                <div className="flex items-center gap-2 px-3 sm:px-5 py-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>
                  <span className="text-xs font-black uppercase tracking-widest">{reviewData.average_rating.toFixed(1)} ({reviewData.total_reviews})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mb-12">
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 mb-6 sm:mb-8 tracking-tight flex items-center gap-3">
          <span className="w-1.5 h-8 bg-orange-600 rounded-full"></span>
          Menu & Products
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-slate-100">
            <p className="text-slate-700 font-black uppercase tracking-widest text-sm">No products listed yet</p>
            <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest">Check back later</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {products.map((product: Product) => (
              <div key={product.id} className="group bg-white border-2 border-slate-50 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all flex flex-col">
                <div className="aspect-square bg-slate-50 relative overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  {product.image_url ? (
                    <img src={resolveMediaUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <svg className="w-12 h-12 sm:w-16 sm:h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <span className="px-2 sm:px-3 py-1 rounded-lg bg-white/95 backdrop-blur-md text-orange-700 text-[10px] sm:text-sm font-black shadow-md border border-orange-100">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>
                  {!product.is_available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="px-4 py-2 bg-red-500 text-white text-xs font-black rounded-xl uppercase tracking-widest">Sold Out</span>
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-5 flex flex-col flex-1">
                  <h3 className="text-xs sm:text-base font-black text-slate-900 mb-1 tracking-tight group-hover:text-orange-600 transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-slate-500 text-[10px] sm:text-xs font-semibold mb-3 sm:mb-5 line-clamp-2 leading-relaxed">{product.description}</p>

                  <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
                    <span className="text-sm sm:text-lg font-black text-orange-600">₦{product.price.toLocaleString()}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.is_available}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all shadow-lg shadow-orange-600/20 active:scale-95 flex items-center gap-1.5 text-[9px] sm:text-xs uppercase tracking-wider"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      {reviewData && reviewData.total_reviews > 0 && (
        <div className="mb-12">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-3">
            <span className="w-1.5 h-8 bg-amber-400 rounded-full" />
            Customer Reviews
            <span className="ml-2 px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-xl uppercase tracking-widest border border-amber-100">
              {reviewData.average_rating.toFixed(1)} ★ · {reviewData.total_reviews} review{reviewData.total_reviews !== 1 ? 's' : ''}
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviewData.reviews.slice(0, 6).map((review: any) => (
              <div key={review.id} className="bg-white rounded-2xl border-2 border-orange-50 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700 font-black text-sm">
                      {review.reviewer_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-black text-slate-900">{review.reviewer_name || 'Customer'}</span>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                      </svg>
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-3">{review.comment}</p>
                )}
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-3">
                  {new Date(review.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </div>
  );
};

export default VendorDetailPage;
