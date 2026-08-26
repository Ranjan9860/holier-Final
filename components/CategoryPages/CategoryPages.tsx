"use client";

import { useState } from "react";
import { Grid2X2, List } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import ProductCard from "@/components/ProductCard/ProductCard";
import { products } from "@/data/products";
import { navigationItems } from "@/data/navigation";
import { filterProducts, ProductSort } from "@/utils/productFilters";

import styles from "./CategoryPages.module.css";

/* =========================================================
   COMPONENT
========================================================= */

export default function Shop() {
  const pathname = usePathname();

  /* =======================================================
     STATES
  ======================================================= */

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const [selectedColor, setSelectedColor] = useState<string>("all");

  const [sortBy, setSortBy] = useState<ProductSort>("default");

  /* =======================================================
     SIZE FILTER
  ======================================================= */

  const toggleSize = (size: string) => {
    setSelectedSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size],
    );
  };

  /* =======================================================
     CURRENT PAGE
  ======================================================= */

  const currentPage =
    navigationItems.find((item) => item.href === pathname) ||
    navigationItems[0];

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts = filterProducts({
    products,
    selectedSizes,
    selectedColor,
    sortBy,
  });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className={styles.shopSection}>
      <div className={styles.shopContainer}>
        {/* =================================================
            SHOP CONTENT
        ================================================= */}

        <div className={styles.shopContent}>
          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className={styles.sidebar}>
            {/* =============================================
                MAIN NAVIGATION
            ============================================= */}

            <div className={styles.sidebarNavigation}>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      isActive ? styles.activeNavigation : styles.navigationItem
                    }
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* =================================================
                SIZE
            ================================================= */}

            <div className={styles.filterGroup}>
              <h4>Size</h4>

              <label>
                <input
                  type="checkbox"
                  checked={selectedSizes.includes("S")}
                  onChange={() => toggleSize("S")}
                />
                S
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={selectedSizes.includes("M")}
                  onChange={() => toggleSize("M")}
                />
                M
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={selectedSizes.includes("L")}
                  onChange={() => toggleSize("L")}
                />
                L
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={selectedSizes.includes("XL")}
                  onChange={() => toggleSize("XL")}
                />
                XL
              </label>
            </div>

            {/* =================================================
                COLOR
            ================================================= */}

            <div className={styles.filterGroup}>
              <h4>Color</h4>

              <select
                value={selectedColor}
                onChange={(event) => setSelectedColor(event.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Colors</option>

                <option value="Black">Black</option>

                <option value="White">White</option>

                <option value="Blue">Blue</option>

                <option value="Pink">Pink</option>

                <option value="Grey">Grey</option>
              </select>
            </div>

            <button
              type="button"
              className={styles.resetFilters}
              onClick={() => {
                setSelectedSizes([]);
                setSelectedColor("all");
                setSortBy("default");
              }}
            >
              Reset Filters
            </button>

            {/* =================================================
                SIMILAR PRODUCTS
            ================================================= */}

            <div className={styles.similarProducts}>
              <h4>Similar Products</h4>

              {products.slice(0, 4).map((product) => (
                <div key={product.id} className={styles.similarProduct}>
                  {/* SMALL IMAGE */}
                  <div className={styles.similarProductImage}>
                    <img src={product.image} alt={product.title} />
                  </div>

                  {/* TITLE + PRICE */}
                  <div className={styles.similarProductInfo}>
                    <h5>{product.title}</h5>

                    <p>Rs {product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* =================================================
              PRODUCTS AREA
          ================================================= */}

          <div className={styles.productsArea}>
            {/* =================================================
                TOP BAR
            ================================================= */}

            <div className={styles.productsTop}>
              {/* =============================================
                  BREADCRUMB
              ============================================= */}

              <div className={styles.breadcrumb}>
                <span>Home</span>

                <span className={styles.breadcrumbSeparator}>/</span>

                <span className={styles.activePage}>{currentPage.name}</span>
              </div>

              {/* =============================================
                  PRODUCTS CONTROLS
              ============================================= */}

              <div className={styles.productsControls}>
                {/* PRODUCT COUNT */}

                <p>{filteredProducts.length} Products</p>

                {/* SORT */}

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value as ProductSort)
                  }
                >
                  <option value="default">Sort By</option>

                  <option value="low">Price: Low to High</option>

                  <option value="high">Price: High to Low</option>

                  <option value="new">Newest</option>
                </select>

                {/* =========================================
                    VIEW BUTTONS
                ========================================= */}

                <div className={styles.viewButtons}>
                  {/* GRID */}

                  <button
                    type="button"
                    className={viewMode === "grid" ? styles.activeView : ""}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <Grid2X2 size={18} />
                  </button>

                  {/* LIST */}

                  <button
                    type="button"
                    className={viewMode === "list" ? styles.activeView : ""}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================
                DIVIDER
            ================================================= */}

            <hr className={styles.sectionDivider} />

            {/* =================================================
                PRODUCT GRID
            ================================================= */}

            <div
              className={`
                ${styles.productGrid}
                ${viewMode === "list" ? styles.listView : ""}
              `}
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onZoom={() => {}}
                    viewMode={viewMode}
                  />
                ))
              ) : (
                <div className={styles.noProducts}>
                  <h3>No products found</h3>

                  <p>Try changing your filters.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
