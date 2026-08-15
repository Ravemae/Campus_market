import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { createOrder, initializePayment, initializeFlutterwavePayment, getHostels, resolveMediaUrl } from '../api/endpoints';

const CheckoutPage: React.FC = () => {
  const { items, getTotal } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [hostelName, setHostelName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [hostelsList, setHostelsList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | null>(null);
  const [error, setError] = useState('');

  const subtotal = getTotal();
  const serviceFee = 100;
  const deliveryFee = deliveryType === 'delivery' ? 200 : 0;
  const total = subtotal + serviceFee + deliveryFee;

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
    if (items.length === 0) navigate('/cart');
    const fetchHostels = async () => {
      try {
        const res = await getHostels();
        setHostelsList(res.data.hostels);
        if (res.data.hostels.length > 0) setHostelName(res.data.hostels[0]);
      } catch (err) { console.error("Failed to load hostels", err); }
    };
    fetchHostels();
  }, [isAuthenticated, items, navigate]);

  const handleCheckout = async (method: 'paystack' | 'flutterwave') => {
    setError('');
    setPaymentMethod(method);
    if (deliveryType === 'delivery' && (!hostelName || !roomNumber)) {
      setError("Please provide your hostel name and room number.");
      setPaymentMethod(null);
      return;
    }
    setIsSubmitting(true);
    try {
      const vendorId = items[0].vendorId;
      // FIX: Send the base subtotal only, as the backend calculates service and delivery fees automatically
      // This prevents the '300 NGN extra' error where fees were being added twice.
      const orderRes = await createOrder({
        vendor_id: vendorId, 
        total_amount: subtotal, 
        delivery_type: deliveryType,
        hostel_name: deliveryType === 'delivery' ? hostelName : undefined,
        room_number: deliveryType === 'delivery' ? roomNumber : undefined
      });
      const orderId = orderRes.data.id;
      if (method === 'paystack') {
        const payRes = await initializePayment(orderId);
        if (payRes.data.payment_url) window.location.href = payRes.data.payment_url;
        else throw new Error("No payment URL received from Paystack.");
      } else {
        const payRes = await initializeFlutterwavePayment(orderId);
        const url = payRes.data.payment_url || payRes.data.link;
        if (url) window.location.href = url;
        else throw new Error("No payment URL received from Flutterwave.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to process checkout. Try again later.");
      setIsSubmitting(false);
      setPaymentMethod(null);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 pb-28 sm:pb-12">
      <div className="flex items-center gap-3 mb-6 sm:mb-10">
        <div className="p-2.5 bg-orange-600 rounded-xl shadow-lg shadow-orange-600/30 text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Checkout</h1>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border-2 border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-12">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border-2 border-slate-50 p-5 sm:p-10 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
              <span className="w-1.5 h-6 bg-orange-600 rounded-full"></span>Delivery Method
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-6">
              <button type="button" onClick={() => setDeliveryType('pickup')}
                className={`p-4 sm:p-8 rounded-xl sm:rounded-4xl border-2 transition-all text-left flex flex-col gap-3 ${deliveryType === 'pickup' ? 'border-orange-600 bg-orange-50/50 ring-4 ring-orange-500/10' : 'border-slate-100 hover:border-orange-200'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryType === 'pickup' ? 'border-orange-600' : 'border-slate-300'}`}>
                  {deliveryType === 'pickup' && <div className="w-2.5 h-2.5 bg-orange-600 rounded-full"></div>}
                </div>
                <div><p className="font-black text-slate-900 uppercase tracking-wider text-[10px] sm:text-xs mb-1">Store Pickup</p><p className="text-slate-500 text-[10px] sm:text-sm font-bold">Free</p></div>
              </button>
              <button type="button" onClick={() => setDeliveryType('delivery')}
                className={`p-4 sm:p-8 rounded-xl sm:rounded-4xl border-2 transition-all text-left flex flex-col gap-3 ${deliveryType === 'delivery' ? 'border-orange-600 bg-orange-50/50 ring-4 ring-orange-500/10' : 'border-slate-100 hover:border-orange-200'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryType === 'delivery' ? 'border-orange-600' : 'border-slate-300'}`}>
                  {deliveryType === 'delivery' && <div className="w-2.5 h-2.5 bg-orange-600 rounded-full"></div>}
                </div>
                <div><p className="font-black text-slate-900 uppercase tracking-wider text-[10px] sm:text-xs mb-1">Delivery</p><p className="text-slate-500 text-[10px] sm:text-sm font-bold">₦200</p></div>
              </button>
            </div>
            {deliveryType === 'delivery' && (
              <div className="mt-6 pt-6 border-t-2 border-slate-50 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="hostel" className="block text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-2">Hostel</label>
                  <select id="hostel" value={hostelName} onChange={(e) => setHostelName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-slate-900 font-bold text-sm focus:border-orange-500 transition-all">
                    {hostelsList.map(h => (<option key={h} value={h}>{h}</option>))}
                  </select>
                </div>
                <div>
                  <label htmlFor="room" className="block text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-2">Room Number</label>
                  <input type="text" id="room" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g. A203" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 text-slate-900 font-bold text-sm focus:border-orange-500 transition-all placeholder:text-slate-400" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border-2 border-slate-50 p-5 sm:p-10 shadow-2xl shadow-orange-500/5 lg:sticky lg:top-32">
            <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3 tracking-tight">
              <span className="w-1.5 h-6 bg-orange-600 rounded-full"></span>Order Summary
            </h2>
            <ul className="space-y-4 mb-6 max-h-[250px] overflow-y-auto scrollbar-hide">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <img src={resolveMediaUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display='none'; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-300"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{item.name}</p>
                    <p className="text-[10px] font-bold text-orange-600">x{item.quantity}</p>
                  </div>
                  <p className="text-xs font-black text-slate-900">₦{(item.price * item.quantity).toLocaleString()}</p>
                </li>
              ))}
            </ul>
            <div className="space-y-3 pt-6 border-t-2 border-slate-50 text-sm">
              <div className="flex justify-between"><span className="text-slate-500 font-bold text-xs">Items</span><span className="text-slate-900 font-black text-xs">₦{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500 font-bold text-xs">Service Fee</span><span className="text-slate-900 font-black text-xs">₦{serviceFee}</span></div>
              {deliveryType === 'delivery' && <div className="flex justify-between"><span className="text-slate-500 font-bold text-xs">Delivery</span><span className="text-orange-600 font-black text-xs">₦{deliveryFee}</span></div>}
              <div className="flex justify-between pt-4 border-t border-slate-50">
                <span className="text-base font-black text-slate-900">Total</span>
                <span className="text-xl font-black text-orange-600">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">Choose Payment</p>
              {/* <button type="button" onClick={() => handleCheckout('paystack')} disabled={isSubmitting}
                className="w-full bg-[#0BA4DB] hover:bg-[#0993C7] disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-lg shadow-[#0BA4DB]/25 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                {isSubmitting && paymentMethod === 'paystack' ? (<><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Processing...</>) : (<>Pay with Paystack</>)}
              </button> */}
              <button type="button" onClick={() => handleCheckout('flutterwave')} disabled={isSubmitting}
                className="w-full bg-[#F5A623] hover:bg-[#E09B1D] disabled:opacity-50 text-white font-black py-4 rounded-2xl shadow-lg shadow-[#F5A623]/25 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs uppercase tracking-widest">
                {isSubmitting && paymentMethod === 'flutterwave' ? (<><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Processing...</>) : (<>Pay with Flutterwave</>)}
              </button>
            </div>
            <p className="mt-6 text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">Secured by Flutterwave</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
