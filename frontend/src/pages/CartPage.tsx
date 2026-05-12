import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { resolveMediaUrl } from '../api/endpoints';

const CartPage: React.FC = () => {
  const { items, updateQty, removeItem, getTotal, clearCart } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) { alert("Please login to proceed!"); navigate('/login'); }
    else navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-3 py-16 sm:py-32 text-center pb-28 sm:pb-32">
        <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-6 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-400">
          <svg className="w-10 h-10 sm:w-14 sm:h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" /></svg>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">Your Cart is Empty</h2>
        <p className="text-slate-500 font-bold text-sm mb-8 max-w-sm mx-auto">Explore our vendors and find something delicious!</p>
        <Link to="/" className="inline-flex items-center px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-lg active:scale-95 uppercase tracking-widest text-xs">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-6 py-4 sm:py-12 pb-28 sm:pb-12">
      <div className="flex items-center gap-3 mb-6 sm:mb-10">
        <div className="p-2.5 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/30">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" /></svg>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Cart</h1>
        <span className="ml-auto text-xs font-bold text-slate-400">{items.length} items</span>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:items-start">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border-2 border-slate-50 shadow-sm overflow-hidden mb-4">
            <ul className="divide-y divide-slate-50">
              {items.map((item) => (
                <li key={item.productId} className="flex p-3 sm:p-6 hover:bg-slate-50/30 transition-colors gap-3 sm:gap-5">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 shadow-sm shrink-0">
                    {item.imageUrl ? (
                      <img src={resolveMediaUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src='data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>' }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-300">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <Link to={`/product/${item.productId}`} className="text-sm sm:text-base font-black text-slate-900 hover:text-orange-600 transition-colors line-clamp-1">{item.name}</Link>
                        <p className="text-orange-600 font-black text-xs sm:text-base mt-0.5">₦{item.price.toLocaleString()}</p>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                        <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="p-1.5 text-slate-500 hover:text-orange-600">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
                        </button>
                        <span className="px-3 py-1 text-slate-900 font-black text-xs min-w-[2rem] text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="p-1.5 text-slate-500 hover:text-orange-600">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        </button>
                      </div>
                      <p className="text-xs font-black text-slate-700">₦{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between items-center px-2">
            <button onClick={clearCart} className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              Clear All
            </button>
            <Link to="/" className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest">&larr; Continue</Link>
          </div>
        </div>

        <section className="mt-8 lg:mt-0 lg:col-span-4 lg:sticky lg:top-32">
          <div className="bg-white rounded-2xl border-2 border-slate-50 shadow-xl p-5 sm:p-8">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-6 tracking-tight">Summary</h2>
            <dl className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-slate-500 font-bold">Subtotal</dt>
                <dd className="text-slate-900 font-black">₦{getTotal().toLocaleString()}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-slate-500 font-bold">Delivery</dt>
                <dd className="text-slate-400 font-bold text-xs uppercase tracking-widest">At checkout</dd>
              </div>
              <div className="border-t-2 border-slate-50 pt-4 flex items-center justify-between">
                <dt className="text-base font-black text-slate-900">Total</dt>
                <dd className="text-xl font-black text-orange-600">₦{getTotal().toLocaleString()}</dd>
              </div>
            </dl>
            <button onClick={handleCheckout} className="mt-8 w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-600/30 transition-all active:scale-95 uppercase tracking-widest text-xs">
              Checkout
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CartPage;
