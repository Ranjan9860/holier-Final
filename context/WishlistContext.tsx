"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { storefrontRequest } from "@/lib/api/client";

export type WishlistItem = { id: string; product_id: string; product_variant_id?: string | null; product?: { id: string; name: string; images?: unknown }; variant?: { id: string; name?: string; images?: unknown } };
type WishlistContextType = {
  wishlist: (string | number)[]; items: WishlistItem[]; error: string | null; loading: boolean;
  toggleWishlist: (productId: string | number, variantId?: string) => Promise<void>;
  moveToCart: (productId: string | number, variantId?: string | null) => Promise<void>;
  isInWishlist: (productId: string | number, variantId?: string | null) => boolean;
  clearWishlist: () => Promise<void>;
};
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const payload = await storefrontRequest<{ data: { items: WishlistItem[] } }>("wishlist", {}, "wishlist");
      setItems(payload.data.items); setError(null);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => {
    // The backend is the wishlist source of truth; hydration requires this fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWishlist().catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load wishlist."));
    window.addEventListener("holier-auth-changed", loadWishlist);
    return () => window.removeEventListener("holier-auth-changed", loadWishlist);
  }, [loadWishlist]);

  const toggleWishlist = async (productId: string | number, variantId?: string) => {
    setLoading(true);
    try {
      const existing = items.find((item) => String(item.product_id) === String(productId) && (item.product_variant_id || null) === (variantId || null));
      if (existing) await storefrontRequest(`wishlist/items/${existing.id}`, { method: "DELETE" }, "wishlist");
      else await storefrontRequest("wishlist/items", { method: "POST", body: JSON.stringify({ product_id: productId, product_variant_id: variantId }) }, "wishlist");
      await loadWishlist();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Wishlist update failed."); }
    finally { setLoading(false); }
  };
  const clearWishlist = async () => {
    setLoading(true);
    try {
      await Promise.all(items.map((item) => storefrontRequest(`wishlist/items/${item.id}`, { method: "DELETE" }, "wishlist")));
      await loadWishlist();
    } finally { setLoading(false); }
  };
  const moveToCart = async (productId: string | number, variantId?: string | null) => {
    const item = items.find((candidate) => String(candidate.product_id) === String(productId) && (candidate.product_variant_id || null) === (variantId || null));
    const cartToken = localStorage.getItem("holier-cart-token");
    if (!item) return setError("Wishlist item not found. Please refresh and try again.");
    setLoading(true);
    try {
      await storefrontRequest(`wishlist/items/${item.id}/move-to-cart`, {
        method: "POST",
        headers: cartToken ? { "X-Cart-Token": cartToken } : undefined,
      }, "wishlist");
      await loadWishlist();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to move item to cart."); }
    finally { setLoading(false); }
  };
  const wishlist = items.map((item) => item.product_id);
  return <WishlistContext.Provider value={{ wishlist, items, error, loading, toggleWishlist, moveToCart, isInWishlist: (productId, variantId) => items.some((item) => String(item.product_id) === String(productId) && (item.product_variant_id || null) === (variantId || null)), clearWishlist }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
