import React, { useEffect, useState } from 'react';
import { getUserOrders, verifyPayment, verifyFlutterwavePayment, initializePayment, initializeFlutterwavePayment } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';
import type { Order } from '../types';
import { Pagination } from '../components/Pagination';
import ReviewModal from '../components/ReviewModal';

const statusSteps = ['pending', 'confirmed', 'ready', 'delivered'];
const statusLabels: Record<string, string> = { pending: 'Pending', confirmed: 'Confirmed', ready: 'Ready', delivered: 'Delivered', cancelled: 'Cancelled' };

const OrdersPage: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewTarget, setReviewTarget] = useState<{ orderId: string; vendorId: string; vendorName: string } | null>(null);
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const res = await getUserOrders();
        setOrders(res.data.sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (err) { console.error("Failed to fetch orders", err); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'ready': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) return <div className="text-center py-32 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading orders...</div>;

  return (
    <div className="max-w-3xl mx-auto px-1 sm:px-6 py-4 sm:py-12 pb-28 sm:pb-12">
      <div className="flex items-center gap-3 mb-6 sm:mb-10">
        <div className="p-2.5 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/30 text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 sm:py-32 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-50 flex items-center justify-center">
            <svg className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">No orders yet</h2>
          <p className="text-slate-500 font-bold text-sm mb-6">Start exploring vendors!</p>
          <button onClick={() => window.location.href='/'} className="text-orange-600 font-black uppercase tracking-widest text-xs">Explore &rarr;</button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {orders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(order => (
            <div key={order.id} className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.15em] font-bold">Date</p>
                    <p className="text-xs font-black text-slate-900">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase tracking-[0.15em] font-bold">Total</p>
                    <p className="text-xs font-black text-orange-600">₦{order.total_amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getStatusColor(order.status)} shadow-sm`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                  {!order.is_paid ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async (e) => {
                          const btn = e.currentTarget;
                          btn.disabled = true;
                          const originalText = btn.innerText;
                          btn.innerText = 'PROCESSING...';
                          try {
                            const res = await (order.payment_reference?.startsWith('FLW') 
                              ? initializeFlutterwavePayment(order.id) 
                              : initializePayment(order.id));
                            const url = res.data.payment_url || (res.data as any).link;
                            if (url) window.location.href = url;
                          } catch (err) {
                            console.error(err);
                            btn.innerText = 'ERROR';
                            setTimeout(() => { btn.disabled = false; btn.innerText = originalText; }, 2000);
                          }
                        }}
                        className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-orange-600 text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
                      >
                        Pay Now
                      </button>
                      {order.payment_reference && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const btn = e.currentTarget;
                            btn.disabled = true;
                            btn.innerText = 'VERIFYING...';
                            try {
                              if (order.payment_reference?.startsWith('order_')) {
                                await verifyPayment(order.payment_reference);
                              } else {
                                await verifyFlutterwavePayment(order.payment_reference || '');
                              }
                              window.location.reload();
                            } catch (err) {
                              console.error(err);
                              btn.disabled = false;
                              btn.innerText = 'VERIFY FAILED';
                              setTimeout(() => btn.innerText = 'VERIFY PAYMENT', 2000);
                            }
                          }}
                          className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
                        >
                          Verify Payment
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 shadow-sm">
                      Paid
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {/* Order ID */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-50">
                  <p className="text-xs font-black text-slate-900 truncate">Order #{order.id.slice(0, 8)}...</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <svg className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    {order.delivery_type === 'delivery' ? `${order.hostel_name || 'Hostel'}, ${order.room_number || ''}` : 'Pickup'}
                  </div>
                </div>

                {/* Order Tracking Progress */}
                {order.status !== 'cancelled' && (
                  <div className="mb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Order Progress</p>
                    <div className="flex items-center gap-1">
                      {statusSteps.map((step, idx) => {
                        const currentIdx = statusSteps.indexOf(order.status);
                        const isComplete = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        return (
                          <React.Fragment key={step}>
                            <div className={`flex flex-col items-center gap-1 ${idx === 0 ? '' : 'flex-1'}`}>
                              <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[8px] font-black border-2 transition-all ${
                                isCurrent ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/30 scale-110' :
                                isComplete ? 'bg-orange-100 border-orange-300 text-orange-600' :
                                'bg-slate-50 border-slate-200 text-slate-400'
                              }`}>
                                {isComplete ? (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                ) : (idx + 1)}
                              </div>
                              <span className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-wider ${isCurrent ? 'text-orange-600' : isComplete ? 'text-orange-500' : 'text-slate-400'}`}>
                                {statusLabels[step]}
                              </span>
                            </div>
                            {idx < statusSteps.length - 1 && (
                              <div className={`flex-1 h-0.5 rounded-full mt-[-16px] sm:mt-[-18px] ${idx < currentIdx ? 'bg-orange-400' : 'bg-slate-200'}`} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <div className="mb-4 px-4 py-3 bg-rose-50 rounded-xl border border-rose-100">
                    <p className="text-xs font-black text-rose-600 uppercase tracking-widest">Order Cancelled</p>
                  </div>
                )}

                {order.items && order.items.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-50">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 flex items-center justify-center bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black">{item.quantity}x</span>
                          <span className="text-slate-600 font-bold">Product #{item.product_id.slice(0, 8)}</span>
                        </div>
                        <span className="font-black text-slate-900">₦{item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
                {/* Leave a Review for delivered orders */}
                {order.status === 'delivered' && (
                  <div className="mt-3 pt-3 border-t border-slate-50">
                    {reviewedOrders.has(order.id) ? (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Review Submitted</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewTarget({ orderId: order.id, vendorId: order.vendor_id, vendorName: order.vendor_name || 'This Vendor' })}
                        className="flex items-center gap-2 text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>
                        Rate this order
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(orders.length / ITEMS_PER_PAGE)}
            onPageChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            totalItems={orders.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      )}

      {reviewTarget && (
        <ReviewModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          orderId={reviewTarget.orderId}
          vendorId={reviewTarget.vendorId}
          vendorName={reviewTarget.vendorName}
          onSuccess={() => {
            setReviewedOrders(prev => new Set([...prev, reviewTarget.orderId]));
            setReviewTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default OrdersPage;
