import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import jollofImg from "../../assets/jollof.png";
import fashionImg from "../../assets/fashion_babcock.png";
import techImg from "../../assets/tech.png";
import { 
  PiCookingPotBold, 
  PiCoffeeBold, 
  PiCookieBold, 
  PiBagBold,
  PiHouseBold,
  PiMagnifyingGlassBold,
  PiUserBold,
  PiShoppingBagBold,
  PiListBold,
  PiPlusBold,
  PiOrangeBold,
  PiBookOpenBold
} from "react-icons/pi";

// Floating Card Component
const FloatingCard = ({ 
  children, 
  className, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: [0, -10, 0],
    }}
    transition={{
      opacity: { duration: 0.5, delay },
      y: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }
    }}
    className={cn(
      "absolute z-20 bg-white/80 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-3",
      className
    )}
  >
    {children}
  </motion.div>
);

export const PhoneMockup = () => {
  return (
    <div className="relative w-full max-w-[350px] mx-auto aspect-[9/19]">
      {/* Phone Frame */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative w-full h-full bg-slate-950 rounded-[3rem] p-3 border-[6px] border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-800 rounded-b-2xl z-50" />
        
        {/* Screen Content */}
        <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden flex flex-col">
          {/* App Header */}
          <div className="px-6 py-8 flex justify-between items-center border-b border-slate-50">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
              <PiListBold className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight">QuickMart</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <PiShoppingBagBold className="w-4 h-4" />
            </div>
          </div>
          
          {/* App Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-hide">
             {/* Search */}
             <div className="h-10 bg-slate-50 rounded-xl flex items-center px-4 gap-3">
               <PiMagnifyingGlassBold className="w-4 h-4 text-slate-400" />
               <span className="text-xs font-bold text-slate-400">What do you need?</span>
             </div>
             
             {/* Categories */}
             <div>
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Categories</h4>
               <div className="grid grid-cols-4 gap-2">
                 {[
                   { icon: <PiCookingPotBold className="w-4 h-4" /> },
                   { icon: <PiCoffeeBold className="w-4 h-4" /> },
                   { icon: <PiCookieBold className="w-4 h-4" /> },
                   { icon: <PiOrangeBold className="w-4 h-4" /> },
                   { icon: <PiBookOpenBold className="w-4 h-4" /> },
                   { icon: <PiBagBold className="w-4 h-4" /> },
                 ].map((cat, i) => (
                   <div key={i} className="aspect-square bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                     {cat.icon}
                   </div>
                 ))}
               </div>
             </div>
             
             {/* Product List */}
             <div className="space-y-3">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Featured</h4>
               <div className="flex items-center gap-4 p-2 rounded-2xl border border-slate-50">
                   <div className="w-14 h-14 bg-slate-100 rounded-xl shrink-0 overflow-hidden">
                      <img src={jollofImg} className="w-full h-full object-cover" alt="Jollof" />
                   </div>
                   <div className="flex-1 space-y-1">
                     <div className="text-[10px] font-black text-slate-900">Jollof + Chicken</div>
                     <div className="text-[8px] font-bold text-orange-600">₦1,200</div>
                   </div>
                   <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                     <PiPlusBold className="w-4 h-4" />
                   </div>
               </div>
               <div className="flex items-center gap-4 p-2 rounded-2xl border border-slate-50">
                   <div className="w-14 h-14 bg-slate-100 rounded-xl shrink-0 overflow-hidden">
                      <img src={techImg} className="w-full h-full object-cover" alt="Tech" />
                   </div>
                   <div className="flex-1 space-y-1">
                     <div className="text-[10px] font-black text-slate-900">Wireless Buds</div>
                     <div className="text-[8px] font-bold text-orange-600">₦4,500</div>
                   </div>
                   <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                     <PiPlusBold className="w-4 h-4" />
                   </div>
               </div>
             </div>
          </div>
          
          {/* Bottom Nav */}
          <div className="h-16 border-t border-slate-50 flex items-center justify-around px-4">
            <PiHouseBold className="w-6 h-6 text-orange-600" />
            <PiMagnifyingGlassBold className="w-6 h-6 text-slate-300" />
            <PiShoppingBagBold className="w-6 h-6 text-slate-300" />
            <PiUserBold className="w-6 h-6 text-slate-300" />
          </div>
        </div>
      </motion.div>
      
      {/* Floating Elements */}
      <FloatingCard className="-left-16 top-20" delay={0}>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <PiShoppingBagBold className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fast Delivery</p>
          <p className="text-xs font-black text-slate-900">Instant Connect</p>
        </div>
      </FloatingCard>
      
      <FloatingCard className="-right-12 top-40" delay={1}>
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 overflow-hidden border border-orange-100">
           <img src={jollofImg} className="w-full h-full object-cover scale-125" alt="Jollof" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fresh Meals</p>
          <p className="text-xs font-black text-slate-900">₦1,200</p>
        </div>
      </FloatingCard>

      <FloatingCard className="-left-16 bottom-24" delay={0.5}>
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 overflow-hidden border border-indigo-100">
           <img src={techImg} className="w-full h-full object-cover scale-110" alt="Tech" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tech Store</p>
          <p className="text-xs font-black text-slate-900">From ₦5k</p>
        </div>
      </FloatingCard>

      <FloatingCard className="-right-16 bottom-32" delay={1.5}>
        <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600 overflow-hidden border border-pink-100">
           <img src={fashionImg} className="w-full h-full object-cover" alt="Fashion" />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Campus Fits</p>
          <p className="text-xs font-black text-slate-900">New Drops</p>
        </div>
      </FloatingCard>

      {/* Decorative Orbs */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-400/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -z-10" />
    </div>
  );
};
