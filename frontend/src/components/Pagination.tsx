import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;
    
    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 px-8 py-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-orange-100 dark:border-slate-800 shadow-xl shadow-orange-500/5 transition-all">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        Showing <span className="text-orange-600">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-orange-600">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of {totalItems} entries
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-3 rounded-2xl bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-100 dark:hover:bg-slate-700 transition-all border border-orange-100 dark:border-slate-700 active:scale-90"
        >
          <ChevronLeftIcon className="w-5 h-5" strokeWidth={3} />
        </button>

        <div className="flex items-center gap-1.5 px-2">
          {getPageNumbers().map((page, i) => (
            <React.Fragment key={i}>
              {page === '...' ? (
                <span className="px-2 text-slate-300 dark:text-slate-700 font-black">•••</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`w-11 h-11 rounded-2xl text-xs font-black transition-all duration-300 ${
                    currentPage === page
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/40 scale-110'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-slate-800 hover:text-orange-600'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-3 rounded-2xl bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-100 dark:hover:bg-slate-700 transition-all border border-orange-100 dark:border-slate-700 active:scale-90"
        >
          <ChevronRightIcon className="w-5 h-5" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};
