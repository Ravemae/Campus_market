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
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl transition-all border-2 border-slate-50 animate-in zoom-in-95 duration-500">
        <div className="px-8 py-6 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/20">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {product ? 'Refine Product' : 'New Listing'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Inventory Management</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white text-slate-400 hover:text-orange-600 rounded-2xl border-2 border-slate-50 transition-all active:scale-90"
          >
            <XMarkIcon className="h-6 w-6" strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Image Upload */}
          <div className="group relative">
             <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Product Visual</label>
             <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:border-orange-400 transition-all cursor-pointer relative overflow-hidden min-h-[14rem]">
              {formData.image_url ? (
                <div className="relative w-full h-48">
                  <img src={resolveMediaUrl(formData.image_url)} alt="Preview" className="w-full h-full object-cover rounded-2xl shadow-lg" />
                  <div className="absolute inset-0 bg-orange-600/5 group-hover:bg-orange-600/0 transition-all"></div>
                  <div className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/50">
                    <PhotoIcon className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-400 shadow-inner">
                    <PhotoIcon className="h-8 w-8" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Drop marketplace image here</p>
                </div>
              )}
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleImageChange}
                accept="image/*"
              />
              {uploading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-600 border-t-transparent shadow-lg shadow-orange-600/20"></div>
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Uploading Media...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Product Title</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4.5 px-6 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-slate-400"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Spicy Chicken Jollof"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Detailed Description</label>
              <textarea
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4.5 px-6 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all placeholder:text-slate-400 resize-none"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the taste, ingredients, or key details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Price (₦)</label>
                <input
                  type="number"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4.5 px-6 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Category</label>
                <select
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4.5 px-6 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all cursor-pointer"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Food">Food</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Services">Services</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Inventory Level (Stock)</label>
              <input
                type="number"
                required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4.5 px-6 text-slate-900 font-bold focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="pt-8 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-5 rounded-2xl border-2 border-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:border-orange-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex-1 px-8 py-5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-orange-600/30 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  Saving...
                </>
              ) : (
                product ? 'Update Details' : 'Launch Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
