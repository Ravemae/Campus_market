import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { Link } from 'react-router-dom';
import { 
  PiPackageBold, 
  PiUserCircleBold, 
  PiStorefrontBold, 
  PiChartLineUpBold,
  PiHeartBold
} from 'react-icons/pi';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const stats = [
    { label: 'Total Orders', value: '0', icon: <PiPackageBold />, color: 'bg-orange-50 text-orange-700 border border-orange-100' },
    { label: 'Saved Shops', value: '0', icon: <PiHeartBold />, color: 'bg-rose-50 text-rose-700 border border-rose-100' },
    { label: 'Market Trends', value: 'Up', icon: <PiChartLineUpBold />, color: 'bg-emerald-50 text-emerald-700 border border-emerald-100' },
  ];

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Header / Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-2">
          {greeting}, <span className="text-orange-700">{user?.full_name?.split(' ')[0] || 'User'}!</span>
        </h1>
        <p className="text-slate-600 font-bold text-sm sm:text-base">
          Welcome to your QuickMart dashboard. What's on your mind today?
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.color} flex items-center justify-center text-2xl shadow-sm`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity / Next Steps */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-amber-900 rounded-[2.5rem] p-8 sm:p-10 text-white relative overflow-hidden group"
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-black mb-4">Hungry or Shopping?</h2>
            <p className="text-amber-200 font-bold mb-8 max-w-sm">
              Explore the latest vendors on campus and get your items delivered fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/products"
                className="px-8 py-4 bg-orange-700 hover:bg-orange-800 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-orange-900/20"
              >
                Browse Items
              </Link>
              <Link 
                to="/vendors"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95"
              >
                Find Shops
              </Link>
            </div>
          </div>
          {/* Abstract SVG Background */}
          <svg className="absolute right-0 bottom-0 w-64 h-64 text-white/5 transform translate-x-20 translate-y-20" fill="currentColor" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" />
          </svg>
        </motion.div>

        {/* Shortcuts */}
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: 'My Orders', icon: <PiPackageBold />, path: '/orders', color: 'bg-orange-50/50 text-orange-700 border-orange-100/50' },
            { label: 'My Profile', icon: <PiUserCircleBold />, path: '/profile', color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'All Shops', icon: <PiStorefrontBold />, path: '/vendors', color: 'bg-purple-50 text-purple-600 border-purple-100' },
            { label: 'Support', icon: <PiPackageBold />, path: 'mailto:quickmart.apps@gmail.com', color: 'bg-slate-50 text-slate-600 border-slate-100' },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + (i * 0.1) }}
            >
              {item.path.startsWith('mailto:') ? (
                <a 
                  href={item.path}
                  className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${item.color}`}
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </a>
              ) : (
                <Link 
                  to={item.path}
                  className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all hover:shadow-xl hover:-translate-y-1 ${item.color}`}
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
