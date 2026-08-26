"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Search, ShoppingBag } from "lucide-react";

import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import ProductImageModal from "../ProductImageModal/ProductImageModal";

import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Product;
  onZoom: (product: Product) => void;
  viewMode?: "grid" | "list";
};

export default function ProductCard({
  product,
  onZoom,
  viewMode = "grid",
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [zoomProduct, setZoomProduct] = useState<Product | null>(null);

  /* =====================================================
     LIST VIEW
  ===================================================== */

  if (viewMode === "list") {
    return (
      <article className={styles.listCard}>
        {/* =================================================
            LEFT - PRODUCT IMAGE
        ================================================= */}

        <div className={styles.listImageWrapper}>
          <Link
            href={`/product/${product.id}`}
            className={styles.productImageLink}
          >
            <Image
              src={product.image}
              alt={product.title}
              width={800}
              height={600}
              sizes="(max-width: 768px) 50vw, 20vw"
              className={styles.productImage}
            />
          </Link>
        </div>

        {/* =================================================
            CENTER - PRODUCT INFORMATION
        ================================================= */}

        <div className={styles.listInfo}>
          {/* Category */}

          <p className={styles.listCategory}>
            {product.category || "COLLECTION"}
          </p>

          {/* Title */}

          <Link
            href={`/product/${product.id}`}
            className={styles.productTitleLink}
          >
            <h3 className={styles.productTitle}>{product.title}</h3>
          </Link>

          {/* Color */}

          <div className={styles.listColorRow}>
            <span className={styles.listLabel}>Color:</span>

            <div className={styles.listColors}>
              {product.colors.map((color, index) => (
                <span
                  key={`${product.id}-list-color-${index}`}
                  className={styles.listColor}
                  style={{
                    backgroundColor: color,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Available Sizes */}

          <div className={styles.listSizeRow}>
            <span className={styles.listLabel}>Available Size:</span>

            <div className={styles.listSizes}>
              {product.sizes.map((size) => (
                <span
                  key={`${product.id}-list-size-${size}`}
                  className={styles.listSize}
                >
                  {size}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}

          <div className={styles.listDescription}>
            <span className={styles.listLabel}>Description</span>

            <p>
              {product.description ||
                "A premium product designed with comfort, quality and modern style in mind."}
            </p>
          </div>

          {/* Key Features */}

          <div className={styles.listFeatures}>
            <span className={styles.listLabel}>Key Features</span>

            <ul>
              {(
                product.keyFeatures || [
                  "Premium quality",
                  "Comfortable fit",
                  "Modern design",
                ]
              ).map((feature, index) => (
                <li key={`${product.id}-feature-${index}`}>{feature}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* =================================================
            RIGHT - ACTIONS / PRICE / CART
        ================================================= */}

        <div className={styles.listActions}>
          {/* Zoom + Wishlist */}

          <div className={styles.listActionButtons}>
            {/* Zoom */}

            <button
              type="button"
              aria-label="Zoom product image"
              onClick={(event) => {
                event.stopPropagation();
                onZoom?.(product);
              }}
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            {/* Wishlist */}

            <button
              type="button"
              aria-label={
                isInWishlist(product.id)
                  ? "Remove from wishlist"
                  : "Add to wishlist"
              }
              onClick={(event) => {
                event.stopPropagation();
                toggleWishlist(product.id);
              }}
            >
              <Heart
                size={19}
                strokeWidth={1.5}
                fill={isInWishlist(product.id) ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Price */}

          <div className={styles.listPriceArea}>
            <span className={styles.listPrice}>Rs {product.price}</span>

            {product.oldPrice && (
              <span className={styles.listOldPrice}>Rs {product.oldPrice}</span>
            )}
          </div>

          {/* Add To Cart */}

          <button
            type="button"
            className={styles.listAddToCart}
            onClick={() => addToCart(product)}
          >
            <ShoppingBag size={17} strokeWidth={1.5} />

            <span>Add to Cart</span>
          </button>
        </div>
      </article>
    );
  }

  /* =====================================================
     GRID VIEW
  ===================================================== */

  return (
    <article className={styles.productCard}>
      {/* =================================================
          PRODUCT IMAGE
      ================================================= */}

      <div className={styles.imageWrapper}>
        <Link
          href={`/product/${product.id}`}
          className={styles.productImageLink}
        >
          <Image
            src={product.image}
            alt={product.title}
            width={800}
            height={600}
            sizes="(max-width: 768px) 50vw, 20vw"
            className={styles.productImage}
          />
        </Link>

        {/* =================================================
            PRODUCT ACTIONS
        ================================================= */}

        <div className={styles.productActions}>
          {/* Wishlist */}

          <button
            type="button"
            className={styles.actionButton}
            aria-label={
              isInWishlist(product.id)
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            onClick={(event) => {
              event.stopPropagation();
              toggleWishlist(product.id);
            }}
          >
            <Heart
              size={18}
              strokeWidth={1.5}
              fill={isInWishlist(product.id) ? "currentColor" : "none"}
            />
          </button>

          {/* Zoom */}

          <button
            type="button"
            className={styles.actionButton}
            aria-label="Zoom product image"
            onClick={(event) => {
              event.stopPropagation();
              onZoom?.(product);
            }}
          >
            <Search size={17} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* =================================================
          PRODUCT INFORMATION
      ================================================= */}

      <div className={styles.productInfo}>
        {/* Title */}

        <Link
          href={`/product/${product.id}`}
          className={styles.productTitleLink}
        >
          <h3 className={styles.productTitle}>{product.title}</h3>
        </Link>

        {/* Colors */}

        <div className={styles.colors}>
          {product.colors.map((color, index) => (
            <span
              key={`${product.id}-color-${index}`}
              className={styles.color}
              style={{
                backgroundColor: color,
              }}
            />
          ))}
        </div>

        {/* Sizes */}

        <p className={styles.sizes}>Size: {product.sizes.join(" | ")}</p>

        {/* =================================================
            PRICE / ADD TO CART
        ================================================= */}

        <div className={styles.priceArea}>
          {/* Normal Price */}

          <div className={styles.priceWrapper}>
            <span className={styles.price}>Rs {product.price}</span>

            {product.oldPrice && (
              <span className={styles.oldPrice}>Rs {product.oldPrice}</span>
            )}
          </div>

          {/* Add To Cart */}

          <button
            type="button"
            className={styles.addToCart}
            onClick={() => addToCart(product)}
          >
            <ShoppingBag size={16} strokeWidth={1.5} />

            <span>Add to Cart</span>
          </button>
        </div>
      </div>
      {zoomProduct && (
        <ProductImageModal
          image={zoomProduct.image}
          title={zoomProduct.title}
          onClose={() => {
            setZoomProduct(null);
          }}
        />
      )}
    </article>
  );
}
