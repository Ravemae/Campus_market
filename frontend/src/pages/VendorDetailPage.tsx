import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getVendor, getVendorProducts, resolveMediaUrl } from '../api/endpoints';
import { motion } from 'framer-motion';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import type { Product } from '../types';

const VendorDetailPage: React.FC = () => {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) {
      const confirmLogin = window.confirm("You need to be logged in to add items to your cart. Login now?");
      if (confirmLogin) {
        navigate('/login');
      }
      return;
    }

    const currentVendorId = cartItems[0]?.vendorId;
    if (currentVendorId && currentVendorId !== product.vendor_id) {
      const confirmMsg = "Your cart has items from another shop. Clear cart to add this item?";
      if (window.confirm(confirmMsg)) {
        useCartStore.getState().clearCart();
      } else {
        return;
      }
    }

    addItem({
      productId: product.id,
      vendorId: product.vendor_id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.image_url || '',
    });
  };

  if (vendorLoading) {
    return <div className="text-center py-32 text-slate-700 font-bold uppercase tracking-widest animate-pulse">Loading shop...</div>;
  }

  if (!vendor) {
    return (
      <div className="text-center py-32 bg-white rounded-[2.5rem] border border-slate-100">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Shop not found</h2>
        <button onClick={() => navigate('/')} className="text-orange-600 font-bold">Back to Explore</button>
      </div>
    );
  }

  return (
    <div className="pb-20 section-container pt-8 sm:pt-12">
      {/* Vendor Header */}
      <div className="relative rounded-[2.5rem] sm:rounded-[4rem] overflow-hidden mb-12 sm:mb-20 bg-white border border-slate-100 shadow-2xl shadow-orange-500/5">
        <div className="h-48 sm:h-64 md:h-96 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-orange-600 via-orange-500 to-amber-500 opacity-90 z-10" />
          {vendor.image_url ? (
            <img src={resolveMediaUrl(vendor.image_url)} alt={vendor.shop_name} className="w-full h-full object-cover scale-110 blur-sm opacity-50" />
          ) : (
             <div className="w-full h-full bg-orange-600" />
          )}
          
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/20 rounded-full blur-[80px] z-20" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-orange-300/30 rounded-full blur-[60px] z-20" 
          />
        </div>

        <div className="px-6 sm:px-10 pb-8 sm:pb-12 relative z-30 -mt-20 sm:-mt-24 md:-mt-32">
          <div className="flex flex-col md:flex-row md:items-end gap-6 sm:gap-10">
            <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-[2rem] sm:rounded-[3rem] border-[6px] sm:border-[10px] border-white bg-white overflow-hidden shadow-2xl shrink-0 group relative">
              {vendor.image_url ? (
                <img src={resolveMediaUrl(vendor.image_url)} alt={vendor.shop_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-50 to-amber-50 text-orange-600">
                  <span className="text-5xl sm:text-7xl font-black tracking-tighter">{vendor.shop_name?.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[2rem] sm:rounded-[3rem]" />
            </div>

            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">{vendor.shop_name}</h1>
                <span className="px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-md border border-white/20">
                  {vendor.category}
                </span>
              </div>
              <p className="text-white font-bold text-lg sm:text-xl mb-6 max-w-2xl leading-relaxed opacity-90">{vendor.description}</p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-bold">
                  <svg className="w-5 h-5 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {vendor.location}
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-bold">
                  <svg className="w-5 h-5 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Open Now
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="mb-12">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-8 tracking-tight flex items-center gap-4">
          <span className="w-2 h-10 bg-orange-600 rounded-full"></span>
          Available Today
        </h2>
        
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
            <p className="text-slate-700 font-bold uppercase tracking-widest">No products listed yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {products.map((product: Product) => (
              <div key={product.id} className="group card-hover bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
                <div className="aspect-square bg-slate-50 relative overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  {product.image_url ? (
                    <img src={resolveMediaUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-slate-900 text-xs font-black shadow-sm">
                      ₦{product.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight group-hover:text-orange-600 transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-slate-700 text-sm font-semibold mb-8 line-clamp-2 leading-relaxed">{product.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-0.5">Price</span>
                      <span className="text-lg font-black text-slate-900 tracking-tight">₦{product.price.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-orange-600/20 active:scale-95 flex items-center justify-center gap-2 group/btn"
                    >
                      <ShoppingBagIcon className="w-5 h-5 transition-transform group-hover/btn:-translate-y-1" strokeWidth={2.5} />
                      <span className="text-xs uppercase tracking-widest">Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDetailPage;
