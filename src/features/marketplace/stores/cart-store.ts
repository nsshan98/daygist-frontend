import { create } from "zustand";

export interface CartState {
  isCartOpen: boolean;
}

export interface CartActions {
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  resetStore: () => void;
}

const initialState: CartState = {
  isCartOpen: false,
};

export const useCartStore = create<CartState & CartActions>((set) => ({
  ...initialState,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  resetStore: () => set(initialState),
}));
