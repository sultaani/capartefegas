"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { CartItem } from "@/lib/types";

const STORAGE_KEY = "capartefegas_cart_v1";

type CartContextValue = {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (index: number, delta: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read any previously saved cart once, on mount, client-side only —
  // there are no customer accounts (per the PRD), so the cart lives in
  // the browser rather than the database.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {
      /* ignore corrupt cart data */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  function addItem(item: CartItem) {
    setCart((prev) => [...prev, item]);
    setIsOpen(true);
  }

  function updateQuantity(index: number, delta: number) {
    setCart((prev) => prev.map((it, i) => {
      if (i !== index) return it;
      const next = Math.max(1, Math.min(it.maxStock, it.quantity + delta));
      return { ...it, quantity: next };
    }));
  }

  function removeItem(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function clearCart() {
    setCart([]);
  }

  const subtotal = cart.reduce((sum, it) => sum + it.price * it.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false), addItem, updateQuantity, removeItem, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
