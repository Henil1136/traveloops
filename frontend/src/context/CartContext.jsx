import { createContext, useContext, useState, useEffect } from "react";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

const STORAGE_KEY = "traveloops_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  });

  // ── Write to localStorage on every change ────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // ── Cross-tab sync: listen for changes from other tabs ───
  // This prevents stale-state race conditions when the same
  // user has the app open in two browser tabs simultaneously.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        const updated = JSON.parse(e.newValue || "[]");
        setItems(updated);
      } catch { /* ignore parse errors */ }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = (item) => {
    setItems(prev => {
      if (prev.find(i => i.cartId === item.cartId)) return prev;
      return [...prev, { ...item, addedAt: Date.now() }];
    });
  };

  const removeItem = (cartId) =>
    setItems(prev => prev.filter(i => i.cartId !== cartId));

  const updateQty = (cartId, qty) =>
    setItems(prev => prev.map(i =>
      i.cartId === cartId ? { ...i, qty: Math.max(1, qty) } : i
    ));

  const clearCart = () => setItems([]);
  const isInCart  = (cartId) => items.some(i => i.cartId === cartId);

  const total = items.reduce((sum, i) => {
    const price = i.pricePerNight || i.priceRange_num || i.cost || i.price || 0;
    return sum + price * (i.qty || 1) * (i.nights || 1);
  }, 0);

  const count = items.length;

  return (
    <CartCtx.Provider value={{ items, addItem, removeItem, updateQty, clearCart, isInCart, total, count }}>
      {children}
    </CartCtx.Provider>
  );
}
