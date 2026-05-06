import React, { useEffect, useState } from 'react';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { getNotifications, markAsRead, markAllAsRead } from '../api/endpoints';
import type { Notification } from '../types';
import { Link } from 'react-router-dom';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: number) => {
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
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
            : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
        }`}
      >
        <BellIcon className={`h-6 w-6 ${isOpen ? 'animate-none' : ''}`} strokeWidth={2.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-xl bg-rose-500 text-[10px] font-black text-white ring-4 ring-white dark:ring-slate-950 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-4 w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
            <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Updates</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Platform Notifications</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllRead}
                  className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider hover:bg-indigo-100 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
            
            <div className="max-h-[32rem] overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="py-20 px-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                    <BellIcon className="h-10 w-10 text-indigo-400" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Quiet here</h4>
                  <p className="text-xs text-slate-400 mt-2 font-medium">No new notifications for now.</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-50 dark:divide-slate-800">
                  {notifications.map(n => (
                    <li 
                      key={n.id} 
                      className={`px-8 py-6 transition-all group relative ${!n.is_read ? 'bg-indigo-50/20 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                    >
                      <div className="flex gap-4">
                        <div className="mt-1.5 flex-shrink-0">
                          <div className={`h-2.5 w-2.5 rounded-full ring-4 ${!n.is_read ? 'bg-indigo-600 ring-indigo-600/10' : 'bg-slate-200 dark:bg-slate-700 ring-transparent'}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-relaxed ${!n.is_read ? 'font-black text-slate-900 dark:text-white' : 'font-medium text-slate-500 dark:text-slate-400'}`}>
                            {n.message}
                          </p>
                          <p className="text-[10px] font-black text-indigo-600/60 dark:text-indigo-400/60 uppercase tracking-widest mt-2">
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        {!n.is_read && (
                          <button 
                            onClick={() => handleMarkAsRead(n.id)}
                            className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                            title="Mark as read"
                          >
                            <CheckIcon className="h-4 w-4" strokeWidth={3} />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-center">
              <Link 
                to="/orders" 
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
              >
                Track Orders &rarr;
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
