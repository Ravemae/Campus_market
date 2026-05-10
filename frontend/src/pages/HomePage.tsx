import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { getVendors, resolveMediaUrl } from '../api/endpoints';
import type { Vendor } from '../types';
import { Pagination } from '../components/Pagination';
import heroFood from '../assets/hero-food.png';
import heroLogistics from '../assets/hero-logistics.png';

const CATEGORIES = ['All', 'Food', 'Drinks', 'Snacks', 'Groceries', 'Electronics', 'Fashion', 'Services', 'Other'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
};

const categoryIcons: Record<string, React.ReactElement> = {
  food: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v12.5a4.5 4.5 0 109 0V3m-4.5 8.5V21" />
    </svg>
  ),
  drinks: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3h8l-1.5 10.5a2 2 0 01-2 1.5h-1a2 2 0 01-2-1.5L8 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10" />
    </svg>
  ),
  snacks: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M5 11h14M6 15h12M7 19h10" />
    </svg>
  ),
  groceries: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10l1-5h10l1 5M6 10h12l1 10H5L6 10z" />
    </svg>
  ),
  electronics: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8v10H8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v2" />
    </svg>
  ),
  fashion: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4l2 8h8l2-8M6 4h12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 16h4" />
    </svg>
  ),
  services: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
    </svg>
  ),
  other: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
    </svg>
  ),
};

const getCategoryIcon = (category: string) => {
  const key = category.toLowerCase();
  if (key.includes('food')) return categoryIcons.food;
  if (key.includes('drink')) return categoryIcons.drinks;
  if (key.includes('snack')) return categoryIcons.snacks;
  if (key.includes('grocery')) return categoryIcons.groceries;
  if (key.includes('elect')) return categoryIcons.electronics;
  if (key.includes('fashion') || key.includes('style')) return categoryIcons.fashion;
  if (key.includes('service')) return categoryIcons.services;
  return categoryIcons.other;
};

function VendorCard({ vendor }: { vendor: Vendor }) {
  const imageUrl = resolveMediaUrl(vendor.image_url);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: [0.33, 1, 0.68, 1] } }}
      className="group bg-white rounded-3xl border-2 border-orange-200 overflow-hidden shadow-md hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-400"
    >
      <Link to={`/vendor/${vendor.id}`} className="block">
        {/* Image Wrapper */}
        <div className="aspect-4/3 relative overflow-hidden bg-orange-100">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={vendor.shop_name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22250%22 viewBox=%220 0 400 250%22%3E%3Crect width=%22400%22 height=%22250%22 fill=%22%23FFF7ED%22/%3E%3Ctext x=%2220%22 y=%22135%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%23FF6B00%22%3EImage+unavailable%3C/text%3E%3C/svg%3E';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-100 to-amber-50">
              <div className="flex flex-col items-center gap-3 text-orange-600">
                {getCategoryIcon(vendor.category)}
                <span className="text-xs font-black uppercase tracking-[0.3em]">{vendor.category.split(' ')[0]}</span>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/90 text-orange-600 flex items-center justify-center shadow-lg shadow-orange-200/70">
              {getCategoryIcon(vendor.category)}
            </div>
            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-white/95 text-orange-700 shadow-sm border border-orange-100">
              {vendor.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors mb-2">
            {vendor.shop_name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold line-clamp-2 mb-5 min-h-10">
            {vendor.description}
          </p>
          
          <div className="pt-5 border-t-2 border-orange-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="line-clamp-1">{vendor.location}</span>
            </div>
            <motion.div 
              whileHover={{ x: 5, backgroundColor: '#FF6B00' }}
              className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:text-white transition-all duration-300 flex-shrink-0"
            >
              {getCategoryIcon(vendor.category)}
            </motion.div>
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

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => getVendors().then((r) => r.data),
  });

  const filtered = vendors.filter((v: Vendor) => {
    const matchesCategory = activeCategory === 'All' || v.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery || v.shop_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedVendors = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, vendors.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[650px] lg:min-h-[750px] flex items-center pt-20 pb-20 px-4 sm:px-8 overflow-hidden rounded-3xl sm:rounded-5xl bg-white mb-16 sm:mb-24 border-2 border-orange-200 shadow-2xl shadow-orange-500/20">
        {/* Abstract Background Elements - Bright Vibrant Sensation */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-orange-500/15 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            x: [0, 100, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-amber-500/12 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            y: [0, -50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-white rounded-full blur-[100px] opacity-50" 
        />

        <div className="section-container grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-orange-100 text-orange-700 text-[9px] font-black uppercase tracking-[0.3em] border-2 border-orange-300"
            >
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse-slow"></span>
              Campus Exclusive
            </motion.div>
            
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-slate-900 mb-6 sm:mb-8 leading-[0.95] tracking-tight">
              Food & Items, <br />
              <span className="text-transparent bg-linear-to-r from-orange-600 to-orange-500 bg-clip-text">in your hands.</span>
            </h1>
            
            <p className="text-slate-600 text-lg sm:text-xl mb-10 max-w-lg font-semibold leading-relaxed">
              Deliver to your hostel or pick up in minutes. Experience campus commerce at its finest with everything students need.
            </p>

            {/* Search Bar */}
            <div className="relative group max-w-xl">
              <div className="absolute -inset-1 bg-linear-to-r from-orange-500 to-amber-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition duration-700"></div>
              <div className="relative flex items-center bg-white rounded-3xl p-2 shadow-2xl shadow-orange-500/20 border-2 border-orange-200">
                <div className="flex items-center flex-1 px-6">
                  <svg className="w-6 h-6 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search snacks, food, tech..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-bold py-4 px-4 placeholder:text-slate-400 text-base sm:text-lg"
                  />
                </div>
                <button className="bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-black py-3.5 px-8 rounded-2xl transition-all shadow-xl shadow-orange-600/40 active:scale-95 text-sm sm:text-base">
                  Search
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Visuals */}
          <div className="relative h-[350px] sm:h-[450px] lg:h-[550px] w-full">
            {/* Logistics Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10, x: 20 }}
              animate={{ opacity: 1, scale: 1, rotate: -5, x: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 right-0 w-[55%] sm:w-[260px] lg:w-72 h-[280px] sm:h-[380px] lg:h-[450px] rounded-3xl sm:rounded-4xl overflow-hidden shadow-2xl border-4 border-white z-10 hover:rotate-0 hover:shadow-orange-500/30 transition-all duration-500"
            >
              <img src={heroLogistics} alt="Logistics" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8">
                <p className="text-white font-black text-lg sm:text-2xl tracking-tight">Swift Delivery</p>
                <p className="text-orange-300 font-black text-[8px] sm:text-[9px] uppercase tracking-widest mt-1">Across Campus</p>
              </div>
            </motion.div>

            {/* Food Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 10, x: -20 }}
              animate={{ opacity: 1, scale: 1, rotate: 10, x: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-0 left-0 w-[52%] sm:w-[240px] lg:w-72 h-[220px] sm:h-[320px] lg:h-[400px] rounded-3xl sm:rounded-4xl overflow-hidden shadow-2xl border-4 border-white z-20 hover:z-50 hover:scale-105 hover:shadow-orange-600/40 transition-all duration-500 cursor-pointer"
            >
              <img src={heroFood} alt="Food" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8">
                <p className="text-white font-black text-lg sm:text-2xl tracking-tight">Fresh Eats</p>
                <p className="text-orange-300 font-black text-[8px] sm:text-[9px] uppercase tracking-widest mt-1">Student Faves</p>
              </div>
            </motion.div>

            {/* Floating UI Element - Status Badge */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-white/95 backdrop-blur p-4 sm:p-5 rounded-2xl flex items-center gap-3 border-2 border-white shadow-xl shadow-orange-500/20"
            >
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-linear-to-br from-orange-600 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-600/40 flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">Fast</p>
                <p className="text-[7px] sm:text-[8px] font-black text-orange-600 uppercase tracking-[0.2em] mt-1">Campus Delivery</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        className="mb-20 section-container px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex flex-col">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Explore Markets</h2>
            <p className="text-[11px] sm:text-xs font-black text-orange-600 uppercase tracking-[0.3em] mt-2">What are you craving?</p>
          </div>
          <div className="h-1 flex-1 bg-linear-to-r from-orange-300 to-transparent hidden md:block mx-8 rounded-full"></div>
        </div>
        
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              variants={itemVariants}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-400 border-2 ${
                activeCategory === cat
                  ? 'bg-linear-to-r from-orange-600 to-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/40 scale-105'
                  : 'bg-white text-slate-600 border-orange-200 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 shadow-md hover:shadow-orange-500/20'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Vendors List */}
      <section className="section-container pb-20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex flex-col">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Popular Markets</h2>
            <p className="text-[11px] sm:text-xs font-black text-orange-600 uppercase tracking-widest mt-2">Top student favorites</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-linear-to-r from-orange-100 to-amber-50 text-orange-700 text-[10px] font-black rounded-2xl border-2 border-orange-300 shadow-sm">
              {filtered.length} SHOPS
            </span>
          </div>
        </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-3xl bg-white border-2 border-orange-100 animate-pulse overflow-hidden shadow-sm">
              <div className="aspect-4/3 bg-slate-100" />
              <div className="p-6 sm:p-8 space-y-4">
                <div className="h-7 bg-slate-100 rounded-xl w-3/4" />
                <div className="h-4 bg-slate-100 rounded-xl w-full" />
                <div className="h-4 bg-slate-100 rounded-xl w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-32 bg-white rounded-3xl border-2 border-orange-100 shadow-sm"
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-8 rounded-2xl bg-orange-100 flex items-center justify-center">
            <svg className="w-12 h-12 sm:w-14 sm:h-14 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3 tracking-tight">No vendors found</h3>
          <p className="text-slate-600 font-bold text-sm uppercase tracking-widest">Try adjusting your filters</p>
        </motion.div>
      ) : (
        <motion.div 
          key={currentPage}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
        >
          {paginatedVendors.map((vendor: Vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </motion.div>
      )}

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 600, behavior: 'smooth' });
        }}
        totalItems={filtered.length}
        itemsPerPage={ITEMS_PER_PAGE}
      />
      </section>
    </div>
  );
}
