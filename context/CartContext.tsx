"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { Product } from "@/types/product";
import { products } from "@/data/products";

export type CartItem = Product & {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
};

type CartContextType = {
  cart: CartItem[];

  addToCart: (
    product: Product,
    quantity?: number,
    selectedSize?: string,
    selectedColor?: string,
  ) => void;

  removeFromCart: (
    productId: string | number,
    selectedSize?: string,
    selectedColor?: string,
  ) => void;

  updateQuantity: (
    productId: string | number,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string,
  ) => void;

  clearCart: () => void;

  cartCount: number;

  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  /*
  =========================================================
  LOAD CART FROM LOCAL STORAGE
  =========================================================
  */

  useEffect(() => {
    const savedCart = localStorage.getItem("holier-cart");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem("holier-cart");
      }
    }
  }, []);

  /*
  =========================================================
  SAVE CART TO LOCAL STORAGE
  =========================================================
  */

  useEffect(() => {
    localStorage.setItem("holier-cart", JSON.stringify(cart));
  }, [cart]);

  /*
  =========================================================
  ADD TO CART
  =========================================================
  */

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string,
  ) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor,
      );

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity,
          selectedSize,
          selectedColor,
        },
      ];
    });
  };

  /*
  =========================================================
  REMOVE FROM CART
  =========================================================
  */

  const removeFromCart = (
    productId: string | number,
    selectedSize?: string,
    selectedColor?: string,
  ) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          !(
            item.id === productId &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          ),
      ),
    );
  };

  /*
  =========================================================
  UPDATE QUANTITY
  =========================================================
  */

  const updateQuantity = (
    productId: string | number,
    quantity: number,
    selectedSize?: string,
    selectedColor?: string,
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  };

  /*
  =========================================================
  CLEAR CART
  =========================================================
  */

  const clearCart = () => {
    setCart([]);
  };

  /*
  =========================================================
  CART COUNT
  =========================================================
  */

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  /*
  =========================================================
  CART TOTAL
  =========================================================
  */

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/*
=========================================================
USE CART HOOK
=========================================================
*/

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
