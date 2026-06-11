import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PiCoffeeBold, PiHeartBold, PiTwitterLogoBold, PiInstagramLogoBold, PiGlobeBold, PiXBold, PiStorefrontBold } from 'react-icons/pi';
// @ts-ignore
import { usePaystackPayment } from 'react-paystack';
// @ts-ignore
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useAuthStore } from '../stores/authStore';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

function DonationModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [gateway, setGateway] = useState<'paystack' | 'flutterwave'>('flutterwave');

  const finalAmount = customAmount ? parseInt(customAmount) : amount;

  // Paystack Config
  // const paystackConfig = {
  //   reference: (new Date()).getTime().toString(),
  //   email: user?.email || 'donor@example.com',
  //   amount: finalAmount * 100, // kobo
  //   publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
  // };

  // const initializePaystack = usePaystackPayment(paystackConfig);

  // Flutterwave Config
  const fwConfig = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-placeholder',
    tx_ref: Date.now().toString(),
    amount: finalAmount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: user?.email || 'donor@example.com',
      phone_number: user?.phone || '0000000000',
      name: user?.full_name || 'Guest Donor',
    },
    customizations: {
      title: 'Buy QuickMart a Coffee',
      description: 'Support the campus marketplace',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  };

  const handleFlutterwavePayment = useFlutterwave(fwConfig);

  const handleDonate = () => {
    if (!finalAmount || finalAmount < 100) {
      alert('Please enter a valid amount (min ₦100)');
      return;
    }

    // if (gateway === 'paystack') {
    //   initializePaystack({
    //     onSuccess: () => { alert('Thank you for your donation!'); onClose(); },
    //     onClose: () => alert('Payment cancelled.'),
    //   });
    // } else {
      
      handleFlutterwavePayment({
        callback: (response: any) => {
          console.log(response);
          closePaymentModal();
          alert('Thank you for your donation!');
          onClose();
        },
        onClose: () => {},
      });

  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 sm:p-10"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors text-xl">
              <PiXBold />
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                <PiCoffeeBold />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Buy us a Coffee</h2>
              <p className="text-slate-500 font-bold text-sm mt-2">Support our mission to empower campus trade</p>
            </div>

            {/* Amount Selection */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setAmount(amt); setCustomAmount(''); }}
                  className={`py-3 rounded-2xl font-black text-sm transition-all border-2 ${
                    amount === amt && !customAmount 
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/20' 
                      : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-orange-200'
                  }`}
                >
                  ₦{amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <input
                type="number"
                placeholder="Custom Amount (₦)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-black focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-slate-400 text-center"
              />
            </div>

            {/* Gateway Selection */}
            <div className="flex gap-2 mb-8">
              {/* <button 
                onClick={() => setGateway('paystack')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                  gateway === 'paystack' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 text-slate-400'
                }`}
              >
                Paystack
              </button> */}
              <button 
                onClick={() => setGateway('flutterwave')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                  gateway === 'flutterwave' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 text-slate-400'
                }`}
              >
                Flutterwave
              </button>
            </div>

            <button
              onClick={handleDonate}
              className="w-full py-5 rounded-2xl font-black text-white bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-xl shadow-orange-600/30 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
            >
              Support Now <PiHeartBold className="text-xl" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="bg-white border-t-2 border-slate-50 pt-20 pb-28 md:pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-600/30">
                  <PiStorefrontBold className="text-2xl" />
                </div>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">QuickMart</span>
              </Link>
              <p className="text-slate-500 font-bold leading-relaxed mb-8 max-w-xs">
                Empowering campus trade with lightning-fast delivery and seamless student connections.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all border border-slate-100">
                  <PiTwitterLogoBold />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all border border-slate-100">
                  <PiInstagramLogoBold />
                </a>
                <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all border border-slate-100">
                  <PiGlobeBold />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-8">Quick Links</h3>
              <ul className="space-y-4">
                <li><Link to="/products" className="text-slate-500 font-bold hover:text-orange-600 transition-colors">Browse Marketplace</Link></li>
                <li><Link to="/vendors" className="text-slate-500 font-bold hover:text-orange-600 transition-colors">Campus Shops</Link></li>
                <li><Link to="/signup/vendor" className="text-slate-500 font-bold hover:text-orange-600 transition-colors">Sell on QuickMart</Link></li>
                <li><Link to="/orders" className="text-slate-500 font-bold hover:text-orange-600 transition-colors">Track Orders</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-slate-900 font-black uppercase tracking-widest text-xs mb-8">Support</h3>
              <ul className="space-y-4">
                <li><Link to="/help" className="text-slate-500 font-bold hover:text-orange-600 transition-colors">Help Center</Link></li>
                <li><Link to="/terms" className="text-slate-500 font-bold hover:text-orange-600 transition-colors">Terms of Service</Link></li>
                <li><Link to="/terms" className="text-slate-500 font-bold hover:text-orange-600 transition-colors">Privacy Policy</Link></li>
                <li><a href="mailto:quickmart.apps@gmail.com" className="text-slate-500 font-bold hover:text-orange-600 transition-colors">Contact Us</a></li>
              </ul>
            </div>

            {/* Donation Card */}
            <div className="bg-orange-700 rounded-4xl p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4">Love QuickMart?</h3>
                <p className="text-orange-50 font-bold text-sm mb-8 leading-relaxed opacity-80">
                  Support the team behind this platform and help us keep it free for all students.
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 bg-white text-orange-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all active:scale-95 shadow-xl shadow-orange-900/20 flex items-center justify-center gap-2"
                >
                  Buy us a coffee <PiCoffeeBold className="text-lg" />
                </button>
              </div>
              <PiHeartBold className="absolute -right-8 -bottom-8 text-white/10 text-[12rem] transform rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </div>
          </div>

          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 font-bold text-xs">
              © {new Date().getFullYear()} QuickMart. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">
              <span>Built with Love</span>
              <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
              <span>For Students</span>
            </div>
          </div>
        </div>
      </footer>

      <DonationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
