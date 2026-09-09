"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import ProductCard from "@/components/ProductCard/ProductCard";
import type { ApiCategory, ApiMeta } from "@/types/api";
import type { ProductQuery } from "@/lib/catalog";
import type { Product } from "@/types/product";

import styles from "./Catalog.module.css";

type CatalogProps = {
  title: string;
  description?: string;
  products: Product[];
  meta?: ApiMeta;
  categories?: ApiCategory[];
  query?: ProductQuery;
  /** Where the filter form submits and pagination links point. */
  basePath: string;
  /** Off for listings the API cannot filter, sort, or paginate (flash sales). */
  controls?: boolean;
  empty?: ReactNode;
};

const sortOptions = [
  { value: "-created_at", label: "Newest" },
  { value: "ecommerce_selling_price", label: "Price: low to high" },
  { value: "-ecommerce_selling_price", label: "Price: high to low" },
];

export default function Catalog({
  title,
  description,
  products,
  meta,
  categories = [],
  query = {},
  basePath,
  controls = true,
  empty,
}: CatalogProps) {
  const total = meta?.total ?? products.length;
  const currentPage = meta?.current_page ?? 1;
  const lastPage = meta?.last_page ?? 1;

  const pageHref = (page: number) => {
    const params = new URLSearchParams(
      Object.entries(query).flatMap(([key, value]) => (value && key !== "page" ? [[key, String(value)]] : [])),
    );
    if (page > 1) params.set("page", String(page));
    return `${basePath}${params.size ? `?${params}` : ""}`;
  };

  const submit = (event: { currentTarget: { form: HTMLFormElement | null } }) =>
    event.currentTarget.form?.requestSubmit();

  return (
    <main className={styles.catalog}>
      <div className="container">
        <header className={styles.header}>
          <h1>{title}</h1>

          {description && <p className={styles.description}>{description}</p>}

          <p className={styles.count}>
            {total} {total === 1 ? "product" : "products"}
          </p>
        </header>

        <div className={controls ? styles.content : undefined}>
          {controls && (
            <form className={styles.controls} action={basePath}>
            <label className={styles.searchField}>
              <span className="eyebrow">Search</span>
              <input type="search" name="q" defaultValue={query.q || ""} placeholder="Search products" />
            </label>

            {categories.length > 0 && (
              <label>
                <span className="eyebrow">Category</span>
                <select name="category_id" defaultValue={query.category_id || ""} onChange={submit}>
                  <option value="">All categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className={styles.priceField}>
              <span className="eyebrow">Price</span>
              <div className={styles.priceInputs}>
                <input type="number" name="min_price" min="0" placeholder="Min" defaultValue={query.min_price || ""} />
                <input type="number" name="max_price" min="0" placeholder="Max" defaultValue={query.max_price || ""} />
              </div>
            </label>

            <label>
              <span className="eyebrow">Availability</span>
              <select name="availability" defaultValue={query.availability || ""} onChange={submit}>
                <option value="">All products</option>
                <option value="in_stock">In stock</option>
              </select>
            </label>

            <label>
              <span className="eyebrow">Sort</span>
              <select name="sort" defaultValue={query.sort || ""} onChange={submit}>
                <option value="">Default</option>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit" className={styles.apply}>
              Apply
            </button>

            <Link href={basePath} className={styles.reset}>
              Reset
            </Link>
            </form>
          )}

          <section>
            {products.length > 0 ? (
              <div className="product-grid">
                {products.map((product, index) => (
                  <ProductCard key={product.id} product={product} priority={index < 4} />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                {empty || (
                  <>
                    <h2>No products found</h2>
                    <p>Try a different search or clear the filters.</p>
                    <Link href={basePath} className={styles.emptyAction}>
                      Clear filters
                    </Link>
                  </>
                )}
              </div>
            )}

            {controls && lastPage > 1 && (
              <nav className={styles.pagination} aria-label="Pagination">
                {currentPage > 1 && <Link href={pageHref(currentPage - 1)}>Previous</Link>}

                <span>
                  Page {currentPage} of {lastPage}
                </span>

                {currentPage < lastPage && <Link href={pageHref(currentPage + 1)}>Next</Link>}
              </nav>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
