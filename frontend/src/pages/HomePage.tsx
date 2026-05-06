import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getVendors } from '../api/endpoints';
import type { Vendor } from '../types';

const CATEGORIES = ['All', 'Food', 'Drinks', 'Snacks', 'Groceries', 'Electronics', 'Fashion', 'Services', 'Other'];

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link
      to={`/vendor/${vendor.id}`}
      className="group card-hover bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm"
    >
      {/* Image Wrapper */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {vendor.image_url ? (
          <img
            src={vendor.image_url}
            alt={vendor.shop_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40">
            <svg className="w-16 h-16 text-indigo-300 dark:text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.5 21v-16.5L21 12l-7.5 9z" />
            </svg>
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-5 right-5">
          <span className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 text-indigo-600 dark:text-indigo-400 backdrop-blur-md shadow-lg border border-white/20">
            {vendor.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
          {vendor.shop_name}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-6 min-h-[2.5rem]">
          {vendor.description}
        </p>
        
        <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {vendor.location}
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => getVendors().then((r) => r.data),
  });

  const filtered = vendors.filter((v: Vendor) => {
    const matchesCategory = activeCategory === 'All' || v.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = !searchQuery || v.shop_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative py-24 px-8 overflow-hidden rounded-[3rem] bg-indigo-600 mb-16 shadow-2xl shadow-indigo-500/20">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-[30rem] h-[30rem] bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-[25rem] h-[25rem] bg-indigo-900/30 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/10 text-indigo-50 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
            Campus Exclusive Marketplace
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-8 leading-[1.05] tracking-tight">
            Order food & more, <br />
            <span className="text-blue-200">straight to your room.</span>
          </h1>
          <p className="text-indigo-100/90 text-xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Discover the best student vendors on your campus. <br className="hidden sm:block" /> Fast, fresh, and powered by your community.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-[1.8rem] p-2 shadow-2xl shadow-black/10">
              <div className="flex items-center flex-1 px-5">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for food, gadgets, or shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-bold py-4 px-4 placeholder:text-slate-400 text-lg"
                />
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-[1.4rem] transition-all shadow-xl shadow-indigo-600/30 active:scale-95 text-lg">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Categories</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Explore our range</p>
          </div>
          <div className="h-0.5 flex-1 bg-slate-100 dark:bg-slate-800 mx-8 rounded-full opacity-50"></div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-500 ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 -translate-y-2'
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-indigo-600 border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:shadow-xl hover:shadow-indigo-500/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex flex-col">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Popular Vendors</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Top student businesses</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-black rounded-lg">
            {filtered.length} SHOPS
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse overflow-hidden">
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800" />
              <div className="p-8 space-y-5">
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl w-3/4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-xl w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-32 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm shadow-black/5">
          <div className="w-28 h-28 mx-auto mb-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <svg className="w-14 h-14 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">No vendors found</h3>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filtered.map((vendor: Vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}
