import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Product = {
  id: string;
  title: string;
  price: number;
  sale_price?: number;
  regular_price?: number;
  image: string;
  images?: { url: string }[];
  quantity: number;
  stock?: number;
  short_description?: string;
  category?: string;
  ratings?: number;
  slug?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
} | null;

export type StoreState = {
  cart: Product[];
  wishlist: Product[];
};

export type StoreActions = {
  addToCart: (
    product: Product,
    user: User,
    location: string,
    deviceInfo: string
  ) => void;
  removeFromCart: (
    id: string,
    user: User,
    location: string,
    deviceInfo: string
  ) => void;
  addToWishlist: (
    product: Product,
    user: User,
    location: string,
    deviceInfo: string
  ) => void;
  removeFromWishlist: (
    id: string,
    user: User,
    location: string,
    deviceInfo: string
  ) => void;
  clearCart: () => void;
  clearWishlist: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  isInWishlist: (productId: string) => boolean;
  isInCart: (productId: string) => boolean;
};

export type Store = StoreState & StoreActions;

const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: [],
      wishlist: [],
      
      // Cart actions
      addToCart: (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id 
                  ? { ...item, quantity: item.quantity + 1 } 
                  : item
              ),
            };
          } else {
            return {
              cart: [...state.cart, { ...product, quantity: 1 }],
            };
          }
        });
        
        // Optional: Log analytics or send to API
        console.log('Product added to cart:', { product, user, location, deviceInfo });
      },

      removeFromCart: (id, user, location, deviceInfo) => {
        const removeProduct = get().cart.find((item) => item.id === id);
        
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));
        
        // Optional: Log analytics
        console.log('Product removed from cart:', { removeProduct, user, location, deviceInfo });
      },

      // Wishlist actions
      addToWishlist: (product, user, location, deviceInfo) => {
        set((state) => {
          // Check if product already exists in wishlist
          if (state.wishlist.find((item) => item.id === product.id)) {
            return state; // No change if already in wishlist
          }
          
          return { 
            wishlist: [...state.wishlist, product] 
          };
        });
        
        // Optional: Log analytics
        console.log('Product added to wishlist:', { product, user, location, deviceInfo });
      },

      removeFromWishlist: (id, user, location, deviceInfo) => {
        const removedProduct = get().wishlist.find((item) => item.id === id);
        
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id),
        }));
        
        // Optional: Log analytics
        console.log('Product removed from wishlist:', { removedProduct, user, location, deviceInfo });
      },

      // Utility actions
      clearCart: () => set({ cart: [] }),
      
      clearWishlist: () => set({ wishlist: [] }),
      
      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => {
          const price = item.sale_price || item.price || 0;
          return total + (price * item.quantity);
        }, 0);
      },
      
      getCartItemCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + item.quantity, 0);
      },
      
      isInWishlist: (productId: string) => {
        const { wishlist } = get();
        return wishlist.some((item) => item.id === productId);
      },
      
      isInCart: (productId: string) => {
        const { cart } = get();
        return cart.some((item) => item.id === productId);
      },
    }),
    {
      name: "ecommerce-store", // localStorage key
      partialize: (state) => ({ 
        cart: state.cart, 
        wishlist: state.wishlist 
      }), // Only persist cart and wishlist
    }
  )
);

export default useStore;