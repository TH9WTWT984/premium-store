 "use client";

import { createContext, useContext, useState } from "react";

type StoreContextValue = {
  cartCount: number;
  wishlistCount: number;
  addToCart: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount] = useState(0);

  return (
    <StoreContext.Provider value={{ cartCount, wishlistCount, addToCart: () => setCartCount(v => v + 1) }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside StoreProvider");
  return value;
}