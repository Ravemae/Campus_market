import React, { useEffect, useState } from 'react';
import { getAllVendorsAdmin, approveVendor, getAdminDashboard } from '../api/endpoints';
import type { Vendor } from '../types';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  UsersIcon, 
  BuildingStorefrontIcon, 
  CurrencyDollarIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboardPage: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        getAllVendorsAdmin(),
        getAdminDashboard()
      ]);
      setVendors(vRes.data);
      setDashboardData(dRes.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await approveVendor(id);
      setVendors(vendors.map(v => v.id === id ? { ...v, is_approved: true } : v));
      fetchData(); // Refresh stats
    } catch (err) {
      alert('Failed to approve vendor');
    }
  };

  if (loading) return <div className="text-center py-20">Loading dashboard...</div>;

  const pendingVendors = vendors.filter(v => !v.is_approved);
  const stats = dashboardData?.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-2 block">System Administration</span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Platform Overview</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-black text-slate-600 dark:text-slate-400 hover:border-indigo-600 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-[2rem] border border-rose-100 dark:border-rose-900/20 font-bold flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {[
          { label: 'Total Users', value: stats?.total_users, icon: UsersIcon, color: 'indigo' },
          { label: 'Vendors', value: stats?.total_vendors, icon: BuildingStorefrontIcon, color: 'blue' },
          { label: 'Orders', value: stats?.total_orders, icon: ShoppingCartIcon, color: 'emerald' },
          { label: 'Revenue', value: `₦${stats?.total_revenue.toLocaleString()}`, icon: CurrencyDollarIcon, color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 group hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300">
            <div className="flex flex-col gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className="h-7 w-7" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-12">
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Order Velocity</h3>
            <span className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-xl uppercase tracking-widest">LAST 7 DAYS</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData?.daily_trends}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                  dy={10}
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    padding: '16px'
                  }}
                  itemStyle={{ color: '#818cf8', fontWeight: '900', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: '700' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={false}
                  activeDot={{ r: 8, stroke: '#fff', strokeWidth: 4, fill: '#6366f1' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">Market Mix</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData?.category_breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {dashboardData?.category_breakdown.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            {dashboardData?.category_breakdown.map((entry: any, index: number) => (
              <div key={entry.name} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Pending Approvals */}
        <div className="lg:col-span-7 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span className="w-2 h-8 bg-amber-400 rounded-full"></span>
              Waiting Approval
            </h2>
            <span className="px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-xl uppercase tracking-widest">
              {pendingVendors.length} PENDING
            </span>
          </div>
          
          {pendingVendors.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-950/50 rounded-[3rem] border border-slate-100 dark:border-slate-900">
              <div className="w-20 h-20 mx-auto mb-6 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500">
                <CheckCircleIcon className="h-10 w-10" strokeWidth={2} />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Perfect Queue</h4>
              <p className="text-xs text-slate-400 mt-2 font-medium">All vendors have been processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {pendingVendors.map(vendor => (
                <div key={vendor.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 group hover:-translate-y-2 transition-all duration-500">
                   <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase rounded-lg tracking-[0.2em]">{vendor.category}</span>
                  </div>
                  <h3 className="font-black text-xl text-slate-900 dark:text-white mb-3 tracking-tight">{vendor.shop_name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-8 leading-relaxed line-clamp-2">{vendor.description}</p>
                  <button
                    onClick={() => handleApprove(vendor.id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-xs uppercase tracking-widest"
                  >
                    Approve Entry
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Directory Column */}
        <div className="lg:col-span-5 space-y-8">
           <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
              Vendor Registry
            </h2>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-50 dark:divide-slate-800">
                <thead className="bg-slate-50/50 dark:bg-slate-950/50">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {vendors.map(vendor => (
                    <tr key={vendor.id} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-900/10 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{vendor.shop_name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{vendor.category}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 inline-flex text-[8px] font-black rounded-xl uppercase tracking-widest ${vendor.is_approved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                          {vendor.is_approved ? 'Active' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
