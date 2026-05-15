import React, { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, CameraIcon } from '@heroicons/react/24/outline';
import { uploadFile, updateVendor, resolveMediaUrl } from '../api/endpoints';
import type { Vendor } from '../types';

interface VendorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vendor: Vendor;
}

const VendorProfileModal: React.FC<VendorProfileModalProps> = ({ isOpen, onClose, onSuccess, vendor }) => {
  const [formData, setFormData] = useState({
    shop_name: '',
    description: '',
    location: '',
    category: '',
    image_url: '',
    cover_image_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    if (vendor && isOpen) {
      setFormData({
        shop_name: vendor.shop_name,
        description: vendor.description || '',
        location: vendor.location || '',
        category: vendor.category || '',
        image_url: vendor.image_url || '',
        cover_image_url: vendor.cover_image_url || ''
      });
    }
  }, [vendor, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'cover_image_url') => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingField(field);
      try {
        const res = await uploadFile(file);
        setFormData({ ...formData, [field]: res.data.url });
      } catch (err: any) {
        console.error("Upload error:", err);
        alert(err.response?.data?.detail || "Failed to upload image. Please try again.");
      } finally {
        setUploadingField(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateVendor(vendor.id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      alert("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl transition-all border-2 border-slate-50 animate-in zoom-in-95 duration-500">
        <div className="px-8 py-6 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Shop Settings</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Vendor Profile Management</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white text-slate-400 hover:text-orange-600 rounded-2xl border-2 border-slate-50 transition-all active:scale-90"
          >
            <XMarkIcon className="h-6 w-6" strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            
            {/* Cover Image Upload */}
            <div>
              <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Shop Cover Image</label>
              <div className="relative group h-40 w-full rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 hover:border-orange-400 transition-all">
                {formData.cover_image_url ? (
                  <img src={resolveMediaUrl(formData.cover_image_url)} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <PhotoIcon className="w-8 h-8 mb-2" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Add a beautiful cover</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="p-3 bg-white rounded-2xl shadow-xl">
                      <CameraIcon className="w-6 h-6 text-orange-600" />
                   </div>
                </div>
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => handleImageUpload(e, 'cover_image_url')}
                  accept="image/*"
                />
                {uploadingField === 'cover_image_url' && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-600 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Image & Basic Info */}
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="shrink-0">
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Shop Logo</label>
                <div className="relative group w-32 h-32 rounded-4xl overflow-hidden bg-slate-100 border-2 border-slate-200 hover:border-orange-400 transition-all">
                  {formData.image_url ? (
                    <img src={resolveMediaUrl(formData.image_url)} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <PhotoIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <CameraIcon className="w-5 h-5 text-white" />
                  </div>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => handleImageUpload(e, 'image_url')}
                    accept="image/*"
                  />
                  {uploadingField === 'image_url' && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-orange-600 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Shop Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:border-orange-500 transition-all"
                    value={formData.shop_name}
                    onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Category</label>
                  <select
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:border-orange-500 transition-all"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
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
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Location / Address</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:border-orange-500 transition-all"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Block A, Student Center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 uppercase tracking-widest mb-3 px-1">Shop Description</label>
                <textarea
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:border-orange-500 transition-all resize-none"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell customers about your shop..."
                />
              </div>
            </div>
          </div>

          <div className="p-8 pt-4 border-t-2 border-slate-50 flex gap-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 rounded-2xl border-2 border-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:border-orange-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !!uploadingField}
              className="flex-1 px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-orange-600/30 disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? 'Saving...' : 'Update Shop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VendorProfileModal;
