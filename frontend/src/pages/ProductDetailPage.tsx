import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getProduct, getVendor } from '../api/endpoints';
import { useCartStore } from '../stores/cartStore';

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(Number(productId)).then((r) => r.data),
    enabled: !!productId,
  });

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendor', product?.vendor_id],
    queryFn: () => getVendor(product!.vendor_id).then((r) => r.data),
    enabled: !!product?.vendor_id,
  });

  if (productLoading || vendorLoading) {
    return <div className="text-center py-20 text-gray-400">Loading product...</div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-gray-400">Product not found</div>;
  }

  const handleAddToCart = () => {
    const currentVendorId = cartItems[0]?.vendorId;
    if (currentVendorId && currentVendorId !== product.vendor_id) {
      const confirmMsg = "Your cart has items from another shop. Clear cart to add this item?";
      if (window.confirm(confirmMsg)) {
        useCartStore.getState().clearCart();
      } else {
        return;
      }
    }

    addItem({
      productId: product.id,
      vendorId: product.vendor_id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: product.image_url || '',
    });
    
    // Provide some visual feedback or redirect to cart
    alert('Added to cart!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back
      </button>

      <div className="bg-gray-900/60 border border-gray-800/50 rounded-3xl overflow-hidden p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="aspect-square bg-gray-800 rounded-2xl overflow-hidden border border-gray-700/50">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {vendor && (
              <button onClick={() => navigate(`/vendor/${vendor.id}`)} className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors mb-2 text-left">
                {vendor.shop_name}
              </button>
            )}
            <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
            <div className="text-3xl font-bold text-white mb-6">₦{product.price.toLocaleString()}</div>
            
            <div className="prose prose-invert max-w-none text-gray-400 mb-8">
              <p>{product.description || 'No description available for this product.'}</p>
            </div>

            <div className="mt-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Quantity</label>
                <div className="flex items-center gap-3 w-32 bg-gray-800/80 p-1 rounded-xl border border-gray-700">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                    -
                  </button>
                  <span className="flex-1 text-center font-medium text-white">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.is_available}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                {product.is_available ? `Add to Cart - ₦${(product.price * quantity).toLocaleString()}` : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
