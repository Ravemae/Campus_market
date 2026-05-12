import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getProduct, getVendor, resolveMediaUrl } from '../api/endpoints';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { ShoppingBagIcon, ChevronLeftIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import LoginPromptModal from '../components/LoginPromptModal';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId!).then((r) => r.data),
    enabled: !!productId,
  });

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', product?.vendor_id],
    queryFn: () => getVendor(product!.vendor_id).then((r) => r.data),
    enabled: !!product?.vendor_id,
  });

  if (productLoading || vendorLoading) {
    return <div className="text-center py-32 text-orange-600 font-black uppercase tracking-[0.3em] animate-pulse">Product loading...</div>;
  }

  if (!product) {
    return (
      <div className="text-center py-32">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Product not found</h2>
        <button onClick={() => navigate('/')} className="text-orange-600 font-bold uppercase tracking-widest text-xs">Back to Marketplace</button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
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
      quantity,
      imageUrl: product.image_url || '',
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <>
    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-12 relative overflow-hidden pb-28 sm:pb-12">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -mr-40 -mt-40 -z-10" />
      
      <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-400 hover:text-orange-600 mb-4 sm:mb-10 transition-all font-black uppercase tracking-widest text-[10px]">
        <div className="p-2 rounded-xl bg-white border-2 border-slate-50 group-hover:border-orange-100 group-hover:bg-orange-50 transition-all">
          <ChevronLeftIcon className="w-4 h-4" strokeWidth={3} />
        </div>
        Back to listings
      </button>

      <div className="bg-white border-2 border-slate-50 rounded-2xl sm:rounded-[3rem] overflow-hidden p-4 sm:p-8 md:p-12 shadow-2xl shadow-orange-500/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 lg:gap-20">
          {/* Image */}
          <div className="aspect-square bg-slate-50 rounded-xl sm:rounded-[2.5rem] overflow-hidden border-2 border-slate-100 shadow-inner group relative">
            {product.image_url ? (
              <img src={resolveMediaUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200">
                <ShoppingBagIcon className="w-24 h-24" />
              </div>
            )}
            <div className="absolute top-6 right-6">
              <span className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 text-orange-600 font-black text-xl">
                ₦{product.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col py-4">
            {vendor && (
              <button onClick={() => navigate(`/vendor/${vendor.id}`)} className="group flex items-center gap-2 mb-4 text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-orange-600 transition-colors">From {vendor.shop_name}</span>
                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                  <div className="w-1 h-1 rounded-full bg-slate-400 group-hover:bg-orange-600"></div>
                </div>
              </button>
            )}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 sm:mb-6 tracking-tight">{product.name}</h1>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4">
                 <span className="px-4 py-2 rounded-xl bg-orange-50 text-orange-600 text-xs font-black uppercase tracking-widest border border-orange-100">
                    {product.category}
                 </span>
                 <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${product.is_available ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {product.is_available ? 'In Stock' : 'Unavailable'}
                 </span>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-600 font-bold leading-relaxed text-lg">
                <p>{product.description || 'No detailed description available for this product yet. Rest assured, it is high quality and campus-approved!'}</p>
              </div>
            </div>

            <div className="mt-auto space-y-8 pt-10 border-t-2 border-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Quantity Selection</label>
                  <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border-2 border-slate-100">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-orange-600 hover:bg-white rounded-xl transition-all shadow-sm">
                      <MinusIcon className="w-5 h-5" strokeWidth={3} />
                    </button>
                    <span className="w-12 text-center font-black text-slate-900 text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-orange-600 hover:bg-white rounded-xl transition-all shadow-sm">
                      <PlusIcon className="w-5 h-5" strokeWidth={3} />
                    </button>
                  </div>
                </div>
                
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Price</p>
                   <p className="text-3xl font-black text-orange-600 tracking-tight">₦{(product.price * quantity).toLocaleString()}</p>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.is_available}
                className={`w-full py-5 rounded-[1.8rem] font-black text-white shadow-2xl transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-4 uppercase tracking-widest text-sm ${
                  addedToCart
                    ? 'bg-emerald-500 shadow-emerald-500/30'
                    : 'bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-orange-600/30'
                }`}
              >
                {addedToCart ? (
                  <><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Added!</>
                ) : (
                  <><ShoppingBagIcon className="w-6 h-6" strokeWidth={2.5} />{product.is_available ? 'Add to Cart' : 'Currently Unavailable'}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
      <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </>  
  );
}
