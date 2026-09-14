"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { CartItem, Product } from "@/types/product";
import { useAuth } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  totalCount: number;
  subtotal: number;
  isSyncing: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const { user } = useAuth();
  const initialLoadRef = useRef(false);

  // 1. Initial Load:
  // - If user is logged in: load from persistent storage (localStorage per user ID + Supabase API)
  // - If guest: load from sessionStorage (resets when browser completely closed, persists across internal navigation)
  useEffect(() => {
    async function loadCart() {
      if (user?.id) {
        // Logged-in user: persistent cart
        try {
          const localSaved = localStorage.getItem(`zorenb_user_cart_${user.id}`);
          if (localSaved) {
            setItems(JSON.parse(localSaved));
          }

          // Fetch from Supabase API in background
          setIsSyncing(true);
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            if (data.items && data.items.length > 0) {
              setItems(data.items);
              localStorage.setItem(`zorenb_user_cart_${user.id}`, JSON.stringify(data.items));
            }
          }
        } catch {
          // ignore
        } finally {
          setIsSyncing(false);
          initialLoadRef.current = true;
        }
      } else {
        // Guest user: sessionStorage (cleared upon closing browser/tab completely)
        try {
          const sessionSaved = sessionStorage.getItem("zorenb_guest_cart");
          if (sessionSaved) {
            setItems(JSON.parse(sessionSaved));
          } else {
            setItems([]);
          }
        } catch {
          setItems([]);
        } finally {
          initialLoadRef.current = true;
        }
      }
    }

    loadCart();
  }, [user?.id]);

  // 2. Save Cart whenever items change:
  useEffect(() => {
    if (!initialLoadRef.current) return;

    if (user?.id) {
      // Logged-in user: ALWAYS save to localStorage and sync to database
      try {
        localStorage.setItem(`zorenb_user_cart_${user.id}`, JSON.stringify(items));
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        }).catch(() => {});
      } catch {
        // ignore
      }
    } else {
      // Guest user: save ONLY to sessionStorage (resets on full browser exit)
      try {
        sessionStorage.setItem("zorenb_guest_cart", JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  }, [items, user?.id]);

  const addItem = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    // Open cart drawer immediately upon adding item
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    if (user?.id) {
      localStorage.removeItem(`zorenb_user_cart_${user.id}`);
      fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [] }),
      }).catch(() => {});
    } else {
      sessionStorage.removeItem("zorenb_guest_cart");
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        totalCount,
        subtotal,
        isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
