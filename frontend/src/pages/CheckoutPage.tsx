import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { createOrder, initializePayment, getHostels } from '../api/endpoints';

const CheckoutPage: React.FC = () => {
  const { items, getTotal } = useCartStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [hostelName, setHostelName] = useState<string>('');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [hostelsList, setHostelsList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const subtotal = getTotal();
  const deliveryFee = deliveryType === 'delivery' ? 200 : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    if (items.length === 0) {
      navigate('/cart');
    }
    
    // Fetch hostels
    const fetchHostels = async () => {
      try {
        const res = await getHostels();
        setHostelsList(res.data.hostels);
        if (res.data.hostels.length > 0) {
          setHostelName(res.data.hostels[0]);
        }
      } catch (err) {
        console.error("Failed to load hostels", err);
      }
    };
    fetchHostels();
  }, [isAuthenticated, items, navigate]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (deliveryType === 'delivery') {
      if (!hostelName || !roomNumber) {
        setError("Please provide your hostel name and room number.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Create the order
      const vendorId = items[0].vendorId; // Guaranteed to be same vendor from our cart logic
      const orderItems = items.map(i => ({
        product_id: i.productId,
        quantity: i.quantity,
        unit_price: i.price
      }));

      const orderRes = await createOrder({
        vendor_id: vendorId,
        items: orderItems,
        delivery_type: deliveryType,
        hostel_name: deliveryType === 'delivery' ? hostelName : undefined,
        room_number: deliveryType === 'delivery' ? roomNumber : undefined
      });

      const orderId = orderRes.data.id;

      // 2. Initialize payment with Paystack
      const payRes = await initializePayment(orderId);
      
      // 3. Redirect to Paystack URL
      if (payRes.data.payment_url) {
        window.location.href = payRes.data.payment_url;
      } else {
        throw new Error("No payment URL received.");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to process checkout. Try again later.");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Checkout</h1>
      </div>
      
      {error && (
        <div className="mb-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        
        {/* Left Column: Delivery Info */}
        <div className="lg:col-span-3 space-y-8">
          {/* Delivery Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 tracking-tight">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              Delivery Method
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDeliveryType('pickup')}
                className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 ${
                  deliveryType === 'pickup'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 ring-4 ring-indigo-500/10'
                    : 'border-slate-100 dark:border-slate-800 bg-transparent hover:border-indigo-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  deliveryType === 'pickup' ? 'border-indigo-600' : 'border-slate-300'
                }`}>
                  {deliveryType === 'pickup' && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-1">Pickup</p>
                  <p className="text-slate-500 text-sm font-medium">Collect from vendor</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('delivery')}
                className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-3 ${
                  deliveryType === 'delivery'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 ring-4 ring-indigo-500/10'
                    : 'border-slate-100 dark:border-slate-800 bg-transparent hover:border-indigo-200'
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  deliveryType === 'delivery' ? 'border-indigo-600' : 'border-slate-300'
                }`}>
                  {deliveryType === 'delivery' && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-1">Delivery</p>
                  <p className="text-slate-500 text-sm font-medium">Sent to your hostel (₦200)</p>
                </div>
              </button>
            </div>

            {/* Delivery Details Fields */}
            {deliveryType === 'delivery' && (
              <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 grid grid-cols-1 gap-6 sm:grid-cols-2 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                  <label htmlFor="hostel" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    Hostel Name
                  </label>
                  <select
                    id="hostel"
                    value={hostelName}
                    onChange={(e) => setHostelName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-900 dark:text-white font-bold focus:border-indigo-500 focus:ring-0 transition-all cursor-pointer"
                  >
                    {hostelsList.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="room" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    id="room"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. A203"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-900 dark:text-white font-bold focus:border-indigo-500 focus:ring-0 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl shadow-indigo-500/5 sticky top-32">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 tracking-tight">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              Order Summary
            </h2>
            
            <ul className="space-y-4 mb-8">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 group">
                   <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      QTY: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
            
            <div className="space-y-4 pt-8 border-t border-slate-50 dark:border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-900 dark:text-white font-black">₦{subtotal.toLocaleString()}</span>
              </div>
              
              {deliveryType === 'delivery' && (
                <div className="flex justify-between items-center text-sm animate-in fade-in duration-300">
                  <span className="text-slate-500 font-medium">Delivery Fee</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">₦200</span>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-4">
                <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Total</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  ₦{total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-10 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black py-5 rounded-[1.8rem] shadow-xl shadow-indigo-600/30 transition-all active:scale-95 text-lg flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                `Pay ₦${total.toLocaleString()}`
              )}
            </button>
            
            <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center gap-4">
              <img src="https://paystack.com/assets/img/integrations/paystack-mark-white.png" alt="Paystack" className="h-6 w-auto hidden dark:block" />
              <img src="https://paystack.com/assets/img/integrations/paystack-mark.png" alt="Paystack" className="h-6 w-auto dark:hidden" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                Your payment is secured and processed by Paystack
              </p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default CheckoutPage;
