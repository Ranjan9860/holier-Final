"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LoaderCircle, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import EmptyCollection from "@/components/Cart/EmptyCollection";
import PageLoader from "@/components/PageLoader";
import cartStyles from "@/components/Cart/CartPage.module.css";
import styles from "./wishlist.module.css";

function images(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try { return images(JSON.parse(value)); } catch { return value ? [value] : []; }
}

export default function WishlistPage() {
  const [pending, setPending] = useState<string | null>(null);
  const { items, error, loading, moveToCart, toggleWishlist, clearWishlist } = useWishlist();
  const { refreshCart } = useCart();

  const run = async (key: string, action: () => Promise<void>) => {
    setPending(key);
    try { await action(); } finally { setPending(null); }
  };

  if (loading && items.length === 0) {
    return <PageLoader />;
  }

  if (!items.length) {
    return (
      <EmptyCollection
        title="Your wishlist is empty"
        description="Looks like you haven't saved anything to your wishlist yet."
        error={error}
      />
    );
  }

  return (
    <main className={cartStyles.cartPage}>
      <div className={cartStyles.container}>
        <div className={cartStyles.pageHeader}>
          <div>
            <h1>Wishlist</h1>
            <p>{items.length} {items.length === 1 ? "item" : "items"} in your wishlist</p>
            {error && <p role="alert">{error}</p>}
          </div>
          <button type="button" className={cartStyles.clearCartButton} disabled={pending !== null} onClick={() => void run("clear", clearWishlist)}>{pending === "clear" ? <><LoaderCircle className="button-spinner" size={15} /> Clearing…</> : "Clear Wishlist"}</button>
        </div>

        <div className={cartStyles.cartTableWrapper}>
          <table className={cartStyles.cartTable}>
            <thead><tr><th>Product</th><th>Move to Cart</th><th>Action</th></tr></thead>
            <tbody>
              {items.map((item) => {
                const name = item.variant?.name || item.product?.name || "Product";
                const source = images(item.variant?.images)[0] || images(item.product?.images)[0] || "/image/products/placeholder.svg";
                return (
                  <tr key={item.id}>
                    <td><div className={cartStyles.productCell}>
                      <Link href={`/product/${item.product_id}`} className={cartStyles.productImage}>
                        <Image src={source} alt={name} fill sizes="100px" unoptimized />
                      </Link>
                      <div className={cartStyles.productInfo}><Link href={`/product/${item.product_id}`}><h3>{name}</h3></Link></div>
                    </div></td>
                    <td><button type="button" className={styles.moveButton} disabled={pending !== null} onClick={() => void run(`move-${item.id}`, async () => { await moveToCart(item.product_id, item.product_variant_id); await refreshCart(); })}>{pending === `move-${item.id}` ? <LoaderCircle className="button-spinner" size={16} /> : <ShoppingBag size={16} />} {pending === `move-${item.id}` ? "Moving…" : "Move to Cart"}</button></td>
                    <td><button type="button" className={cartStyles.deleteButton} disabled={pending !== null} aria-label={`Remove ${name}`} onClick={() => void run(`remove-${item.id}`, () => toggleWishlist(item.product_id, item.product_variant_id || undefined))}>{pending === `remove-${item.id}` ? <LoaderCircle className="button-spinner" size={18} /> : <Trash2 size={18} strokeWidth={1.5} />}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}
