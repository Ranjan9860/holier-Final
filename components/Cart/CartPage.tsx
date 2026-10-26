"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { LoaderCircle, Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/context/CartContext";
import PageLoader from "@/components/PageLoader";
import EmptyCollection from "./EmptyCollection";

import styles from "./CartPage.module.css";

export default function CartPage() {
  const [pending, setPending] = useState<string | null>(null);
  const {
    cart,
    cartCount,
    cartTotal,
    summary,
    error,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const run = async (key: string, action: () => Promise<void>) => {
    setPending(key);
    try { await action(); } finally { setPending(null); }
  };

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (loading && cart.length === 0) {
    return <PageLoader />;
  }

  if (cart.length === 0) {
    return (
      <EmptyCollection
        title="Your cart is empty"
        description="Looks like you haven't added anything to your cart yet."
        error={error}
      />
    );
  }

  return (
    <main className={styles.cartPage}>
      <div className={styles.container}>
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className={styles.pageHeader}>
          <div>
            <h1>Shopping Cart</h1>
            <p>{cartCount} {cartCount === 1 ? "item" : "items"} in your cart</p>
            {error && <p role="alert">{error}</p>}
          </div>

        </div>

        {/* =================================================
            CART TABLE
        ================================================= */}

        <div className={styles.cartContent}>
          <div className={styles.cartTableWrapper}>
          <table className={styles.cartTable}>
            {/* =================================================
                TABLE HEADER
            ================================================= */}

            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Item total (incl. VAT)</th>
                <th>Action</th>
              </tr>
            </thead>

            {/* =================================================
                TABLE BODY
            ================================================= */}

            <tbody>
              {cart.map((item) => (
                <tr
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                >
                  {/* PRODUCT */}

                  <td>
                    <div className={styles.productCell}>
                      <div className={styles.productImage}>
                        <Image
                          src={item.images[0] || "/image/products/placeholder.svg"}
                          alt={item.title}
                          fill
                          sizes="100px"
                          unoptimized
                        />
                      </div>

                      <div className={styles.productInfo}>
                        <Link href={`/product/${item.productId}`}><h3>{item.title}</h3></Link>

                        {item.selectedColor && (
                          <span>Color: {item.selectedColor}</span>
                        )}

                        {item.selectedSize && (
                          <span>Size: {item.selectedSize}</span>
                        )}

                        {typeof item.promotion === "object" && item.promotion !== null && "name" in item.promotion && (
                          <span>{String(item.promotion.name)}</span>
                        )}

                        {item.discountAmount > 0 && (
                          <span className={styles.itemDiscount}>Discount: − Rs. {item.discountAmount.toLocaleString()}</span>
                        )}

                        {!item.inStock && <span>Currently unavailable</span>}
                      </div>
                    </div>
                  </td>

                  {/* PRICE */}

                  <td>
                    <span className={styles.price}>
                      Rs. {item.unitPrice.toLocaleString()}
                    </span>
                  </td>

                  {/* QUANTITY */}

                  <td>
                    <div className={styles.quantityBox}>
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={pending !== null}
                        onClick={() => void run(`decrease-${item.id}`, () => updateQuantity(item.id, item.quantity - 1))}
                      >
                        {pending === `decrease-${item.id}` ? <LoaderCircle className="button-spinner" size={14} /> : <Minus size={14} />}
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        disabled={pending !== null}
                        onClick={() => void run(`increase-${item.id}`, () => updateQuantity(item.id, item.quantity + 1))}
                      >
                        {pending === `increase-${item.id}` ? <LoaderCircle className="button-spinner" size={14} /> : <Plus size={14} />}
                      </button>
                    </div>
                  </td>

                  {/* SUBTOTAL */}

                  <td>
                    <span className={styles.subtotal}>
                      Rs. {item.lineTotal.toLocaleString()}
                    </span>
                  </td>

                  {/* ACTION */}

                  <td>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      aria-label={`Remove ${item.title}`}
                      disabled={pending !== null}
                      onClick={() => void run(`remove-${item.id}`, () => removeFromCart(item.id))}
                    >
                      {pending === `remove-${item.id}` ? <LoaderCircle className="button-spinner" size={18} /> : <Trash2 size={18} strokeWidth={1.5} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

        {/* =================================================
            CART TOTALS
        ================================================= */}

          <div className={styles.totalsWrapper}>
            <div className={styles.cartTotals}>
            <div className={styles.totalsHeader}>
              <h2>Cart Totals</h2>
              <button
                type="button"
                className={styles.clearCartButton}
                disabled={pending !== null}
                onClick={() => void run("clear", clearCart)}
              >
                {pending === "clear" ? <><LoaderCircle className="button-spinner" size={15} /> Clearing…</> : "Clear Cart"}
              </button>
            </div>

            <table>
              <tbody>
                {/* SUBTOTAL */}

                <tr>
                  <td>Subtotal (excl. VAT)</td>

                  <td>Rs. {summary.subtotal.toLocaleString()}</td>
                </tr>

                {summary.discountAmount > 0 && (
                  <tr><td>Discount</td><td>- Rs. {summary.discountAmount.toLocaleString()}</td></tr>
                )}

                <tr><td>VAT</td><td>Rs. {summary.taxAmount.toLocaleString()}</td></tr>

                <tr><td>Shipping</td><td>Calculated at checkout</td></tr>

                {/* TOTAL */}

                <tr>
                  <td>Total</td>

                  <td>Rs. {cartTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            {/* CHECKOUT */}

            <Link href="/checkout" className={styles.checkoutButton}>
              Proceed to Checkout
            </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
