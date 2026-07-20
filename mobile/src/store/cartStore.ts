import { create } from 'zustand';

export interface CartItem {
  id: string; // product id + variant label
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant: string;
  weightLabel: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (newItem) => {
    set((state) => {
      const uniqueId = `${newItem.productId}-${newItem.variant}`;
      const existingItem = state.items.find((i) => i.id === uniqueId);
      
      if (existingItem) {
        return {
          items: state.items.map((i) => 
            i.id === uniqueId ? { ...i, quantity: i.quantity + newItem.quantity } : i
          )
        };
      }
      
      return {
        items: [...state.items, { ...newItem, id: uniqueId }]
      };
    });
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((i) => i.id !== id)
    }));
  },

  updateQuantity: (id, delta) => {
    set((state) => ({
      items: state.items.map((i) => {
        if (i.id === id) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      })
    }));
  },

  clearCart: () => set({ items: [] }),

  getCartTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getCartCount: () => {
    const { items } = get();
    return items.reduce((count, item) => count + item.quantity, 0);
  }
}));
