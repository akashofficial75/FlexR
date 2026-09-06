import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique combination of product_id + size + color
  product_id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  max_stock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === newItem.id);
          if (existingItem) {
            // Update quantity, respecting max stock
            const newQuantity = Math.min(existingItem.quantity + newItem.quantity, existingItem.max_stock);
            return {
              items: state.items.map(item => 
                item.id === newItem.id 
                  ? { ...item, quantity: newQuantity }
                  : item
              ),
              isOpen: true,
            };
          }
          return { 
            items: [...state.items, newItem],
            isOpen: true
          };
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map(item => {
            if (item.id === id) {
              const safeQuantity = Math.max(1, Math.min(quantity, item.max_stock));
              return { ...item, quantity: safeQuantity };
            }
            return item;
          })
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'flexr-cart-storage',
      // Don't persist isOpen state
      partialize: (state) => ({ items: state.items }),
    }
  )
);
