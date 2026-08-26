"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

import styles from "./Navbar.module.css";

import { Menu, Search, UserRound, Heart, ShoppingBag, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.siteHeader}>
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
          <Menu size={22} strokeWidth={2.2} />
        </button>

        {/* =================================================
            LOGO
        ================================================= */}

        <Link href="/" className={styles.headerLogo}>
          <Image
            src="/image/holier-logo.png"
            alt="Holier"
            width={140}
            height={50}
            priority
          />
        </Link>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className={styles.headerSearch}>
          <input
            type="text"
            placeholder="Search products..."
            aria-label="Search products"
          />

          <button
            type="button"
            className={styles.searchButton}
            aria-label="Search"
          >
            <Search size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className={styles.headerNav}>
          <Link
            href="/shop"
            className={
              pathname === "/shop"
                ? `${styles.navLink} ${styles.activeNav}`
                : styles.navLink
            }
          >
            Shop
          </Link>

          <Link
            href="/new-arrivals"
            className={
              pathname === "/new-arrivals"
                ? `${styles.navLink} ${styles.activeNav}`
                : styles.navLink
            }
          >
            New Arrivals
          </Link>

          <Link
            href="/sale"
            className={
              pathname === "/sale"
                ? `${styles.navLink} ${styles.activeNav}`
                : styles.navLink
            }
          >
            Sale
          </Link>

          <Link
            href="/collections"
            className={
              pathname === "/collections"
                ? `${styles.navLink} ${styles.activeNav}`
                : styles.navLink
            }
          >
            Collections
          </Link>
        </nav>

        {/* =================================================
            ACTION ICONS
        ================================================= */}

        <div className={styles.headerActions}>
          {/* ACCOUNT */}

          <Link
            href="/account"
            aria-label="Account"
            className={styles.accountButton}
          >
            <UserRound size={21} strokeWidth={2.2} />
          </Link>

          {/* WISHLIST */}

          <Link
            href="/account?tab=wishlist"
            aria-label="Wishlist"
            className={styles.wishlistButton}
          >
            <Heart size={21} strokeWidth={2.2} />

            {wishlist.length > 0 && (
              <span className={styles.wishlistCount}>{wishlist.length}</span>
            )}
          </Link>

          {/* CART */}

          <Link href="/cart" aria-label="Cart" className={styles.cartButton}>
            <ShoppingBag size={22} />

            {cartCount > 0 && (
              <span className={styles.cartCount}>{cartCount}</span>
            )}
          </Link>
        </div>

        {/* =====================================================
    MOBILE SIDEBAR
===================================================== */}

        {menuOpen && (
          <>
            {/* Overlay */}
            <div
              className={styles.menuOverlay}
              onClick={() => setMenuOpen(false)}
            />

            {/* Sidebar */}
            <aside className={styles.sideMenu}>
              {/* Sidebar Header */}
              <div className={styles.sideMenuHeader}>
                <Link
                  href="/"
                  className={styles.sideMenuLogo}
                  onClick={() => setMenuOpen(false)}
                >
                  <Image
                    src="/image/holier-logo.png"
                    alt="Holier"
                    width={100}
                    height={50}
                  />
                </Link>

                <button
                  type="button"
                  className={styles.closeMenu}
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                >
                  <X size={24} strokeWidth={2} />
                </button>
              </div>

              {/* Navigation */}
              <nav className={styles.sideMenuNav}>
                <Link href="/new-arrivals" onClick={() => setMenuOpen(false)}>
                  New Arrivals
                </Link>

                <Link href="/shop" onClick={() => setMenuOpen(false)}>
                  Shop
                </Link>

                <Link href="/collections" onClick={() => setMenuOpen(false)}>
                  Collections
                </Link>

                <Link href="/sale" onClick={() => setMenuOpen(false)}>
                  Sale
                </Link>
              </nav>
            </aside>
          </>
        )}
      </div>
    </header>
  );
}
