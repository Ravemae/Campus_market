import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { uploadFile, createProduct, updateProduct, resolveMediaUrl } from '../api/endpoints';
import type { Product } from '../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: Product | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSuccess, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock_quantity: 10,
    image_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category,
        stock_quantity: product.stock_quantity,
        image_url: product.image_url || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        stock_quantity: 10,
        image_url: ''
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const res = await uploadFile(file);
        setFormData({ ...formData, image_url: res.data.url });
      } catch (err) {
        alert("Failed to upload image");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (product) {
        await updateProduct(product.id, formData);
      } else {
        await createProduct(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl transition-all border border-slate-100 animate-in zoom-in-95 duration-500">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {product ? 'Refine Product' : 'New Listing'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inventory Management</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 transition-all active:scale-90"
          >
            <XMarkIcon className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Image Upload */}
          <div className="group relative">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Product Visual</label>
             <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:border-indigo-400 transition-all cursor-pointer relative overflow-hidden min-h-[12rem]">
              {formData.image_url ? (
                <div className="relative w-full h-40">
                  <img src={resolveMediaUrl(formData.image_url)} alt="Preview" className="w-full h-full object-cover rounded-2xl shadow-md" />
                  <div className="absolute inset-0 bg-indigo-600/10 group-hover:bg-indigo-600/0 transition-all"></div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400">
                    <PhotoIcon className="h-8 w-8" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Drop image here</p>
                </div>
              )}
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleImageChange}
                accept="image/*"
              />
              {uploading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Uploading...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Product Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-indigo-500 focus:ring-0 transition-all placeholder:text-slate-400"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Spicy Chicken Jollof"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Description</label>
              <textarea
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-indigo-500 focus:ring-0 transition-all placeholder:text-slate-400 resize-none"
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the taste, ingredients, or details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Price (₦)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-indigo-500 focus:ring-0 transition-all"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Category</label>
                <select
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-indigo-500 focus:ring-0 transition-all cursor-pointer"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Food">Food</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Books">Books</option>
                  <option value="Services">Services</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Inventory Level</label>
              <input
                type="number"
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-5 text-slate-900 font-bold focus:border-indigo-500 focus:ring-0 transition-all"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 text-slate-400 font-black uppercase tracking-widest text-xs hover:border-indigo-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex-1 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/30 disabled:bg-indigo-400 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  Saving...
                </>
              ) : (
                product ? 'Confirm Changes' : 'Create Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
