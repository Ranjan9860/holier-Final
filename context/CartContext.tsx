"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { storefrontRequest } from "@/lib/api/client";
import type { Product } from "@/types/product";

export type CartItem = {
  id: string; productId: string; variantId?: string; title: string; images: string[];
  quantity: number; unitPrice: number; lineTotal: number; taxAmount: number;
  discountAmount: number; promotion?: unknown; stockStatus?: string; inStock: boolean;
  selectedSize?: string; selectedColor?: string;
};
type CartSummary = { subtotal: number; discountAmount: number; taxAmount: number; total: number; itemsCount: number; quantityTotal: number };
type ApiCart = {
  items: Array<{ id: string; product_id: string; product_name?: string; product_images?: unknown; variant_id?: string; variant_attribute_name?: unknown; variant_attribute_value?: unknown; quantity: number; unit_price_with_tax?: number; unit_price?: number; line_total?: number; tax_amount?: number; discount_amount_with_tax?: number; promotion?: unknown; stock_status?: string; in_stock?: boolean }>;
  summary?: { subtotal?: number; discount_amount_with_tax?: number; tax_amount?: number; total?: number; items_count?: number; quantity_total?: number };
};
type CartContextType = {
  cart: CartItem[]; summary: CartSummary; error: string | null; loading: boolean;
  addToCart: (product: Product, quantity?: number, variantId?: string) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>; refreshCart: () => Promise<{ cart: CartItem[]; summary: CartSummary }>; cartCount: number; cartTotal: number;
};
const emptySummary: CartSummary = { subtotal: 0, discountAmount: 0, taxAmount: 0, total: 0, itemsCount: 0, quantityTotal: 0 };
const CartContext = createContext<CartContextType | undefined>(undefined);

function strings(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try { return strings(JSON.parse(value)); } catch { return value ? [value] : []; }
}

function mapCart(data: ApiCart) {
  const cart = data.items.map((item): CartItem => {
    const names = strings(item.variant_attribute_name).map((name) => name.toLowerCase());
    const values = strings(item.variant_attribute_value);
    const options = Object.fromEntries(names.map((name, index) => [name, values[index]]));
    return {
      id: item.id, productId: item.product_id, variantId: item.variant_id,
      title: item.product_name || "Product",
      images: strings(item.product_images).filter((image) => image.startsWith("/") || image.startsWith("http")),
      quantity: Number(item.quantity), unitPrice: Number(item.unit_price_with_tax ?? item.unit_price ?? 0),
      lineTotal: Number(item.line_total ?? 0), taxAmount: Number(item.tax_amount ?? 0),
      discountAmount: Number(item.discount_amount_with_tax ?? 0), promotion: item.promotion,
      stockStatus: item.stock_status, inStock: item.in_stock !== false,
      selectedSize: options.size, selectedColor: options.color,
    };
  });
  const source = data.summary || {};
  return { cart, summary: {
    subtotal: Number(source.subtotal ?? 0), discountAmount: Number(source.discount_amount_with_tax ?? 0),
    taxAmount: Number(source.tax_amount ?? 0), total: Number(source.total ?? 0),
    itemsCount: Number(source.items_count ?? cart.length),
    quantityTotal: Number(source.quantity_total ?? cart.reduce((sum, item) => sum + item.quantity, 0)),
  } };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await storefrontRequest<{ data: ApiCart }>("cart", {}, "cart");
      const next = mapCart(payload.data);
      setCart(next.cart); setSummary(next.summary); setError(null);
      return next;
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    // The backend is the cart source of truth; hydration requires this fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCart().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load cart."));
    window.addEventListener("holier-auth-changed", loadCart);
    return () => window.removeEventListener("holier-auth-changed", loadCart);
  }, [loadCart]);

  const mutate = async (path: string, init: RequestInit) => {
    setLoading(true);
    try { await storefrontRequest(path, init, "cart"); await loadCart(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Cart update failed."); }
    finally { setLoading(false); }
  };
  const addToCart: CartContextType["addToCart"] = async (product, quantity = 1, variantId) => {
    if (!localStorage.getItem("holier-cart-token")) await loadCart();
    await mutate("cart/items", { method: "POST", body: JSON.stringify({ product_id: product.id, product_variant_id: variantId, quantity }) });
  };
  const removeFromCart = (cartItemId: string) => mutate(`cart/items/${cartItemId}`, { method: "DELETE" });
  const updateQuantity = (cartItemId: string, quantity: number) => quantity <= 0
    ? removeFromCart(cartItemId)
    : mutate(`cart/items/${cartItemId}`, { method: "PATCH", body: JSON.stringify({ quantity }) });
  const clearCart = () => mutate("cart", { method: "DELETE" });

  return <CartContext.Provider value={{ cart, summary, error, loading, addToCart, removeFromCart, updateQuantity, clearCart, refreshCart: loadCart, cartCount: summary.quantityTotal, cartTotal: summary.total }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
