import Image from "next/image";
import Link from "next/link";

import ProductCard from "@/components/ProductCard/ProductCard";
import FlashSaleTimer from "@/components/Catalog/FlashSaleTimer";
import type { ApiCategory } from "@/types/api";
import type { Product } from "@/types/product";
import { categoryPath } from "@/lib/catalog";

import styles from "./Home.module.css";

/* =========================================================
   SHOP BY CATEGORY
========================================================= */

export function CategoryGrid({ categories, limit }: { categories: ApiCategory[]; limit?: number }) {
  const shown = limit ? categories.slice(0, limit) : categories;
  if (shown.length === 0) return null;

  return (
    <div className={styles.categoryGrid}>
      {shown.map((category) => (
        <Link
          key={category.id}
          href={categoryPath(category)}
          className={styles.categoryCard}
        >
          <div className={styles.categoryImage}>
            {category.category_image ? (
              <Image
                src={category.category_image}
                alt={category.category_name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className={styles.cover}
                unoptimized
              />
            ) : (
              <span className={styles.categoryInitial}>{category.category_name.charAt(0)}</span>
            )}
          </div>

          <h3>{category.category_name}</h3>

          {category.product_count !== undefined && (
            <span className={styles.categoryCount}>{category.product_count} products</span>
          )}
        </Link>
      ))}
    </div>
  );
}

/* =========================================================
   SECTION WRAPPER
========================================================= */

export function Section({
  title,
  eyebrow,
  link,
  linkLabel,
  children,
}: {
  title: string;
  eyebrow?: React.ReactNode;
  link?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
          </div>

          {link && (
            <Link href={link} className={styles.sectionLink}>
              {linkLabel || "View all"}
            </Link>
          )}
        </div>

        {children}
      </div>
    </section>
  );
}

/* =========================================================
   PRODUCT GRID SECTION
========================================================= */

export function ProductSection({
  title,
  eyebrow,
  products,
  link,
  linkLabel,
}: {
  title: string;
  eyebrow?: string;
  products: Product[];
  link?: string;
  linkLabel?: string;
}) {
  if (products.length === 0) return null;

  return (
    <Section title={title} eyebrow={eyebrow} link={link} linkLabel={linkLabel}>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}

/* =========================================================
   EDITORIAL CAMPAIGN
   Brand content, static until the backend manages banners.
========================================================= */

/* =========================================================
   ACTIVE SALE
========================================================= */

export function SaleSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const sale = products[0].sale;

  return (
    <Section
      title={sale?.name || "Sale"}
      eyebrow={<FlashSaleTimer endsAt={sale?.endsAt} />}
      link="/sale"
      linkLabel="All sale items"
    >
      <div className="product-grid">
        {products.slice(0, 8).map((product) => (
          <ProductCard key={`${product.id}-${product.sale?.variantId || "base"}`} product={product} />
        ))}
      </div>
    </Section>
  );
}
