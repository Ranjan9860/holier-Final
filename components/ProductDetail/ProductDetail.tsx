"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, LoaderCircle, Minus, Plus, Star } from "lucide-react";

import styles from "./ProductDetail.module.css";

import { Product } from "@/types/product";
import { formatPrice, formatPriceRange } from "@/lib/format";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import { storefrontRequest } from "@/lib/api/client";

type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { customer } = useAuth();
  const router = useRouter();

  const variants = product.variants || [];
  const optionNames = [...new Set(variants.flatMap((variant) => Object.keys(variant.options)))];

  const [selection, setSelection] = useState<Record<string, string>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");
  const [pending, setPending] = useState<"cart" | "wishlist" | null>(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  /* =======================================================
     VARIANT SELECTION
  ======================================================= */

  const selectedVariant = optionNames.length > 0
    ? variants.find((variant) => optionNames.every((name) => variant.options[name] === selection[name]))
    : undefined;

  // A variant product cannot be added to cart or wishlist until one variant is identified.
  const ready = optionNames.length === 0 || Boolean(selectedVariant);

  const optionValues = (name: string) => [
    ...new Set(variants.map((variant) => variant.options[name]).filter(Boolean)),
  ];

  const isSelectable = (name: string, value: string) =>
    variants.some((variant) =>
      variant.options[name] === value
      && optionNames.every((other) => other === name || !selection[other] || variant.options[other] === selection[other]),
    );

  const images = selectedVariant?.images.length ? selectedVariant.images : product.images;
  const image = images[Math.min(activeImage, images.length - 1)];

  const price = selectedVariant?.price ?? product.price;
  const oldPrice = selectedVariant ? selectedVariant.oldPrice : product.oldPrice;
  const stockStatus = selectedVariant?.stockStatus ?? product.stockStatus;
  const outOfStock = stockStatus === "out_of_stock";
  const disabled = !ready || outOfStock || price <= 0;

  const reviews = product.reviews || [];

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleAddToCart = async () => {
    setPending("cart");
    try {
      await addToCart(product, quantity, selectedVariant?.id);
      setCartMessage("Added to your cart.");
    } finally { setPending(null); }
  };

  const handleBuyNow = () => {
    if (disabled || pending) return;
    sessionStorage.setItem("holier-buy-now", JSON.stringify({
      productId: product.id, variantId: selectedVariant?.id, quantity,
      title: product.title, image, unitPrice: price, lineTotal: price * quantity,
    }));
    router.push("/checkout");
  };

  const handleWishlist = async () => {
    setPending("wishlist");
    try { await toggleWishlist(product.id, selectedVariant?.id); } finally { setPending(null); }
  };

  const saved = isInWishlist(product.id, selectedVariant?.id);

  return (
    <main className={styles.page}>
      <div className="container">
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <span>{product.category}</span>
            </>
          )}
        </nav>

        <div className={styles.layout}>
          {/* =================================================
              GALLERY
          ================================================= */}

          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <Image
                src={image}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 55vw"
                className={styles.cover}
              />
            </div>

            {images.length > 1 && (
              <div className={styles.thumbnails}>
                {images.map((thumbnail, index) => (
                  <button
                    key={`${thumbnail}-${index}`}
                    type="button"
                    aria-label={`View image ${index + 1}`}
                    className={index === activeImage ? styles.activeThumbnail : undefined}
                    onClick={() => setActiveImage(index)}
                  >
                    <Image src={thumbnail} alt="" fill sizes="90px" className={styles.cover} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =================================================
              INFORMATION
          ================================================= */}

          <div className={styles.info}>
            {(product.brand || product.category) && (
              <p className="eyebrow">{[product.brand, product.category].filter(Boolean).join(" · ")}</p>
            )}

            <h1>{product.title}</h1>

            {product.rating ? (
              <p className={styles.rating}>
                <Star size={14} fill="currentColor" strokeWidth={0} />
                {product.rating.toFixed(1)}
                <span>({product.reviewsCount ?? reviews.length} reviews)</span>
              </p>
            ) : null}

            <div className={styles.priceRow}>
              <span className={styles.price}>
                {selectedVariant || optionNames.length === 0
                  ? price > 0
                    ? formatPrice(price)
                    : "Price unavailable"
                  : formatPriceRange(product.price, product.priceMax)}
              </span>

              {oldPrice && <del className={styles.oldPrice}>{formatPrice(oldPrice)}</del>}
            </div>

            {product.description && <p className={styles.description}>{product.description}</p>}

            {/* VARIANT SELECTORS */}

            {optionNames.map((name) => (
              <div className={styles.optionGroup} key={name}>
                <h2>{name[0].toUpperCase() + name.slice(1)}</h2>

                <div className={styles.optionValues}>
                  {optionValues(name).map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={selection[name] === value ? styles.activeOption : undefined}
                      disabled={!isSelectable(name, value)}
                      onClick={() => {
                        setSelection((current) => ({ ...current, [name]: value }));
                        setActiveImage(0);
                        setCartMessage("");
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* STOCK */}

            <p className={styles.stock}>
              {!ready
                ? "Select an option to see availability"
                : outOfStock
                  ? "Out of stock"
                  : stockStatus === "low_stock"
                    ? "Low stock"
                    : stockStatus === "in_stock"
                      ? "In stock"
                      : ""}
            </p>

            {/* QUANTITY */}

            <div className={styles.optionGroup}>
              <h2>Quantity</h2>

              <div className={styles.quantity}>
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  <Minus size={14} />
                </button>

                <span>{quantity}</span>

                <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)}>
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* ACTIONS */}

            <div className={styles.actions}>
              <button type="button" className={styles.addToCart} disabled={disabled || pending !== null} aria-busy={pending === "cart"} onClick={() => void handleAddToCart()}>
                {pending === "cart" ? <><LoaderCircle className="button-spinner" size={16} aria-hidden="true" /> Adding…</> : ready ? "Add to cart" : "Select options"}
              </button>

              <button type="button" className={styles.buyNow} disabled={disabled || pending !== null} onClick={handleBuyNow}>
                Buy now
              </button>

              <button
                type="button"
                className={`${styles.wishlist} ${saved ? styles.savedWishlist : ""}`}
                disabled={!ready || pending !== null}
                aria-busy={pending === "wishlist"}
                aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => void handleWishlist()}
              >
                {pending === "wishlist"
                  ? <LoaderCircle className="button-spinner" size={18} aria-hidden="true" />
                  : <Heart size={18} fill={saved ? "currentColor" : "none"} />}
              </button>
            </div>

            {cartMessage && (
              <p role="status" className={styles.cartMessage}>
                {cartMessage} <Link href="/cart">View cart</Link>
              </p>
            )}
          </div>
        </div>

        {/* =================================================
            REVIEWS
        ================================================= */}

        <section className={styles.reviews}>
          <div className={styles.reviewsHeader}>
            <h2>Reviews ({product.reviewsCount ?? reviews.length})</h2>

            {customer ? (
              <button type="button" className={styles.writeReview} onClick={() => setReviewOpen((open) => !open)}>
                Write a review
              </button>
            ) : (
              <Link href="/auth" className={styles.writeReview}>
                Sign in to review
              </Link>
            )}
          </div>

          {reviewOpen && customer && (
            <form
              className={styles.reviewForm}
              onSubmit={async (event) => {
                event.preventDefault();
                try {
                  const result = await storefrontRequest<{ message: string }>(`products/${product.id}/reviews`, {
                    method: "POST",
                    body: JSON.stringify({ rating: reviewRating, review: reviewText }),
                  });
                  setReviewMessage(result.message);
                  setReviewText("");
                  setReviewOpen(false);
                } catch (reason) {
                  setReviewMessage(reason instanceof Error ? reason.message : "Review submission failed.");
                }
              }}
            >
              <label>
                Rating
                <select value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
                  {Array.from({ length: 10 }, (_, index) => (index + 1) / 2).map((rating) => (
                    <option value={rating} key={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Review
                <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} maxLength={1000} required />
              </label>

              <button type="submit">Submit review</button>
            </form>
          )}

          {reviewMessage && <p role="status">{reviewMessage}</p>}

          {reviews.length > 0 ? (
            <ul className={styles.reviewList}>
              {reviews.map((review) => (
                <li key={review.id}>
                  <div className={styles.reviewTop}>
                    <strong>{review.name}</strong>
                    <span>{review.date}</span>
                  </div>

                  <div className={styles.reviewStars}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} size={13} fill={index < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>

                  <p>{review.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noReviews}>No reviews yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
