"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/context/CartContext";

import styles from "./CartPage.module.css";

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (cart.length === 0) {
    return (
      <main className={styles.emptyCart}>
        <div className={styles.emptyContent}>
          <h1>Your Cart is Empty</h1>

          <p>Looks like you haven't added anything to your cart yet.</p>

          <Link href="/shop" className={styles.shopButton}>
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.cartPage}>
      <div className={styles.container}>
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className={styles.pageHeader}>
          <h1>Shopping Cart</h1>

          <p>
            {cartCount} {cartCount === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {/* =================================================
            CART TABLE
        ================================================= */}

        <div className={styles.cartTableWrapper}>
          <table className={styles.cartTable}>
            {/* =================================================
                TABLE HEADER
            ================================================= */}

            <thead>
              <tr>
                <th>Product</th>
                <th>Product ID</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
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
                          src={item.images[0]}
                          alt={item.title}
                          fill
                          sizes="100px"
                        />
                      </div>

                      <div className={styles.productInfo}>
                        <h3>{item.title}</h3>

                        {item.selectedColor && (
                          <span>Color: {item.selectedColor}</span>
                        )}

                        {item.selectedSize && (
                          <span>Size: {item.selectedSize}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* PRODUCT ID */}

                  <td>
                    <span className={styles.productId}>
                      HL-{String(item.id).padStart(3, "0")}
                    </span>
                  </td>

                  {/* PRICE */}

                  <td>
                    <span className={styles.price}>
                      Rs. {item.price.toLocaleString()}
                    </span>
                  </td>

                  {/* QUANTITY */}

                  <td>
                    <div className={styles.quantityBox}>
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity - 1,
                            item.selectedSize,
                            item.selectedColor,
                          )
                        }
                      >
                        <Minus size={14} />
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            item.quantity + 1,
                            item.selectedSize,
                            item.selectedColor,
                          )
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </td>

                  {/* SUBTOTAL */}

                  <td>
                    <span className={styles.subtotal}>
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </td>

                  {/* ACTION */}

                  <td>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      aria-label={`Remove ${item.title}`}
                      onClick={() =>
                        removeFromCart(
                          item.id,
                          item.selectedSize,
                          item.selectedColor,
                        )
                      }
                    >
                      <Trash2 size={18} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* =================================================
            COUPON
        ================================================= */}

        <div className={styles.couponSection}>
          <div className={styles.couponBox}>
            <input
              type="text"
              placeholder="Enter coupon code"
              aria-label="Coupon code"
            />

            <button type="button">Apply Coupon</button>
          </div>

          <button
            type="button"
            className={styles.clearCartButton}
            onClick={clearCart}
          >
            Clear Cart
          </button>
        </div>

        {/* =================================================
            CART TOTALS
        ================================================= */}

        <div className={styles.totalsWrapper}>
          <div className={styles.cartTotals}>
            <h2>Cart Totals</h2>

            <table>
              <tbody>
                {/* SUBTOTAL */}

                <tr>
                  <td>Subtotal</td>

                  <td>Rs. {cartTotal.toLocaleString()}</td>
                </tr>

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
    </main>
  );
}
