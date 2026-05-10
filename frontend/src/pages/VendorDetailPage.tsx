import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getVendor, getVendorProducts } from '../api/endpoints';
import { motion } from 'framer-motion';
import { useCartStore } from '../stores/cartStore';
import type { Product } from '../types';



export default function VendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => vendorId ? getVendor(vendorId).then((r) => r.data) : Promise.reject('No vendorId'),
    enabled: !!vendorId,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['vendorProducts', vendorId],
    queryFn: () => vendorId ? getVendorProducts(vendorId).then((r) => r.data) : Promise.reject('No vendorId'),
    enabled: !!vendorId,
  });

  const handleAddToCart = (product: Product) => {
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
    return <div className="text-center py-32 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading shop...</div>;
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
            <img src={vendor.image_url} alt={vendor.shop_name} className="w-full h-full object-cover scale-110 blur-sm opacity-50" />
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
                <img src={vendor.image_url} alt={vendor.shop_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
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
              <p className="text-orange-50/80 text-xl font-bold mb-6 max-w-2xl leading-relaxed">{vendor.description}</p>
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

      {/* Products Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 sm:mb-16">
        <div className="flex flex-col">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">Handpicked Collection</h2>
          <p className="text-[10px] sm:text-xs font-bold text-orange-400 uppercase tracking-[0.4em] mt-2 sm:mt-3">Premium quality items only</p>
        </div>
        <div className="h-0.5 flex-1 bg-orange-100 hidden md:block mx-12 rounded-full opacity-30"></div>
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 border-dashed">
          <p className="text-slate-400 font-bold uppercase tracking-widest">No products available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product: Product) => (
            <div key={product.id} className="group card-hover bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-square bg-slate-50 relative overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="absolute top-5 right-5 px-4 py-2 bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl text-base font-black text-orange-600 shadow-xl">
                  ₦{product.price.toLocaleString()}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-1 cursor-pointer hover:text-orange-600 transition-colors" onClick={() => navigate(`/product/${product.id}`)}>
                  {product.name}
                </h3>
                <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 flex-1">{product.description}</p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full py-4 rounded-2xl text-sm font-black text-white bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-600/20 hover:shadow-orange-600/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
