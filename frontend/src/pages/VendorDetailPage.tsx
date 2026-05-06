import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getVendor, getVendorProducts } from '../api/endpoints';
import { useCartStore } from '../stores/cartStore';
import type { Product } from '../types';

export default function VendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => getVendor(Number(vendorId)).then((r) => r.data),
    enabled: !!vendorId,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['vendorProducts', vendorId],
    queryFn: () => getVendorProducts(Number(vendorId)).then((r) => r.data),
    enabled: !!vendorId,
  });

  const handleAddToCart = (product: Product) => {
    // Check if cart has items from another vendor
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
      <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Shop not found</h2>
        <button onClick={() => navigate('/')} className="text-indigo-600 font-bold">Back to Explore</button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Vendor Header */}
      <div className="relative rounded-[3rem] overflow-hidden mb-16 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 shadow-2xl shadow-indigo-500/5">
        <div className="h-64 md:h-80 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-blue-600/90 z-10" />
          {vendor.image_url ? (
            <img src={vendor.image_url} alt={vendor.shop_name} className="w-full h-full object-cover scale-110 blur-sm opacity-50" />
          ) : (
             <div className="w-full h-full bg-indigo-600" />
          )}
          
          {/* Animated Circles */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl z-20"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl z-20"></div>
        </div>

        <div className="px-10 pb-10 relative z-30 -mt-24 md:-mt-32">
          <div className="flex flex-col md:flex-row md:items-end gap-8">
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-[2.5rem] border-[8px] border-white dark:border-slate-950 bg-white dark:bg-slate-900 overflow-hidden shadow-2xl flex-shrink-0">
              {vendor.image_url ? (
                <img src={vendor.image_url} alt={vendor.shop_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/40 text-indigo-600 dark:text-indigo-400">
                  <span className="text-6xl font-black">{vendor.shop_name.charAt(0)}</span>
                </div>
              )}
            </div>

            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">{vendor.shop_name}</h1>
                <span className="px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-md border border-white/20">
                  {vendor.category}
                </span>
              </div>
              <p className="text-indigo-50/80 text-lg font-medium mb-6 max-w-2xl">{vendor.description}</p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-bold">
                  <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {vendor.location}
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-sm font-bold">
                  <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Open Now
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Available Items</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Freshly prepared for you</p>
        </div>
        <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800 mx-8 rounded-full opacity-50"></div>
      </div>

      {productsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-white dark:bg-slate-900 rounded-[2.5rem] animate-pulse border border-slate-100 dark:border-slate-800" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 border-dashed">
          <p className="text-slate-400 font-bold uppercase tracking-widest">No products available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product: Product) => (
            <div key={product.id} className="group card-hover bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-square bg-slate-50 dark:bg-slate-950 relative overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-800">
                    <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="absolute top-5 right-5 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-2xl text-base font-black text-indigo-600 dark:text-indigo-400 shadow-xl">
                  ₦{product.price.toLocaleString()}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-1 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => navigate(`/product/${product.id}`)}>
                  {product.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-6 flex-1">{product.description}</p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full py-4 rounded-2xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
