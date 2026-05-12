import React, { useEffect, useState } from 'react';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { getNotifications, markAsRead, markAllAsRead } from '../api/endpoints';
import type { Notification } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNew, setLatestNew] = useState<Notification | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res.data) {
        const newUnread = res.data.filter(n => !n.is_read);
        
        // Check for *actually new* notifications to show toast
        if (notifications.length > 0) {
          const oldIds = new Set(notifications.map(n => n.id));
          const brandNew = newUnread.filter(n => !oldIds.has(n.id));
          if (brandNew.length > 0) {
            setLatestNew(brandNew[0]);
            setTimeout(() => setLatestNew(null), 6000);
          }
        }
        
        setNotifications(res.data);
        setUnreadCount(newUnread.length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [notifications.length]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-2xl transition-all duration-300 ${
          isOpen 
            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' 
            : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'
        }`}
      >
        <BellIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${isOpen ? 'animate-none' : ''}`} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-xl bg-red-600 text-[8px] sm:text-[10px] font-black text-white ring-4 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-4xl shadow-2xl shadow-orange-500/10 z-50 overflow-hidden border-2 border-orange-50 animate-in fade-in zoom-in-95 duration-300 origin-top-right">
            <div className="px-6 py-5 bg-orange-50/30 border-b border-orange-50 flex justify-between items-center">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Updates</h3>
                <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mt-0.5">Campus Notifications</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-[9px] font-black uppercase tracking-wider hover:bg-orange-200 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="py-16 px-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-50 flex items-center justify-center">
                    <BellIcon className="h-8 w-8 text-orange-200" />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">All caught up!</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-bold">No new notifications right now.</p>
                </div>
              ) : (
                <ul className="divide-y divide-orange-50">
                  {notifications.map(n => (
                    <li 
                      key={n.id} 
                      className={`px-6 py-4 transition-all group relative ${!n.is_read ? 'bg-orange-50/20' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex gap-4">
                        <div className="mt-1.5 shrink-0">
                          <div className={`h-2 w-2 rounded-full ${!n.is_read ? 'bg-orange-600 shadow-sm shadow-orange-600/50' : 'bg-slate-200'}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[12px] leading-relaxed ${!n.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>
                            {n.message}
                          </p>
                          <p className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                            <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                            <span>{new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          </p>
                        </div>
                        {!n.is_read && (
                          <button 
                            onClick={() => handleMarkAsRead(n.id)}
                            className="p-1.5 rounded-lg bg-white shadow-sm border border-orange-100 text-orange-600 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                            title="Mark as read"
                          >
                            <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="p-3 bg-slate-50/50 border-t border-orange-50 text-center">
              <Link 
                to="/orders" 
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-orange-600 transition-colors py-1"
              >
                Track Orders &rarr;
              </Link>
            </div>
          </div>
        </>
      )}
      {/* Floating Toast for new notifications */}
      {latestNew && (
        <div className="fixed top-24 right-6 z-100 w-72 sm:w-80 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="bg-white rounded-2xl border-2 border-orange-500 shadow-2xl shadow-orange-500/20 p-4 pointer-events-auto flex gap-4 items-start"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-600/30">
              <BellIcon className="w-5 h-5 animate-bounce" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">New Update</p>
              <p className="text-[12px] font-black text-slate-900 leading-tight mb-2 line-clamp-2">
                {latestNew.message}
              </p>
              <Link 
                to={latestNew.type === 'order' ? '/orders' : '#'} 
                onClick={() => setLatestNew(null)}
                className="text-[10px] font-black text-slate-400 hover:text-orange-600 uppercase tracking-widest transition-colors flex items-center gap-1"
              >
                View Details &rarr;
              </Link>
            </div>
            <button 
              onClick={() => setLatestNew(null)}
              className="text-slate-300 hover:text-slate-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
