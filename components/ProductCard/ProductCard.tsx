"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, LoaderCircle } from "lucide-react";

import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice, formatPriceRange } from "@/lib/format";

import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  const [cartPending, setCartPending] = useState(false);
  const [wishlistPending, setWishlistPending] = useState(false);

  const href = `/product/${product.slug || product.id}${product.sale?.variantId ? `?variant=${encodeURIComponent(product.sale.variantId)}` : ""}`;
  const outOfStock = product.stockStatus === "out_of_stock";
  const unavailable = outOfStock || product.price <= 0;
  const promotion = product.sale
    ? { name: product.sale.name, percentOff: product.sale.percentOff || 0 }
    : product.promotion;
  const saved = isInWishlist(product.id);

  // Variant products need a chosen variant before cart or wishlist identity exists.
  const openOptions = () => router.push(href);
  const handleCart = async () => {
    if (product.hasVariants) return openOptions();
    setCartPending(true);
    try { await addToCart(product); } finally { setCartPending(false); }
  };
  const handleWishlist = async () => {
    if (product.hasVariants) return openOptions();
    setWishlistPending(true);
    try { await toggleWishlist(product.id); } finally { setWishlistPending(false); }
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <Link href={href} className={styles.imageLink}>
          <Image
            src={product.image}
            alt={product.seo?.altText || product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={styles.image}
            priority={priority}
            unoptimized
          />
        </Link>

        {/* Badges are only rendered from real API state */}
        <div className={styles.badges}>
          {promotion && <span className={styles.saleBadge}>{promotion.name}{promotion.percentOff > 0 && ` · ${promotion.percentOff}% off`}</span>}

          {outOfStock && <span className={styles.badge}>Out of stock</span>}

          {!outOfStock && product.stockStatus === "low_stock" && (
            <span className={styles.badge}>Low stock</span>
          )}
        </div>

        <button
          type="button"
          className={styles.wishlistButton}
          aria-label={
            product.hasVariants
              ? "Choose options to save this product"
              : saved
                ? "Remove from wishlist"
                : "Add to wishlist"
          }
          disabled={wishlistPending}
          aria-busy={wishlistPending}
          onClick={() => void handleWishlist()}
        >
          {wishlistPending
            ? <LoaderCircle className="button-spinner" size={17} aria-hidden="true" />
            : <Heart size={17} strokeWidth={1.5} fill={saved ? "currentColor" : "none"} />}
        </button>
      </div>

      <div className={styles.info}>
        {(product.category || product.brand) && (
          <p className={styles.meta}>{product.category || product.brand}</p>
        )}

        <Link href={href}>
          <h3 className={styles.title}>{product.title}</h3>
        </Link>

        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPriceRange(product.price, product.priceMax)}</span>

          {product.oldPrice && <del className={styles.oldPrice}>{formatPrice(product.oldPrice)}</del>}
        </div>

        {product.hasVariants && product.variantCount && !product.sale ? (
          <p className={styles.options}>{product.variantCount} options</p>
        ) : null}

        <button
          type="button"
          className={styles.cartButton}
          disabled={(unavailable && !product.hasVariants) || cartPending}
          aria-busy={cartPending}
          onClick={() => void handleCart()}
        >
          {cartPending ? <><LoaderCircle className="button-spinner" size={15} aria-hidden="true" /> Adding…</> : product.hasVariants ? "Choose options" : outOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
