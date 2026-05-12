import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProducts, resolveMediaUrl } from '../api/endpoints';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import type { Product } from '../types';
import { Pagination } from '../components/Pagination';
import LoginPromptModal from '../components/LoginPromptModal';

const CATEGORIES = ['All', 'Food', 'Drinks', 'Snacks', 'Groceries', 'Electronics', 'Fashion', 'Services', 'Other'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('q') || '';
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const ITEMS_PER_PAGE = 12;

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts().then((r) => r.data),
  });

  const filtered = allProducts.filter((p: Product) => {
    const matchesCategory = activeCategory === 'All' || p.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const price = p.price;
    const matchesMinPrice = !minPrice || price >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || price <= parseFloat(maxPrice);

    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedProducts = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
    const params: any = {};
    if (activeCategory !== 'All') params.category = activeCategory;
    if (searchQuery) params.q = searchQuery;
    setSearchParams(params);
  }, [activeCategory, searchQuery]);

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

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-8 pb-32">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-col">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Explore Items</h1>
          <p className="text-xs sm:text-sm font-black text-orange-600 uppercase tracking-widest mt-2">Find the best deals on campus</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96 group">
          <div className="absolute -inset-1 bg-orange-500 rounded-2xl blur-lg opacity-10 group-hover:opacity-20 transition duration-700"></div>
          <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-sm border-2 border-orange-100">
            <div className="flex items-center flex-1 px-3">
              <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-bold py-2 px-2 placeholder:text-slate-400 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-6 py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 border-2 ${
                activeCategory === cat
                  ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-600/30'
                  : 'bg-white text-slate-600 border-orange-100 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Price Range Filter */}
        <div className="flex flex-wrap items-center gap-4 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3" />
            </svg>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Price Range</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min ₦"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24 px-3 py-1.5 rounded-xl border border-orange-100 focus:border-orange-500 outline-none text-xs font-bold text-slate-700 bg-white"
            />
            <span className="text-slate-300">—</span>
            <input
              type="number"
              placeholder="Max ₦"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24 px-3 py-1.5 rounded-xl border border-orange-100 focus:border-orange-500 outline-none text-xs font-bold text-slate-700 bg-white"
            />
            {(minPrice || maxPrice) && (
              <button
                onClick={() => { setMinPrice(''); setMaxPrice(''); }}
                className="ml-2 text-[10px] font-black text-orange-600 uppercase tracking-widest hover:bg-orange-100 px-2 py-1 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-slate-50 p-4 animate-pulse flex items-center gap-4">
              <div className="w-20 h-20 bg-slate-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-4 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-orange-50 shadow-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-orange-50 flex items-center justify-center">
            <svg className="w-10 h-10 text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No items found</h3>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Try a different search or category</p>
        </div>
      ) : (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {paginatedProducts.map((product: Product) => {
              const imgUrl = resolveMediaUrl(product.image_url);
              return (
                <motion.div
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  className="bg-white rounded-2xl border-2 border-orange-50 p-3 sm:p-4 hover:border-orange-200 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all cursor-pointer group flex items-center gap-4"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Square thumbnail */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-orange-50 border border-orange-100 shrink-0 relative">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-orange-200">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    {/* Stock Badge Overlay */}
                    {product.stock_quantity <= 0 ? (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-md shadow-lg">Out of Stock</span>
                      </div>
                    ) : product.stock_quantity < 5 ? (
                      <div className="absolute top-1 left-1">
                        <span className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded shadow-lg">Low Stock</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-1">
                    <p className="text-sm sm:text-base font-black text-slate-900 truncate group-hover:text-orange-600 transition-colors">{product.name}</p>
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{product.category}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-base sm:text-lg font-black text-orange-600">₦{product.price.toLocaleString()}</p>
                      <button
                        onClick={(e) => handleQuickAddToCart(product, e)}
                        disabled={product.stock_quantity <= 0}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90 ${
                          product.stock_quantity <= 0 
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                            : 'bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        </>
      )}
      <LoginPromptModal isOpen={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </div>
  );
}
