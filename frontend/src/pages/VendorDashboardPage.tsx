import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getMyVendor, getVendorOrders, getVendorProducts, updateOrderStatus, deleteProduct, resolveMediaUrl } from '../api/endpoints';
import type { Vendor, Order, Product } from '../types';
import ProductModal from '../components/ProductModal';
import { Pagination } from '../components/Pagination';
import { PencilSquareIcon, TrashIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const VendorDashboardPage: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const fetchProducts = async (vendorId: string) => {
    try {
      const pRes = await getVendorProducts(vendorId, { include_unavailable: true });
      setProducts(pRes.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const oRes = await getVendorOrders();
      setOrders(oRes.data);
    } catch (err) {
      console.error("Error fetching orders", err);
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
          await fetchOrders();
          await fetchProducts(myVendor.id);
        }
      } catch (err) {
        console.error("Dashboard error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Auto-refresh orders every 30s
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
      // Optional: Visual confirmation
    } catch (err) {
      alert("Failed to update order status");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
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

  if (loading) return <div className="text-center py-32 text-orange-600 font-black uppercase tracking-[0.3em] animate-pulse">Initializing Console...</div>;

  if (!vendor) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Vendor Account Not Found</h2>
        <p className="text-slate-500 font-bold">Please contact administration to resolve this.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      {!vendor.is_approved && (
        <div className="mb-10 bg-amber-50 border-2 border-amber-200 p-6 rounded-4xl flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Pending Approval</h4>
            <p className="text-sm text-amber-700 font-bold leading-relaxed">
              Your shop is currently under review. You'll be visible on the marketplace once an administrator approves your account.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.4em] mb-2 block px-1">Vendor Command Center</span>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Dashboard — {vendor.shop_name}
          </h2>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 text-xs font-black text-slate-700 hover:border-orange-600 transition-all uppercase tracking-widest">Settings</button>
          <button className="px-6 py-4 rounded-2xl bg-orange-600 text-white shadow-xl shadow-orange-600/30 text-xs font-black hover:bg-orange-700 transition-all active:scale-95 uppercase tracking-widest">Support</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        {/* Orders Column */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-orange-500/5 p-8 sm:p-10 overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
              <span className="w-2 h-8 bg-orange-600 rounded-full"></span>
              Recent Orders
            </h3>
            <span className="px-4 py-2 bg-orange-50 text-orange-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-orange-100">
              {orders.length} TOTAL
            </span>
          </div>

          <div className="overflow-y-auto max-h-[700px] pr-2 scrollbar-hide">
            {orders.length === 0 ? (
              <div className="py-24 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200">
                  <ShoppingBagIcon className="w-10 h-10" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No incoming orders yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.slice((orderPage - 1) * ITEMS_PER_PAGE, orderPage * ITEMS_PER_PAGE).map(order => (
                  <div key={order.id} className="p-6 sm:p-8 rounded-[2rem] bg-slate-50/50 border-2 border-slate-50 group hover:border-orange-100 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-4 mb-3">
                          <p className="text-xs font-black text-orange-600 uppercase tracking-widest">#ORD-{order.id.slice(0,8)}</p>
                          <span className={`px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border-2 ${order.is_paid ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                            {order.is_paid ? 'Securely Paid' : 'Pending Payment'}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 truncate mb-2">{order.customer_name}</h4>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                          <p className="text-base font-black text-slate-900">₦{order.total_amount.toLocaleString()}</p>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                            {order.delivery_type === 'delivery' ? `DELIVER TO ${order.hostel_name}` : 'SHOP PICKUP'}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="block w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 pl-5 pr-12 text-[10px] font-black uppercase tracking-widest text-slate-700 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all cursor-pointer shadow-sm"
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
                <Pagination 
                  currentPage={orderPage}
                  totalPages={Math.ceil(orders.length / ITEMS_PER_PAGE)}
                  onPageChange={setOrderPage}
                  totalItems={orders.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </div>
        </div>

        {/* Inventory Column */}
        <div className="lg:col-span-5 bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-2xl shadow-orange-500/5 p-8 sm:p-10 overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4 tracking-tight">
              <span className="w-2 h-8 bg-orange-600 rounded-full"></span>
              Marketplace
            </h3>
            <button 
              onClick={handleAddProduct}
              className="p-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl shadow-xl shadow-orange-600/30 transition-all active:scale-90"
              title="Add New Product"
            >
              <PlusIcon className="h-6 w-6" strokeWidth={3} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[700px] pr-2 scrollbar-hide">
            {products.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Your shop is empty</p>
              </div>
            ) : (
              <div className="space-y-6">
                {products.slice((productPage - 1) * ITEMS_PER_PAGE, productPage * ITEMS_PER_PAGE).map(product => (
                  <div key={product.id} className="p-5 rounded-[2rem] bg-slate-50/50 border-2 border-slate-50 group hover:border-orange-100 transition-all duration-300">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm relative">
                        {product.image_url ? (
                          <img className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" src={resolveMediaUrl(product.image_url)} alt="" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-200">
                            <ShoppingBagIcon className="h-10 w-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-black text-slate-900 truncate mb-1 tracking-tight">{product.name}</p>
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3">₦{product.price.toLocaleString()} • {product.stock_quantity} UNIT</p>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${product.is_available ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {product.is_available ? 'In Market' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-400 hover:text-orange-600 hover:border-orange-600 transition-all"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-3 rounded-2xl bg-white border-2 border-slate-100 text-slate-400 hover:text-red-600 hover:border-red-600 transition-all"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <Pagination 
                  currentPage={productPage}
                  totalPages={Math.ceil(products.length / ITEMS_PER_PAGE)}
                  onPageChange={setProductPage}
                  totalItems={products.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
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
