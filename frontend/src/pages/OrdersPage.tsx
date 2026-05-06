import React, { useEffect, useState } from 'react';
import { getUserOrders } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';
import type { Order } from '../types';
import { ShoppingBagIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const OrdersPage: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const res = await getUserOrders(user.id);
        setOrders(res.data.sort((a, b) => b.id - a.id));
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'confirmed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'ready': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400';
      case 'delivered': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-3 w-3" />;
      case 'confirmed': return <CheckCircleIcon className="h-3 w-3" />;
      case 'ready': return <ShoppingBagIcon className="h-3 w-3" />;
      case 'delivered': return <CheckCircleIcon className="h-3 w-3" />;
      case 'cancelled': return <XCircleIcon className="h-3 w-3" />;
      default: return null;
    }
  };

  if (loading) return <div className="text-center py-32 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading orders...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 text-white">
          <ShoppingBagIcon className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
             <ShoppingBagIcon className="h-12 w-12 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No orders yet</h2>
          <p className="text-slate-500 font-medium mb-10">You haven't placed any orders yet. Start exploring!</p>
          <button onClick={() => window.location.href='/'} className="text-indigo-600 font-black uppercase tracking-widest text-sm">Explore Vendors &rarr;</button>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group">
              <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-1">Placed</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mb-1">Total</p>
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">₦{order.total_amount.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusStyle(order.status)} shadow-sm`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${order.is_paid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                    {order.is_paid ? 'Paid' : 'Unpaid'}
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50 dark:border-slate-800">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Order #{order.id}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {order.delivery_type === 'delivery' 
                      ? `${order.hostel_name}, Room ${order.room_number}` 
                      : 'Self Pickup'}
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black">
                          {item.quantity}x
                        </div>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Product #{item.product_id}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900 dark:text-white">₦{item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-end">
                   <button className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline">View Receipt &rarr;</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
