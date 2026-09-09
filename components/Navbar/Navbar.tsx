"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import type { ApiCategory } from "@/types/api";

import styles from "./Navbar.module.css";

import { ChevronDown, LoaderCircle, Menu, Search, UserRound, Heart, ShoppingBag, X } from "lucide-react";

type NavbarProps = {
  categories: ApiCategory[];
  hasSale: boolean;
};

export default function Navbar({ categories, hasSale }: NavbarProps) {
  const pathname = usePathname();
  const { cartCount, loading: cartLoading } = useCart();
  const { items: wishlistItems, loading: wishlistLoading } = useWishlist();
  const { customer, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeDropdowns = (event: PointerEvent) => {
      headerRef.current?.querySelectorAll("details[open]").forEach((menu) => {
        if (!menu.contains(event.target as Node)) menu.removeAttribute("open");
      });
    };
    document.addEventListener("pointerdown", closeDropdowns);
    return () => document.removeEventListener("pointerdown", closeDropdowns);
  }, []);

  const linkClass = (href: string) =>
    pathname === href ? `${styles.navLink} ${styles.activeNav}` : styles.navLink;

  return (
    <header className={styles.siteHeader} ref={headerRef}>
      <div className={styles.headerContainer}>
        {/* =================================================
            MENU
        ================================================= */}

        <button
          type="button"
          className={styles.menuButton}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={22} strokeWidth={1.6} />
        </button>

        {/* =================================================
            LOGO
        ================================================= */}

        <Link href="/" className={styles.headerLogo}>
          <Image src="/image/holier-logo.png" alt="Holier" width={140} height={50} priority />
        </Link>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className={styles.headerNav}>
          <Link href="/shop" className={linkClass("/shop")}>
            Shop
          </Link>

          {categories.length > 0 && (
            <details className={styles.dropdown}>
              <summary className={linkClass("/categories")}>
                Categories
                <ChevronDown size={14} strokeWidth={1.6} />
              </summary>

              <div className={styles.categoryPanel}>
                {categories.map((category) => (
                  <Link key={category.id} href={`/shop?category_id=${category.id}`} onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>
                    {category.category_name}
                  </Link>
                ))}

                <Link href="/categories" className={styles.panelFooterLink} onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>
                  All categories
                </Link>
              </div>
            </details>
          )}

          {hasSale && (
            <Link href="/sale" className={linkClass("/sale")}>
              Sale
            </Link>
          )}
        </nav>

        {/* =================================================
            ACTION ICONS
        ================================================= */}

        <div className={styles.headerActions}>
          {/* SEARCH */}

          <details className={styles.dropdown}>
            <summary aria-label="Search" className={styles.iconSummary}>
              <Search size={20} strokeWidth={1.6} />
            </summary>

            <form className={styles.searchPanel} action="/shop">
              <input name="q" type="search" placeholder="Search products" aria-label="Search products" />
              <button type="submit">Search</button>
            </form>
          </details>

          {/* ACCOUNT */}

          <details className={styles.dropdown}>
            <summary aria-label="Account" className={styles.iconSummary}>
              <UserRound size={20} strokeWidth={1.6} />
            </summary>

            <div className={styles.accountPanel}>
              {customer ? (
                <>
                  <Link href="/account" onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>My account</Link>
                  <button type="button" onClick={(event) => {
                    event.currentTarget.closest("details")?.removeAttribute("open");
                    void logout();
                  }}>
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/auth" onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}>Sign in</Link>
              )}
            </div>
          </details>

          {/* WISHLIST */}

          <Link href="/wishlist" aria-label="Wishlist" className={styles.iconLink}>
            <Heart size={20} strokeWidth={1.6} />

            {wishlistLoading
              ? <LoaderCircle className={`${styles.badgeLoader} button-spinner`} aria-hidden="true" />
              : wishlistItems.length > 0 && <span className={styles.badge}>{wishlistItems.length}</span>}
          </Link>

          {/* CART */}

          <Link href="/cart" aria-label="Cart" className={styles.iconLink}>
            <ShoppingBag size={20} strokeWidth={1.6} />

            {cartLoading
              ? <LoaderCircle className={`${styles.badgeLoader} button-spinner`} aria-hidden="true" />
              : cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* =====================================================
          MOBILE SIDEBAR
      ===================================================== */}

      {menuOpen && (
        <>
          <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />

          <aside className={styles.sideMenu}>
            <div className={styles.sideMenuHeader}>
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <Image src="/image/holier-logo.png" alt="Holier" width={100} height={36} />
              </Link>

              <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <X size={22} strokeWidth={1.6} />
              </button>
            </div>

            <form className={styles.sideSearch} action="/shop" onSubmit={() => setMenuOpen(false)}>
              <input name="q" type="search" placeholder="Search products" aria-label="Search products" />
            </form>

            <nav className={styles.sideMenuNav}>
              <Link href="/shop" onClick={() => setMenuOpen(false)}>
                Shop
              </Link>

              {hasSale && (
                <Link href="/sale" onClick={() => setMenuOpen(false)}>
                  Sale
                </Link>
              )}
            </nav>

            {categories.length > 0 && (
              <div className={styles.sideCategories}>
                <span className="eyebrow">Categories</span>

                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/shop?category_id=${category.id}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {category.category_name}
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </>
      )}
    </header>
  );
}
