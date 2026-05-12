import { motion } from "framer-motion";
import { Spotlight } from "../components/ui/Spotlight";
import { WavyBackground } from "../components/ui/WavyBackground";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { PhoneMockup } from "../components/ui/PhoneMockup";
import heroDelivery from "../assets/hero-delivery.jpg";
import { 
  PiCookingPotBold, 
  PiCoffeeBold, 
  PiCookieBold, 
  PiDevicesBold, 
  PiTShirtBold, 
  PiWrenchBold,
  PiSquaresFourBold,
  PiOrangeBold,
  PiBookOpenBold,
  PiLightningBold 
} from "react-icons/pi";

const CATEGORIES = [
  { id: 'All', label: 'All', icon: <PiSquaresFourBold className="w-7 h-7" /> },
  { id: 'Food', label: 'Meals', icon: <PiCookingPotBold className="w-7 h-7" /> },
  { id: 'Drinks', label: 'Drinks', icon: <PiCoffeeBold className="w-7 h-7" /> },
  { id: 'Snacks', label: 'Snacks', icon: <PiCookieBold className="w-7 h-7" /> },
  { id: 'Fruits', label: 'Fruits', icon: <PiOrangeBold className="w-7 h-7" /> },
  { id: 'Books', label: 'Books', icon: <PiBookOpenBold className="w-7 h-7" /> },
  { id: 'Electronics', label: 'Tech', icon: <PiDevicesBold className="w-7 h-7" /> },
  { id: 'Fashion', label: 'Fashion', icon: <PiTShirtBold className="w-7 h-7" /> },
  { id: 'Services', label: 'Services', icon: <PiWrenchBold className="w-7 h-7" /> },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const handleTrackOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      navigate('/orders');
    } else {
      navigate('/login?redirect=/orders');
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      
      {/* Hero Section */}
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden py-20 lg:py-0">
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="orange" />
        
        <WavyBackground className="w-full" containerClassName="w-screen relative left-1/2 -translate-x-1/2" backgroundFill="white" blur={8}>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100/50 border border-orange-200/50 text-orange-700 mb-8 mx-auto lg:mx-0">
                <div className="w-2 h-2 rounded-full bg-orange-700 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Live at Babcock University</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tighter text-slate-900 mb-6 leading-[0.9]">
                Campus Commerce, <br />
                <span className="bg-linear-to-r from-orange-700 to-amber-600 bg-clip-text text-transparent">
                  Reimagined.
                </span>
              </h1>
              
              <p className="max-w-xl text-slate-600 text-lg md:text-xl font-medium mb-10 leading-relaxed">
                The most seamless way to trade, eat, and thrive on campus. 
                From cafeteria favorites to tech essentials, delivered fast via our Keke network.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
                <Link
                  to="/products"
                  className="w-full sm:w-auto px-10 py-5 bg-orange-700 text-white font-black rounded-2xl shadow-2xl shadow-orange-900/20 hover:bg-orange-800 transition-all active:scale-95 uppercase tracking-widest text-sm text-center"
                >
                  Start Shopping
                </Link>
                <Link
                  to="/vendors"
                  className="w-full sm:w-auto px-10 py-5 bg-white text-slate-900 border-2 border-slate-100 font-black rounded-2xl hover:border-orange-500 hover:text-orange-600 transition-all active:scale-95 uppercase tracking-widest text-sm text-center"
                >
                  Explore Shops
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 border-t border-slate-100 pt-8">
                <div className="text-center lg:text-left">
                   <p className="text-2xl font-black text-slate-900">50+</p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendors</p>
                </div>
                <div className="text-center lg:text-left">
                   <p className="text-2xl font-black text-slate-900">Fast</p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery</p>
                </div>
                <div className="text-center lg:text-left">
                   <p className="text-2xl font-black text-slate-900">5k+</p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Students</p>
                </div>
              </div>
            </motion.div>
            
            {/* Right: Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <PhoneMockup />
            </motion.div>
          </div>
        </WavyBackground>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-1 h-8 bg-linear-to-b from-orange-500 to-transparent rounded-full" />
        </motion.div>
      </div>

      {/* Quick Categories */}
      <section className="hidden sm:block py-12 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {CATEGORIES.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-4 group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-700 group-hover:text-white group-hover:border-orange-700 group-hover:scale-105 group-hover:-rotate-3 transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-orange-900/10">
                  {cat.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-orange-600 transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      <motion.section 
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="py-24 px-6 max-w-7xl mx-auto"
      >
         <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-5xl font-black text-slate-900 mb-4"
            >
              Everything Campus
            </motion.h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Curated for students, by students</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {/* Food Bento */}
            <Link 
              to="/products?category=Food"
              className="md:col-span-2 lg:col-span-3 bg-orange-50 rounded-4xl p-8 relative overflow-hidden group border border-orange-100/50 block transition-all duration-500 hover:shadow-2xl hover:shadow-orange-600/10 hover:-translate-y-2"
            >
               <div className="relative z-10 h-full flex flex-col">
                  <div className="bg-white/50 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center text-orange-600 mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform">
                     <PiCookingPotBold className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-orange-950 mb-2">Fresh Eats</h3>
                  <p className="text-orange-900/60 font-medium max-w-[200px]">Hot meals from your favorite campus vendors, delivered to your hostel.</p>
                  <div className="mt-auto pt-8">
                     <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-orange-50 bg-orange-200" />
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-orange-50 bg-white flex items-center justify-center text-[10px] font-black text-orange-600">
                          +12
                        </div>
                     </div>
                     <p className="text-[10px] font-black text-orange-900/40 uppercase tracking-widest mt-2">Active Vendors</p>
                  </div>
               </div>
               <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-200/50 rounded-full blur-3xl group-hover:bg-orange-300/50 transition-colors" />
               <PiCookingPotBold className="absolute -right-8 -bottom-8 w-48 h-48 text-orange-200/20 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none" />
            </Link>

            {/* Tech Bento */}
            <Link 
              to="/products?category=Electronics"
              className="md:col-span-2 lg:col-span-3 bg-slate-900 rounded-4xl p-8 relative overflow-hidden group border border-slate-800 block transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-600/10 hover:-translate-y-2"
            >
               <div className="relative z-10 h-full flex flex-col">
                  <div className="bg-white/10 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 shadow-sm border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                     <PiDevicesBold className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Gadgets & Tech</h3>
                  <p className="text-slate-400 font-medium max-w-[200px]">Laptops, phones, and essentials for your final year projects.</p>
                  <div className="mt-auto pt-8">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">New Arrivals</span>
                     </div>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-full h-full bg-linear-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <PiDevicesBold className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none" />
            </Link>

            {/* Logistics Bento */}
            <div 
              onClick={handleTrackOrder}
              className="md:col-span-4 lg:col-span-4 bg-amber-900 rounded-4xl p-10 relative overflow-hidden group border border-amber-800/50 block transition-all duration-500 hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-2 cursor-pointer"
            >
               {/* Background Image with Gradient Blend */}
               <div className="absolute inset-0 z-0">
                  <img 
                    src={heroDelivery} 
                    alt="Delivery" 
                    className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-amber-950 via-amber-900/90 to-transparent" />
               </div>
               <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="max-w-md">
                    <div className="bg-white/10 backdrop-blur-md text-white w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                       <PiWrenchBold className="w-6 h-6" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Swift Logistics</h3>
                    <p className="text-amber-50/70 font-medium text-lg leading-relaxed">Hostel to hostel, or campus to campus. Our dispatch riders are always ready.</p>
                  </div>
                  <div className="mt-12 flex items-center gap-6">
                     <div 
                       className="px-8 py-4 bg-white text-amber-900 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-white/10 hover:bg-amber-50 active:scale-95"
                     >
                       Track Order
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-amber-400">
                           <PiLightningBold className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-xl font-black text-white leading-tight">Fast</span>
                           <span className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest leading-none">Delivery</span>
                        </div>
                     </div>
                  </div>
               </div>

            </div>

            {/* Fashion Bento */}
            <Link 
              to="/products?category=Fashion"
              className="md:col-span-2 lg:col-span-2 bg-indigo-50 rounded-4xl p-8 relative overflow-hidden group min-h-[350px] border border-indigo-100/50 block transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-600/10 hover:-translate-y-2"
            >
               <div className="relative z-10 h-full flex flex-col">
                  <div className="bg-white/50 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform">
                     <PiTShirtBold className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black text-indigo-950 mb-2">Campus Style</h3>
                  <p className="text-indigo-900/60 font-medium">Babcock compliant, student approved fits.</p>
                  <div className="mt-auto">
                    <span className="text-[10px] font-black text-indigo-950/40 uppercase tracking-widest">Explore Trends</span>
                  </div>
               </div>
               <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-200/50 rounded-full blur-3xl group-hover:bg-indigo-300/50 transition-colors" />
               <PiTShirtBold className="absolute -right-8 -bottom-8 w-48 h-48 text-indigo-200/20 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none" />
            </Link>
         </div>
      </motion.section>



      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
               <h4 className="text-4xl md:text-6xl font-black text-orange-700 mb-2 group-hover:scale-110 transition-transform">50k+</h4>
               <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Active Students</p>
            </div>
            <div className="text-center group">
               <h4 className="text-4xl md:text-6xl font-black text-orange-700 mb-2 group-hover:scale-110 transition-transform">200+</h4>
               <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Campus Shops</p>
            </div>
            <div className="text-center group">
               <h4 className="text-4xl md:text-6xl font-black text-orange-700 mb-2 group-hover:scale-110 transition-transform">100k+</h4>
               <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Successful Trades</p>
            </div>
            <div className="text-center group">
               <h4 className="text-4xl md:text-6xl font-black text-orange-700 mb-2 group-hover:scale-110 transition-transform">4.9/5</h4>
               <p className="text-slate-900 font-black uppercase tracking-widest text-[10px]">Student Rating</p>
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-linear-to-br from-orange-800 to-orange-700 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-orange-900/30">
           <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tight">Ready to join the <br /> campus revolution?</h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                {user ? (
                  <Link 
                    to="/dashboard" 
                    className="px-12 py-5 bg-white text-orange-700 font-black rounded-2xl shadow-xl hover:bg-orange-50 transition-all active:scale-95 uppercase tracking-widest text-sm flex items-center gap-2"
                  >
                    Go to Dashboard
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="px-10 py-5 bg-white text-orange-700 font-black rounded-2xl shadow-xl hover:bg-orange-50 transition-all active:scale-95 uppercase tracking-widest text-sm">Create Account</Link>
                    <Link to="/login" className="px-10 py-5 bg-orange-900/30 text-white border-2 border-orange-400/30 font-black rounded-2xl hover:bg-orange-900/50 transition-all active:scale-95 uppercase tracking-widest text-sm backdrop-blur-sm">Sign In</Link>
                  </>
                )}
              </div>
           </div>
           {/* Decorative elements */}
           <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
           <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-orange-700 flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
               </div>
               <span className="text-xl font-black text-slate-900 tracking-tight">QuickMart</span>
            </div>
            <div className="flex gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
               <a href="#" className="hover:text-orange-600">Privacy</a>
               <a href="#" className="hover:text-orange-600">Terms</a>
               <a href="mailto:quickmart.apps@gmail.com" className="hover:text-orange-600">Contact</a>
            </div>
            <p className="text-[10px] font-bold text-slate-400">© 2026 QuickMart Inc. All rights reserved.</p>
         </div>
      </footer>
    </div>
  );
}
