import { create } from "zustand";
import type { CartItem } from "@/types";

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) => {
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, qty: i.qty + (item.qty || 1) }
              : i
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            image: item.image || null,
            sellingPrice: item.sellingPrice,
            qty: item.qty || 1,
            unit: item.unit,
            maxStock: item.maxStock,
          },
        ],
      };
    });
  },

  updateQty: (productId, qty) => {
    set((state) => {
      if (qty <= 0) {
        return { items: state.items.filter((i) => i.productId !== productId) };
      }
      return {
        items: state.items.map((i) =>
          i.productId === productId ? { ...i, qty } : i
        ),
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.productId !== productId),
    }));
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.qty, 0);
  },
}));
