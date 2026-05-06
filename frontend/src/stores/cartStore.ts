import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartStoreItem } from '../types';

interface CartState {
  items: CartStoreItem[];
  addItem: (item: CartStoreItem) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const currentItems = get().items;
        
        // Check if item belongs to a different vendor
        if (currentItems.length > 0 && currentItems[0].vendorId !== item.vendorId) {
          const proceed = window.confirm(
            "Your cart contains items from a different vendor. Do you want to clear your cart and start a new order?"
          );
          if (!proceed) return;
          
          // Clear cart and add new item
          set({ items: [item] });
          return;
        }

        const existing = currentItems.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: currentItems.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ items: [...currentItems, item] });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateQty: (productId, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'campus-market-cart',
    }
  )
);
