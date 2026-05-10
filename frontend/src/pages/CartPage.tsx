import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { resolveMediaUrl } from '../api/endpoints';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const CartPage: React.FC = () => {
  const { items, updateQty, removeItem, getTotal, clearCart } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert("Please login to proceed to checkout!");
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="w-28 h-28 mx-auto mb-8 rounded-[2.5rem] bg-orange-50 flex items-center justify-center text-orange-400">
          <ShoppingBagIcon className="w-14 h-14" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
          Your Cart is Empty
        </h2>
        <p className="text-slate-500 font-bold mb-10 max-w-sm mx-auto">
          Looks like you haven't added any delicious items yet. Explore our vendors and find something tasty!
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-600/30 transition-all active:scale-95 uppercase tracking-widest text-sm"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-orange-600 rounded-2xl shadow-lg shadow-orange-600/30">
          <ShoppingBagIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Shopping Cart
        </h1>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm overflow-hidden mb-8">
            <ul className="divide-y divide-slate-50">
              {items.map((item) => (
                <li key={item.productId} className="flex p-8 sm:p-10 hover:bg-slate-50/30 transition-colors">
                  <div className="shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 shadow-md">
                      <img
                        src={resolveMediaUrl(item.imageUrl)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </div>
                  </div>

                  <div className="ml-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-xl font-black text-slate-900 hover:text-orange-600 transition-colors tracking-tight"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-2 text-orange-600 font-black text-lg">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center bg-slate-50 rounded-xl p-1 border-2 border-slate-100">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="p-2 text-slate-500 hover:text-orange-600 transition-all"
                        >
                          <MinusIcon className="h-5 w-5" strokeWidth={3} />
                        </button>
                        <span className="px-6 py-2 text-slate-900 font-black min-w-[3.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="p-2 text-slate-500 hover:text-orange-600 transition-all"
                        >
                          <PlusIcon className="h-5 w-5" strokeWidth={3} />
                        </button>
                      </div>
                      
                      <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                        Item Subtotal: <span className="text-slate-900 ml-2">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center px-4">
            <button
              onClick={clearCart}
              className="text-xs font-black text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-2"
            >
              <TrashIcon className="h-4 w-4" />
              Clear Cart
            </button>
            <Link
              to="/"
              className="text-xs font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <section className="mt-16 lg:mt-0 lg:col-span-4 sticky top-32">
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-orange-500/5 p-8 sm:p-10">
            <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">
              Order summary
            </h2>

            <dl className="space-y-6">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 font-bold">Items Subtotal</dt>
                <dd className="text-slate-900 font-black">
                  ₦{getTotal().toLocaleString()}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 font-bold">Delivery Fee</dt>
                <dd className="text-slate-400 font-black text-xs uppercase tracking-widest">At next step</dd>
              </div>
              <div className="border-t-2 border-slate-50 pt-6 flex items-center justify-between">
                <dt className="text-lg font-black text-slate-900 uppercase tracking-tight">Final Total</dt>
                <dd className="text-2xl font-black text-orange-600">
                  ₦{getTotal().toLocaleString()}
                </dd>
              </div>
            </dl>

            <button
              onClick={handleCheckout}
              className="mt-10 w-full bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black py-5 rounded-[1.8rem] shadow-xl shadow-orange-600/30 transition-all active:scale-95 text-lg uppercase tracking-widest text-sm"
            >
              Secure Checkout
            </button>
            
            <div className="mt-8 flex items-center justify-center gap-3 grayscale opacity-50">
               <img src="https://paystack.com/assets/img/integrations/paystack-mark.png" alt="Paystack" className="h-5 w-auto" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protected by Paystack</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CartPage;
