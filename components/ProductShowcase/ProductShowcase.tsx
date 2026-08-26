"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import ProductCard from "../ProductCard/ProductCard";
import ProductImageModal from "../ProductImageModal/ProductImageModal";

import { Product } from "@/types/product";
import { products } from "@/data/products";
import { featuredProduct } from "@/data/featuredProduct";
import { useCart } from "@/context/CartContext";

import styles from "./ProductShowcase.module.css";

type ProductShowcaseProps = {
  reverse?: boolean;
};

export default function ProductShowcase({
  reverse = false,
}: ProductShowcaseProps) {
  /* =======================================================
     WISHLIST
  ======================================================= */

  /* =======================================================
     FEATURED IMAGE
  ======================================================= */

  const [activeImage, setActiveImage] = useState(0);

  /* =======================================================
     ZOOM
  ======================================================= */

  const [zoomProduct, setZoomProduct] = useState<Product | null>(null);

  const { addToCart } = useCart();

  /* =======================================================
     AUTOMATIC IMAGE SLIDER
  ======================================================= */

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveImage((prev) => {
        if (prev === featuredProduct.images.length - 1) {
          return 0;
        }

        return prev + 1;
      });
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className={styles.showcaseSection}>
      <div
        className={`${styles.showcaseContainer} ${
          reverse ? styles.reverse : ""
        }`}
      >
        {/* =================================================
            LEFT FEATURED PRODUCT
        ================================================= */}

        <div className={styles.featuredProduct}>
          {/* Main Image */}

          <div className={styles.featuredImage}>
            <Image
              src={featuredProduct.images[activeImage]}
              alt={featuredProduct.title}
              fill
              sizes="35vw"
              priority
            />
          </div>

          {/* Thumbnails */}

          <div className={styles.thumbnails}>
            {featuredProduct.images.map((image, index) => (
              <button
                key={image}
                type="button"
                className={`${styles.thumbnail} ${
                  activeImage === index ? styles.activeThumbnail : ""
                }`}
                onClick={() => setActiveImage(index)}
              >
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          {/* Product Information */}

          <div className={styles.featuredInfo}>
            <h2>{featuredProduct.title}</h2>

            <p>Size: {featuredProduct.sizes.join(" | ")}</p>
          </div>
        </div>

        {/* =================================================
            RIGHT PRODUCT GRID
        ================================================= */}

        <div className={styles.productsArea}>
          {/* Heading */}

          <div className={styles.productsHeading}>
            <h2>{reverse ? "NEW ARRIVALS" : "LINGERIE SET"}</h2>

            <div className={styles.headingLine} />
          </div>

          {/* Product Grid */}

          <div className={styles.productGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onZoom={setZoomProduct}
              />
            ))}
          </div>
        </div>
      </div>

      {/* =================================================
          IMAGE ZOOM MODAL
      ================================================= */}

      {zoomProduct && (
        <ProductImageModal
          image={zoomProduct.image}
          title={zoomProduct.title}
          onClose={() => {
            setZoomProduct(null);
          }}
        />
      )}
    </section>
  );
}
