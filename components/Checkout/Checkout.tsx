"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

import styles from "./Checkout.module.css";

const SHIPPING_COST = 100;

type PaymentMethod = "cod" | "esewa" | "ipsconnect";

export default function Checkout() {
  const { cart, cartTotal } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    country: "Nepal",
    orderNotes: "",
  });

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const totalAmount = cartTotal + SHIPPING_COST;

  const handlePlaceOrder = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("Order Information:", {
      customer: formData,
      paymentMethod,
      products: cart,
      subtotal: cartTotal,
      shipping: SHIPPING_COST,
      total: totalAmount,
    });

    alert("Order placed successfully!");
  };

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (cart.length === 0) {
    return (
      <section className={styles.checkoutSection}>
        <div className={styles.emptyCart}>
          <h1>Your cart is empty</h1>

          <p>
            You need to add products to your cart before proceeding to checkout.
          </p>

          <Link href="/shop" className={styles.shopButton}>
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.checkoutSection}>
      <div className={styles.checkoutContainer}>
        {/* =================================================
            PAGE TITLE
        ================================================= */}

        <div className={styles.pageHeading}>
          <h1>Checkout</h1>

          <p>Complete your order by providing your details below.</p>
        </div>

        {/* =================================================
            CHECKOUT GRID
        ================================================= */}

        <form className={styles.checkoutGrid} onSubmit={handlePlaceOrder}>
          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className={styles.billingSection}>
            {/* BILLING & SHIPPING */}

            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeading}>
                <h2>Billing & Shipping</h2>

                <p>Please enter your billing and shipping information.</p>
              </div>

              <div className={styles.formGrid}>
                {/* NAME */}

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="name">
                    Name <span>*</span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* PHONE */}

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="phone">
                    Phone Number <span>*</span>
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* ADDRESS */}

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="address">
                    Full Address <span>*</span>
                  </label>

                  <textarea
                    id="address"
                    name="address"
                    rows={4}
                    placeholder="Enter your complete address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* COUNTRY */}

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="country">
                    Country / Region <span>*</span>
                  </label>

                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  >
                    <option value="Nepal">Nepal</option>
                    <option value="India">India</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* =================================================
                ADDITIONAL INFORMATION
            ================================================= */}

            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeading}>
                <h2>Additional Information</h2>

                <p>Add any additional information about your order.</p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="orderNotes">Order Notes</label>

                <textarea
                  id="orderNotes"
                  name="orderNotes"
                  rows={6}
                  placeholder="Notes about your order, delivery instructions, etc."
                  value={formData.orderNotes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className={styles.orderSection}>
            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <div className={styles.orderBox}>
              <div className={styles.orderHeading}>
                <h2>Your Order</h2>
              </div>

              {/* TABLE HEADER */}

              <div className={styles.orderTableHeader}>
                <span>Product</span>

                <span>Subtotal</span>
              </div>

              {/* PRODUCTS */}

              <div className={styles.orderProducts}>
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                    className={styles.orderProduct}
                  >
                    <div className={styles.productName}>
                      <span>{item.title}</span>

                      <span className={styles.quantity}>× {item.quantity}</span>
                    </div>

                    <span className={styles.productSubtotal}>
                      Rs {item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* =================================================
                  TOTALS
              ================================================= */}

              <div className={styles.totalArea}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>

                  <strong>Rs {cartTotal}</strong>
                </div>

                <div className={styles.totalRow}>
                  <span>Shipment</span>

                  <strong>Rs {SHIPPING_COST}</strong>
                </div>

                <div className={styles.grandTotal}>
                  <span>Total</span>

                  <strong>Rs {totalAmount}</strong>
                </div>
              </div>
            </div>

            {/* =================================================
                PAYMENT
            ================================================= */}

            <div className={styles.paymentBox}>
              <div className={styles.orderHeading}>
                <h2>Payment Method</h2>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="paymentMethod">Select Payment Method</label>

                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value as PaymentMethod)
                  }
                >
                  <option value="cod">Cash on Delivery</option>

                  <option value="esewa">eSewa</option>

                  <option value="ipsconnect">IPS Connect</option>
                </select>
              </div>

              <button type="submit" className={styles.placeOrderButton}>
                Place Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
