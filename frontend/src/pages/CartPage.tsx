import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

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
        <div className="w-28 h-28 mx-auto mb-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-400">
          <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
          Your Cart is Empty
        </h2>
        <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
          Looks like you haven't added any delicious items yet. Explore our vendors and find something tasty!
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Shopping Cart
        </h1>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8">
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <li key={item.productId} className="flex p-8 sm:p-10 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="shrink-0">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/150'}
                      alt={item.name}
                      className="w-24 h-24 rounded-2xl object-cover sm:w-32 sm:h-32 shadow-md"
                    />
                  </div>

                  <div className="ml-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-xl font-black text-slate-900 dark:text-white hover:text-indigo-600 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-2 text-indigo-600 dark:text-indigo-400 font-black">
                          ₦{item.price.toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="p-2 text-slate-500 hover:text-indigo-600 transition-all"
                        >
                          <MinusIcon className="h-5 w-5" strokeWidth={3} />
                        </button>
                        <span className="px-6 py-2 text-slate-900 dark:text-white font-black min-w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="p-2 text-slate-500 hover:text-indigo-600 transition-all"
                        >
                          <PlusIcon className="h-5 w-5" strokeWidth={3} />
                        </button>
                      </div>
                      
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                        Subtotal: <span className="text-slate-900 dark:text-white ml-2">₦{(item.price * item.quantity).toLocaleString()}</span>
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
              className="text-sm font-black text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-2"
            >
              <TrashIcon className="h-4 w-4" />
              Clear Cart
            </button>
            <Link
              to="/"
              className="text-sm font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <section className="mt-16 lg:mt-0 lg:col-span-4 sticky top-32">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 p-8 sm:p-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">
              Order summary
            </h2>

            <dl className="space-y-6">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Subtotal</dt>
                <dd className="text-slate-900 dark:text-white font-black">
                  ₦{getTotal().toLocaleString()}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 font-medium">Delivery Fee</dt>
                <dd className="text-slate-400 font-medium text-sm italic">Calculated at next step</dd>
              </div>
              <div className="border-t border-slate-50 dark:border-slate-800 pt-6 flex items-center justify-between">
                <dt className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Total</dt>
                <dd className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  ₦{getTotal().toLocaleString()}
                </dd>
              </div>
            </dl>

            <button
              onClick={handleCheckout}
              className="mt-10 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[1.8rem] shadow-xl shadow-indigo-600/30 transition-all active:scale-95 text-lg"
            >
              Proceed to Checkout
            </button>
            
            <p className="mt-6 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
              Secure checkout with Paystack
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CartPage;
