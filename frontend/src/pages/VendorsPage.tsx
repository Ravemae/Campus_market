import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { getVendors, resolveMediaUrl } from '../api/endpoints';
import type { Vendor } from '../types';
import { Pagination } from '../components/Pagination';

const CATEGORIES = ['All', 'Food', 'Drinks', 'Snacks', 'Groceries', 'Electronics', 'Fashion', 'Services', 'Other'];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100, damping: 12 } },
};

export default function VendorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('q') || '';
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const { data: allVendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => getVendors().then((r) => r.data),
  });

  const filtered = allVendors.filter((v: Vendor) => {
    const matchesCategory = activeCategory === 'All' || v.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = !searchQuery || v.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) || v.category.toLowerCase().includes(searchQuery.toLowerCase()) || v.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedVendors = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
    const params: any = {};
    if (activeCategory !== 'All') params.category = activeCategory;
    if (searchQuery) params.q = searchQuery;
    setSearchParams(params);
  }, [activeCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-8 pb-32">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex flex-col">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Our Vendors</h1>
          <p className="text-xs sm:text-sm font-black text-orange-600 uppercase tracking-widest mt-2">Discover the best shops on campus</p>
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
                placeholder="Search shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-slate-900 font-bold py-2 px-2 placeholder:text-slate-400 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-6 scrollbar-hide mb-8">
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

      {/* Vendors Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-slate-50 p-4 animate-pulse">
              <div className="aspect-[4/3] bg-slate-100 rounded-xl mb-4" />
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
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
          <h3 className="text-xl font-black text-slate-900 mb-2">No shops found</h3>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Try a different search or category</p>
        </div>
      ) : (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-10"
          >
            {paginatedVendors.map((vendor: Vendor) => {
              const imgUrl = resolveMediaUrl(vendor.image_url);
              return (
                <motion.div
                  key={vendor.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  className="group bg-white rounded-2xl sm:rounded-3xl border-2 border-orange-200 overflow-hidden shadow-md hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-400 cursor-pointer"
                  onClick={() => navigate(`/vendor/${vendor.id}`)}
                >
                  <div className="aspect-4/3 relative overflow-hidden bg-orange-100">
                    {imgUrl ? (
                      <img src={imgUrl} alt={vendor.shop_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-orange-100 to-amber-50 text-orange-600">
                         <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
                          </svg>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-white/95 text-orange-700 shadow-sm border border-orange-100">
                        {vendor.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 text-center">
                    <h3 className="text-sm sm:text-lg font-black text-slate-900 group-hover:text-orange-600 transition-colors mb-1 truncate">
                      {vendor.shop_name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-bold mb-4 line-clamp-1">{vendor.location}</p>
                    <div className="inline-flex items-center gap-2 text-[9px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all">
                      Visit Shop →
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
    </div>
  );
}
