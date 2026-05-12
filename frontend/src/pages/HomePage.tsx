import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { getVendors, getProducts, resolveMediaUrl } from '../api/endpoints';
import type { Vendor, Product } from '../types';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import LoginPromptModal from '../components/LoginPromptModal';
import { Pagination } from '../components/Pagination';
import heroFood from '../assets/hero-food.png';
import heroDelivery from '../assets/hero-delivery.jpg';

const CATEGORIES = ['All', 'Food', 'Drinks', 'Snacks', 'Groceries', 'Electronics', 'Fashion', 'Services', 'Other'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

const getCategoryIcon = (category: string) => {
  const key = category.toLowerCase();
  if (key.includes('food') || key.includes('bakery')) return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 3v12.5a4.5 4.5 0 109 0V3m-4.5 8.5V21" /></svg>
  );
  if (key.includes('drink') || key.includes('provision')) return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8l-1.5 10.5a2 2 0 01-2 1.5h-1a2 2 0 01-2-1.5L8 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10" /></svg>
  );
  if (key.includes('snack')) return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M5 11h14M6 15h12M7 19h10" /></svg>
  );
  if (key.includes('fashion') || key.includes('style') || key.includes('skincare')) return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 4l2 8h8l2-8M6 4h12" /><path strokeLinecap="round" strokeLinejoin="round" d="M10 16h4" /></svg>
  );
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  );
};

function VendorCard({ vendor }: { vendor: Vendor }) {
  const imageUrl = resolveMediaUrl(vendor.image_url);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className="group bg-white rounded-2xl sm:rounded-3xl border-2 border-orange-200 overflow-hidden shadow-md hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-400"
    >
      <Link to={`/vendor/${vendor.id}`} className="block">
        <div className="aspect-[4/3] relative overflow-hidden bg-orange-100">
          {imageUrl ? (
            <img src={imageUrl} alt={vendor.shop_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-amber-50">
              <div className="flex flex-col items-center gap-2 text-orange-600">
                {getCategoryIcon(vendor.category)}
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{vendor.category.split(' ')[0]}</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-white/95 text-orange-700 shadow-sm border border-orange-100">
              {vendor.category}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <h3 className="text-sm sm:text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors mb-1 sm:mb-2 line-clamp-1">
            {vendor.shop_name}
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-600 font-semibold line-clamp-2 mb-3 sm:mb-5 min-h-[28px] sm:min-h-[32px]">
            {vendor.description}
          </p>
          <div className="pt-3 sm:pt-5 border-t-2 border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              <svg className="w-3.5 h-3.5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="line-clamp-1">{vendor.location}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-all shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { data: popularProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['popularProducts'],
    queryFn: () => getProducts().then((r) => r.data),
  });

  const availableProducts = (popularProducts as Product[]).filter((p: Product) => p.is_available !== false).slice(0, 10);

  const handleQuickAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    const currentVendorId = cartItems[0]?.vendorId;
    if (currentVendorId && currentVendorId !== product.vendor_id) {
      if (window.confirm('Cart has items from another shop. Clear cart to add this item?')) {
        useCartStore.getState().clearCart();
      } else return;
    }
    addItem({ productId: product.id, vendorId: product.vendor_id, name: product.name, price: product.price, quantity: 1, imageUrl: product.image_url || '' });
  };

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => getVendors().then((r) => r.data),
  });

  const filtered = vendors.filter((v: Vendor) => {
    const matchesCategory = activeCategory === 'All' || v.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = !searchQuery || v.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase()) || v.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedVendors = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [activeCategory, searchQuery, vendors.length]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  return (
    <div className="pb-20 overflow-x-hidden -mx-3 sm:mx-0">
      {/* Hero Section */}
      <section className="relative min-h-[400px] sm:min-h-[550px] lg:min-h-[700px] flex items-center pt-10 sm:pt-20 pb-10 sm:pb-20 px-4 sm:px-8 overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem] bg-white mb-8 sm:mb-16 lg:mb-24 border-2 border-orange-200 shadow-2xl shadow-orange-500/20 mx-3 sm:mx-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-orange-500/15 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], x: [0, 100, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-amber-500/12 rounded-full blur-[100px]"
        />

        <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center relative z-10 w-full">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-8 rounded-full bg-orange-100 text-orange-700 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] border-2 border-orange-300">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-orange-600 animate-pulse"></span>
              Campus Exclusive
            </motion.div>

            <h1 className="text-3xl sm:text-5xl lg:text-7xl xl:text-8xl font-black text-slate-900 mb-4 sm:mb-8 leading-[0.95] tracking-tight">
              Food & Items, <br />
              <span className="text-transparent bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text">in your hands.</span>
            </h1>

            <p className="text-slate-600 text-sm sm:text-lg lg:text-xl mb-6 sm:mb-10 max-w-lg font-semibold leading-relaxed">
              Deliver to your hostel or pick up in minutes. Campus commerce at its finest.
            </p>

            {/* Search Bar */}
            <div className="relative group max-w-xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl sm:rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition duration-700"></div>
              <div className="relative flex items-center bg-white rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-xl shadow-orange-500/15 border-2 border-orange-200">
                <div className="flex items-center flex-1 px-3 sm:px-6">
                  <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search vendors, food, drinks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-bold py-2.5 sm:py-4 px-3 placeholder:text-slate-400 text-sm sm:text-base"
                  />
                </div>
                <button className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-black py-2.5 sm:py-3.5 px-5 sm:px-8 rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-orange-600/40 active:scale-95 text-xs sm:text-sm shrink-0">
                  Search
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Visuals — hidden on small mobile */}
          <div className="relative h-[200px] sm:h-[350px] lg:h-[500px] w-full hidden sm:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: -5 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0 w-[55%] sm:w-[240px] lg:w-72 h-[220px] sm:h-[300px] lg:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-10 hover:rotate-0 hover:shadow-orange-500/30 transition-all duration-500"
            >
              <img src={heroDelivery} alt="Swift Delivery" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                <p className="text-white font-black text-base sm:text-xl tracking-tight">Swift Delivery</p>
                <p className="text-orange-300 font-black text-[7px] sm:text-[9px] uppercase tracking-widest mt-1">Across Campus</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
              animate={{ opacity: 1, scale: 1, rotate: 10 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-0 left-0 w-[50%] sm:w-[220px] lg:w-64 h-[180px] sm:h-[250px] lg:h-[350px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-20 hover:scale-105 hover:shadow-orange-600/40 transition-all duration-500 cursor-pointer"
            >
              <img src={heroFood} alt="Food" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                <p className="text-white font-black text-base sm:text-xl tracking-tight">Fresh Eats</p>
                <p className="text-orange-300 font-black text-[7px] sm:text-[9px] uppercase tracking-widest mt-1">Student Faves</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-white/95 backdrop-blur p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-2 border-2 border-white shadow-xl shadow-orange-500/20"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-600/40 shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none">Fast</p>
                <p className="text-[6px] sm:text-[8px] font-black text-orange-600 uppercase tracking-[0.2em] mt-0.5">Campus Delivery</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}
        className="mb-10 sm:mb-20 px-3 sm:px-0"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Explore Markets</h2>
            <p className="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-2">What do You Need?</p>
          </div>
          <div className="h-1 flex-1 bg-gradient-to-r from-orange-300 to-transparent hidden md:block mx-8 rounded-full"></div>
        </div>

        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat} variants={itemVariants} whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-400 border-2 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/40 scale-105'
                  : 'bg-white text-slate-600 border-orange-200 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 shadow-sm'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ─── Popular Items Section ─── */}
      <section className="mb-10 sm:mb-20 px-3 sm:px-0">
        <div className="flex items-center justify-between mb-5 sm:mb-8">
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Popular Items</h2>
            <p className="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-2">Trending on campus right now</p>
          </div>
          <Link to="/products" className="text-[9px] sm:text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-colors shrink-0 ml-4 hidden sm:block">
            See All &rarr;
          </Link>
        </div>

        {productsLoading ? (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="shrink-0 w-[260px] sm:w-[300px] bg-white rounded-xl border-2 border-slate-100 animate-pulse p-3 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded-lg w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : availableProducts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-slate-100">
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No items available right now</p>
          </div>
        ) : (
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            {availableProducts.map((product: Product) => {
              const imgUrl = resolveMediaUrl(product.image_url);
              return (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.97 }}
                  className="shrink-0 w-[240px] sm:w-[280px] bg-white rounded-xl border-2 border-orange-100 hover:border-orange-300 shadow-sm hover:shadow-md hover:shadow-orange-500/10 transition-all cursor-pointer group"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="flex items-center gap-3 p-3">
                    {/* Square thumbnail — like a profile picture */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-orange-50 border border-orange-100 shrink-0 relative">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-orange-300">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                      {/* Stock Badge Overlay */}
                      {product.stock_quantity <= 0 ? (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-red-500 text-white text-[7px] font-black uppercase tracking-tighter px-1 py-0.5 rounded shadow-lg">Out of Stock</span>
                        </div>
                      ) : product.stock_quantity < 5 ? (
                        <div className="absolute top-0.5 left-0.5">
                          <span className="bg-amber-500 text-white text-[6px] font-black uppercase tracking-tighter px-1 py-0.5 rounded shadow-lg">Low Stock</span>
                        </div>
                      ) : null}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-black text-slate-900 truncate group-hover:text-orange-600 transition-colors">{product.name}</p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">{product.category}</p>
                      <p className="text-sm sm:text-base font-black text-orange-600 mt-1">₦{product.price.toLocaleString()}</p>
                    </div>

                    {/* Add button */}
                    <button
                      onClick={(e) => handleQuickAddToCart(product, e)}
                      disabled={product.stock_quantity <= 0}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all shrink-0 shadow-sm active:scale-90 ${
                        product.stock_quantity <= 0 
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                          : 'bg-orange-100 hover:bg-orange-600 text-orange-600 hover:text-white'
                      }`}
                      title="Add to cart"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Vendors List */}
      <section className="pb-20 px-3 sm:px-0">
        <div className="flex items-center justify-between mb-6 sm:mb-10">
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Popular Markets</h2>
            <p className="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-widest mt-1 sm:mt-2">Top student favorites</p>
          </div>
          <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-100 to-amber-50 text-orange-700 text-[9px] sm:text-[10px] font-black rounded-xl sm:rounded-2xl border-2 border-orange-300 shadow-sm shrink-0">
            {filtered.length} SHOPS
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl sm:rounded-3xl bg-white border-2 border-orange-100 animate-pulse overflow-hidden shadow-sm">
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="p-4 sm:p-6 space-y-3">
                  <div className="h-5 bg-slate-100 rounded-xl w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 sm:py-32 bg-white rounded-2xl sm:rounded-3xl border-2 border-orange-100 shadow-sm">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-6 rounded-2xl bg-orange-100 flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">No vendors found</h3>
            <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">Try adjusting your filters</p>
          </motion.div>
        ) : (
          <motion.div key={currentPage} initial="hidden" animate="visible" variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-10">
            {paginatedVendors.map((vendor: Vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </motion.div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
          totalItems={filtered.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </section>
      <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </div>
  );
}
