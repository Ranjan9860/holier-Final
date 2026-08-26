"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";

import styles from "./ProductDetail.module.css";

import { Product } from "@/types/product";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

type ProductDetailProps = {
  product: Product;
};

export default function ProductDetail({ product }: ProductDetailProps) {
  /* =======================================================
     CART + WISHLIST
  ======================================================= */

  const { addToCart } = useCart();

  const { toggleWishlist, isInWishlist } = useWishlist();

  /* =======================================================
     STATES
  ======================================================= */

  const [activeImage, setActiveImage] = useState(0);

  const [selectedColor, setSelectedColor] = useState(product.colors[0]);

  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);

  const [quantity, setQuantity] = useState(1);

  const [activeTab, setActiveTab] = useState<
    "description" | "features" | "reviews"
  >("description");

  /* =======================================================
     REVIEWS
  ======================================================= */

  const reviews = product.reviews || [];

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  /* =======================================================
     WISHLIST
  ======================================================= */

  const handleWishlist = () => {
    toggleWishlist(product.id);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className={styles.productDetailSection}>
      <div className={styles.container}>
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className={styles.breadcrumb}>
          <span>Home</span>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className={styles.current}>{product.title}</span>
        </div>

        {/* =================================================
            MAIN PRODUCT
        ================================================= */}

        <div className={styles.productMain}>
          {/* =================================================
              IMAGE SECTION
          ================================================= */}

          <div className={styles.imageSection}>
            <div className={styles.imageLayout}>
              {/* THUMBNAILS */}

              <div className={styles.thumbnails}>
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`${styles.thumbnail} ${
                      activeImage === index ? styles.activeThumbnail : ""
                    }`}
                    onClick={() => setActiveImage(index)}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      fill
                      sizes="100px"
                      className={styles.mainProductImage}
                    />
                  </button>
                ))}
              </div>

              {/* MAIN IMAGE */}

              <div className={styles.mainImageWrapper}>
                <div className={styles.mainImage}>
                  <Image
                    src={product.images[activeImage]}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 480px"
                    className={styles.mainProductImage}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <div className={styles.productInfo}>
            <p className={styles.category}>{product.category}</p>

            <h1>{product.title}</h1>

            {/* PRICE */}

            <div className={styles.priceArea}>
              <span className={styles.price}>Rs {product.price}</span>

              {product.oldPrice && (
                <span className={styles.oldPrice}>Rs {product.oldPrice}</span>
              )}
            </div>

            {/* DESCRIPTION */}

            <p className={styles.shortDescription}>{product.description}</p>

            {/* COLOR */}

            <div className={styles.optionGroup}>
              <h3>Color</h3>

              <div className={styles.colorOptions}>
                {product.colors.map((color, index) => (
                  <button
                    key={color}
                    type="button"
                    className={`${styles.colorOption} ${
                      selectedColor === color ? styles.activeColor : ""
                    }`}
                    style={{
                      backgroundColor: color,
                    }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={`Select color ${
                      product.colorNames?.[index] || color
                    }`}
                    title={product.colorNames?.[index] || color}
                  />
                ))}
              </div>
            </div>

            {/* SIZE */}

            <div className={styles.optionGroup}>
              <div className={styles.sizeHeader}>
                <h3>Size</h3>

                <button type="button" className={styles.sizeGuide}>
                  Size Guide
                </button>
              </div>

              <div className={styles.sizeOptions}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`${styles.sizeButton} ${
                      selectedSize === size ? styles.activeSize : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTITY */}

            <div className={styles.optionGroup}>
              <h3>Quantity</h3>

              <div className={styles.quantity}>
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() =>
                    setQuantity((current) => Math.max(1, current - 1))
                  }
                >
                  <Minus size={14} />
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((current) => current + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className={styles.actions}>
              {/* ADD TO CART */}

              <button
                type="button"
                className={styles.addToCart}
                onClick={handleAddToCart}
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>

              {/* BUY NOW */}

              <button type="button" className={styles.buyNow}>
                <ShoppingBag size={16} />
                Buy Now
              </button>

              {/* WISHLIST */}

              <button
                type="button"
                className={`${styles.wishlistButton} ${
                  isInWishlist(product.id) ? styles.activeWishlist : ""
                }`}
                aria-label={
                  isInWishlist(product.id)
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                onClick={handleWishlist}
              >
                <Heart
                  size={18}
                  fill={isInWishlist(product.id) ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* SHIPPING */}

            <div className={styles.shippingInfo}>
              <div>
                <strong>Free Shipping</strong>

                <span>On orders over Rs 5000</span>
              </div>

              <div>
                <strong>Easy Returns</strong>

                <span>7 days return policy</span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            PRODUCT TABS
        ================================================= */}

        <div className={styles.detailsSection}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabButton} ${
                activeTab === "description" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>

            <button
              type="button"
              className={`${styles.tabButton} ${
                activeTab === "features" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("features")}
            >
              Key Features
            </button>

            <button
              type="button"
              className={`${styles.tabButton} ${
                activeTab === "reviews" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className={styles.tabContent}>
            {/* DESCRIPTION */}

            {activeTab === "description" && (
              <div className={styles.tabPanel}>
                <h3>Product Description</h3>

                <p>{product.description}</p>
              </div>
            )}

            {/* FEATURES */}

            {activeTab === "features" && (
              <div className={styles.tabPanel}>
                <h3>Key Features</h3>

                <ul className={styles.featuresList}>
                  {product.keyFeatures.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* REVIEWS */}

            {activeTab === "reviews" && (
              <div className={styles.tabPanel}>
                <div className={styles.reviewHeader}>
                  <div>
                    <h3>Customer Reviews</h3>

                    <div className={styles.reviewSummary}>
                      <span className={styles.averageRating}>4.5</span>

                      <div>
                        <div className={styles.stars}>
                          {Array.from({
                            length: 5,
                          }).map((_, index) => (
                            <Star
                              key={index}
                              size={15}
                              fill={index < 4 ? "currentColor" : "none"}
                            />
                          ))}
                        </div>

                        <span>Based on {reviews.length} reviews</span>
                      </div>
                    </div>
                  </div>

                  <button type="button" className={styles.writeReviewButton}>
                    Write a Review
                  </button>
                </div>

                {reviews.length > 0 ? (
                  <div className={styles.reviewList}>
                    {reviews.map((review) => (
                      <div key={review.id} className={styles.reviewItem}>
                        <div className={styles.reviewTop}>
                          <div>
                            <strong>{review.name}</strong>

                            <div className={styles.reviewStars}>
                              {Array.from({
                                length: 5,
                              }).map((_, index) => (
                                <Star
                                  key={index}
                                  size={13}
                                  fill={
                                    index < review.rating
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          <span>{review.date}</span>
                        </div>

                        <p>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noReviews}>
                    <p>No reviews yet. Be the first to review this product.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            SIMILAR PRODUCTS
        ================================================= */}

        {product.similarProducts && product.similarProducts.length > 0 && (
          <section className={styles.similarProductsSection}>
            <div className={styles.sectionHeading}>
              <h2>Similar Products</h2>
              <span />
            </div>

            <div className={styles.similarProductsGrid}>
              {product.similarProducts.map((similarProduct) => (
                <div
                  key={similarProduct.id}
                  className={styles.similarProductCard}
                >
                  <div className={styles.similarProductImage}>
                    <Image
                      src={similarProduct.image}
                      alt={similarProduct.title}
                      fill
                      sizes="300px"
                    />

                    <button
                      type="button"
                      className={styles.similarWishlist}
                      aria-label="Add to wishlist"
                      onClick={() => toggleWishlist(similarProduct.id)}
                    >
                      <Heart
                        size={17}
                        fill={
                          isInWishlist(similarProduct.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>

                  <div className={styles.similarProductInfo}>
                    <span className={styles.similarCategory}>
                      {similarProduct.category}
                    </span>

                    <h3>{similarProduct.title}</h3>

                    <div className={styles.similarPrice}>
                      <span>Rs {similarProduct.price}</span>

                      {similarProduct.oldPrice && (
                        <del>Rs {similarProduct.oldPrice}</del>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
