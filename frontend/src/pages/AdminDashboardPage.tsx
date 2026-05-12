import React, { useEffect, useState } from 'react';
import { getAllVendorsAdmin, approveVendor, rejectVendor, getAdminDashboard, getAllUsersAdmin, deactivateUser, activateUser } from '../api/endpoints';
import type { Vendor } from '../types';
import { Pagination } from '../components/Pagination';
import {
  CheckCircleIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#ea580c', '#c2410c', '#9a3412'];

type AdminTab = 'overview' | 'vendors' | 'users';

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vendorPage, setVendorPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, dRes, uRes] = await Promise.all([
        getAllVendorsAdmin(),
        getAdminDashboard(),
        getAllUsersAdmin(),
      ]);
      setVendors(vRes.data);
      setDashboardData(dRes.data);
      setUsers(uRes.data);
    } catch (err) {
      setError('Failed to fetch dashboard data. Check your admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveVendor(id);
      setVendors(vendors.map(v => v.id === id ? { ...v, is_approved: true } : v));
    } catch { alert('Failed to approve vendor'); }
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Are you sure you want to reject this vendor?')) return;
    try {
      await rejectVendor(id);
      setVendors(vendors.filter(v => v.id !== id));
    } catch { alert('Failed to reject vendor'); }
  };

  const handleToggleUser = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateUser(userId);
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: false } : u));
      } else {
        await activateUser(userId);
        setUsers(users.map(u => u.id === userId ? { ...u, is_active: true } : u));
      }
    } catch { alert('Failed to update user status'); }
  };

  const pendingVendors = vendors.filter(v => !v.is_approved);
  const approvedVendors = vendors.filter(v => v.is_approved);
  const stats = dashboardData?.stats;

  const statCards = [
    { label: 'Total Users', value: stats?.total_users ?? '—', icon: UsersIcon, color: 'orange' },
    { label: 'Vendors', value: stats?.total_vendors ?? '—', icon: BuildingStorefrontIcon, color: 'amber' },
    { label: 'Total Orders', value: stats?.total_orders ?? '—', icon: ShoppingCartIcon, color: 'orange' },
    { label: 'Revenue', value: stats?.total_revenue != null ? `₦${Number(stats.total_revenue).toLocaleString()}` : '—', icon: CurrencyDollarIcon, color: 'amber' },
  ];

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'vendors', label: 'Vendors', count: pendingVendors.length > 0 ? pendingVendors.length : undefined },
    { id: 'users', label: 'Users' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
          <ArrowPathIcon className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
        <p className="text-xs font-black text-orange-600 uppercase tracking-[0.3em] animate-pulse">Loading Admin Console...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-2 block">System Administration</span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Platform Console</h1>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border-2 border-orange-100 text-xs font-black text-slate-600 hover:border-orange-500 hover:text-orange-600 transition-all self-start sm:self-auto"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-red-50 border-2 border-red-100 text-red-700 rounded-2xl font-bold text-sm flex items-center gap-3">
          <XCircleIcon className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 bg-orange-50/50 p-1.5 rounded-2xl w-fit border-2 border-orange-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'text-slate-500 hover:text-orange-600'
            }`}
          >
            {tab.label}
            {tab.count != null && (
              <span className={`w-5 h-5 rounded-full text-[9px] flex items-center justify-center font-black ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-orange-600 text-white'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-white rounded-[2rem] border-2 border-orange-50 p-6 sm:p-8 shadow-sm hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-5 group-hover:scale-110 transition-transform">
                  <stat.icon className="h-6 w-6" strokeWidth={2.5} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
            <div className="lg:col-span-3 bg-white p-6 sm:p-10 rounded-[2.5rem] border-2 border-orange-50 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Order Velocity</h3>
                <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-[9px] font-black rounded-xl uppercase tracking-widest border border-orange-100">Last 7 Days</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData?.daily_trends ?? []}>
                    <defs>
                      <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fff7ed" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false}
                      tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })} dy={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(249,115,22,0.25)', backgroundColor: '#1e293b', color: '#fff', padding: '12px' }}
                      itemStyle={{ color: '#fb923c', fontWeight: '900', fontSize: '12px' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: '700' }} />
                    <Area type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={3} fill="url(#orangeGrad)"
                      dot={false} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: '#f97316' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 sm:p-10 rounded-[2.5rem] border-2 border-orange-50 shadow-sm">
              <h3 className="text-lg font-black text-slateate-900 mb-8 tracking-tight">Market Mix</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dashboardData?.category_breakdown ?? []} cx="50%" cy="50%"
                      innerRadius={50} outerRadius={75} paddingAngle={6} dataKey="value" stroke="none" cornerRadius={8}>
                      {(dashboardData?.category_breakdown ?? []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {(dashboardData?.category_breakdown ?? []).map((entry: any, index: number) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending approvals quick-view */}
          {pendingVendors.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <BuildingStorefrontIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-amber-900">{pendingVendors.length} vendor{pendingVendors.length > 1 ? 's' : ''} awaiting approval</p>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Action required</p>
                </div>
              </div>
              <button onClick={() => setActiveTab('vendors')}
                className="px-5 py-2.5 bg-amber-500 text-white text-xs font-black rounded-xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30 active:scale-95">
                Review Now →
              </button>
            </div>
          )}
        </>
      )}

      {/* ── VENDORS TAB ── */}
      {activeTab === 'vendors' && (
        <div className="space-y-10">
          {/* Pending */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <span className="w-1.5 h-7 bg-amber-400 rounded-full" />
                Awaiting Approval
              </h2>
              <span className="px-4 py-1.5 bg-amber-50 text-amber-600 text-[9px] font-black rounded-xl uppercase tracking-widest border border-amber-100">
                {pendingVendors.length} Pending
              </span>
            </div>

            {pendingVendors.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-orange-50">
                <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">All caught up! No pending vendors.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {pendingVendors.map(vendor => (
                  <div key={vendor.id} className="bg-white p-6 rounded-[2rem] border-2 border-orange-50 hover:border-orange-200 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all group">
                    <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-[8px] font-black uppercase tracking-widest rounded-lg mb-4 border border-orange-100">
                      {vendor.category}
                    </span>
                    <h3 className="font-black text-lg text-slate-900 mb-2 tracking-tight">{vendor.shop_name}</h3>
                    <p className="text-slate-400 text-xs font-bold mb-6 leading-relaxed line-clamp-2">{vendor.description}</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(vendor.id)}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-orange-600/30 active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <CheckCircleIcon className="w-4 h-4" />Approve
                      </button>
                      <button onClick={() => handleReject(vendor.id)}
                        className="flex-1 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 font-black py-3 rounded-xl transition-all border-2 border-red-100 hover:border-red-200 active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <XCircleIcon className="w-4 h-4" />Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Vendors Table */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <span className="w-1.5 h-7 bg-orange-600 rounded-full" />
                Vendor Registry
              </h2>
              <span className="px-4 py-1.5 bg-orange-50 text-orange-600 text-[9px] font-black rounded-xl uppercase tracking-widest border border-orange-100">
                {vendors.length} Total
              </span>
            </div>
            <div className="bg-white rounded-[2rem] border-2 border-orange-50 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-orange-50">
                  <thead className="bg-orange-50/50">
                    <tr>
                      {['Shop Name', 'Category', 'Location', 'Status'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-50">
                    {vendors.slice((vendorPage - 1) * ITEMS_PER_PAGE, vendorPage * ITEMS_PER_PAGE).map(vendor => (
                      <tr key={vendor.id} className="hover:bg-orange-50/20 transition-colors">
                        <td className="px-6 py-5 font-black text-sm text-slate-900">{vendor.shop_name}</td>
                        <td className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{vendor.category}</td>
                        <td className="px-6 py-5 text-xs font-bold text-slate-500">{vendor.location || '—'}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1.5 inline-flex text-[8px] font-black rounded-lg uppercase tracking-widest ${vendor.is_approved ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                            {vendor.is_approved ? 'Active' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-orange-50 bg-orange-50/30">
                <Pagination currentPage={vendorPage} totalPages={Math.max(1, Math.ceil(vendors.length / ITEMS_PER_PAGE))}
                  onPageChange={setVendorPage} totalItems={vendors.length} itemsPerPage={ITEMS_PER_PAGE} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <span className="w-1.5 h-7 bg-orange-600 rounded-full" />
              User Management
            </h2>
            <span className="px-4 py-1.5 bg-orange-50 text-orange-600 text-[9px] font-black rounded-xl uppercase tracking-widest border border-orange-100">
              {users.length} Users
            </span>
          </div>
          <div className="bg-white rounded-[2rem] border-2 border-orange-50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-orange-50">
                <thead className="bg-orange-50/50">
                  <tr>
                    {['Name', 'Email', 'Role', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-50">
                  {users.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE).map((user: any) => (
                    <tr key={user.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="px-6 py-5 font-black text-sm text-slate-900">{user.full_name}</td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-500">{user.email}</td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : user.role === 'vendor' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest border ${user.is_active !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                          {user.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUser(user.id, user.is_active !== false)}
                            className={`px-4 py-1.5 text-[9px] font-black rounded-lg uppercase tracking-wider transition-all border-2 active:scale-95 ${user.is_active !== false ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-emerald-600 border-emerald-100 hover:bg-emerald-50'}`}
                          >
                            {user.is_active !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-orange-50 bg-orange-50/30">
              <Pagination currentPage={userPage} totalPages={Math.max(1, Math.ceil(users.length / ITEMS_PER_PAGE))}
                onPageChange={setUserPage} totalItems={users.length} itemsPerPage={ITEMS_PER_PAGE} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
