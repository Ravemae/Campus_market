import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getMyVendor, getVendorOrders, getVendorProducts, updateOrderStatus, deleteProduct } from '../api/endpoints';
import type { Vendor, Order, Product } from '../types';
import ProductModal from '../components/ProductModal';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const VendorDashboardPage: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async (vendorId: number) => {
    try {
      const pRes = await getVendorProducts(vendorId, { include_unavailable: true });
      setProducts(pRes.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || user.role !== 'vendor') return;

        const vRes = await getMyVendor();
        const myVendor = vRes.data;
        
        if (myVendor) {
          setVendor(myVendor);
          const oRes = await getVendorOrders(myVendor.id);
          setOrders(oRes.data);
          await fetchProducts(myVendor.id);
        }
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        setProducts(products.filter(p => p.id !== productId));
      } catch (err) {
        alert("Failed to delete product");
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-center py-32 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading dashboard...</div>;

  if (!vendor) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Vendor Account Not Found</h2>
        <p className="text-slate-500 font-medium">Please contact administration to resolve this.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!vendor.is_approved && (
        <div className="mb-10 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-900/20 p-6 rounded-[2rem] flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-900 dark:text-amber-100 uppercase tracking-widest mb-1">Pending Approval</h4>
            <p className="text-sm text-amber-700/80 dark:text-amber-200/60 font-medium leading-relaxed">
              Your shop is currently under review. You'll be visible on the marketplace once an administrator approves your account.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-2 block">Vendor Command Center</span>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Dashboard — {vendor.shop_name}
          </h2>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-black text-slate-600 dark:text-slate-400 hover:border-indigo-600 transition-all">Settings</button>
          <button className="px-6 py-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 text-sm font-black hover:bg-indigo-700 transition-all active:scale-95">Support</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Orders Column */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              Recent Orders
            </h3>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-widest">
              {orders.length} TOTAL
            </span>
          </div>

          <div className="overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
            {orders.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                  <ShoppingBagIcon className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="p-6 rounded-[2rem] bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-900 group hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">#ORD-{order.id}</p>
                          <span className={`px-3 py-1 text-[10px] font-black rounded-xl uppercase tracking-wider ${order.is_paid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                            {order.is_paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 dark:text-white truncate mb-1">{order.customer_name}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <p className="text-sm font-bold text-slate-500">₦{order.total_amount.toLocaleString()}</p>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {order.delivery_type === 'delivery' ? `TO ${order.hostel_name}` : 'PICKUP'}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="block w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-2.5 pl-4 pr-10 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:ring-0 transition-all cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inventory Column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              Inventory
            </h3>
            <button 
              onClick={handleAddProduct}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-90"
              title="Add New Product"
            >
              <PlusIcon className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[600px] pr-2 scrollbar-hide">
            {products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No products listed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map(product => (
                  <div key={product.id} className="p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-900 group hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 flex-shrink-0 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                        {product.image_url ? (
                          <img className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" src={product.image_url} alt="" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                            <ShoppingBagIcon className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate mb-1">{product.name}</p>
                        <p className="text-xs font-black text-indigo-600/80 dark:text-indigo-400/80 tracking-widest">₦{product.price.toLocaleString()} • {product.stock_quantity} IN STOCK</p>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${product.is_available ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-slate-200 text-slate-500'}`}>
                            {product.is_available ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-600 transition-all"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSuccess={() => vendor && fetchProducts(vendor.id)}
      />
    </div>
  );
};

export default VendorDashboardPage;
