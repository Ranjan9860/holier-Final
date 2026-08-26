"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Share2,
  Download,
  Trash2,
  CheckSquare,
  Square,
  X,
  Search,
  ShoppingBag,
} from "lucide-react";

import { defaultBillingInfo, orders } from "@/data/account";
import { products } from "@/data/products";
import { useSearchParams } from "next/navigation";

import styles from "./AccountDashboard.module.css";
import { useWishlist } from "@/context/WishlistContext";

export default function AccountDashboard() {
  /* =========================================
     TAB STATE
  ========================================= */

  const [activeTab, setActiveTab] = useState("dashboard");
  const { wishlist, toggleWishlist } = useWishlist();

  const searchParams = useSearchParams();
  const wishlistProducts = products.filter((product) =>
    wishlist.includes(product.id),
  );

  useEffect(() => {
    const tab = searchParams.get("tab");

    if (tab === "wishlist") {
      setActiveTab("wishlist");
    }
  }, [searchParams]);

  /* =========================================
     BILLING EDIT STATE
  ========================================= */

  const [isEditing, setIsEditing] = useState(false);

  /* =========================================
     BILLING INFORMATION
  ========================================= */

  const [billingInfo, setBillingInfo] = useState(defaultBillingInfo);

  /* =========================================
     WISHLIST SELECTED PRODUCTS
  ========================================= */

  const [selectedWishlist, setSelectedWishlist] = useState<number[]>([]);

  /* =========================================
     HANDLE INPUT
  ========================================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setBillingInfo((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================
     UPDATE BILLING
  ========================================= */

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsEditing(false);

    console.log("Updated Billing Information:", billingInfo);
  };

  /* =========================================
     CHANGE TAB
  ========================================= */

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsEditing(false);
  };

  /* =========================================
     WISHLIST SELECT / DESELECT
  ========================================= */

  const toggleWishlistSelection = (id: number) => {
    setSelectedWishlist((previous) => {
      if (previous.includes(id)) {
        return previous.filter((productId) => productId !== id);
      }

      return [...previous, id];
    });
  };

  /* =========================================
     SELECT ALL
  ========================================= */

  const handleSelectAllWishlist = () => {
    if (selectedWishlist.length === wishlistProducts.length) {
      setSelectedWishlist([]);
    } else {
      setSelectedWishlist(wishlistProducts.map((product) => product.id));
    }
  };

  /* =========================================
     DELETE SELECTED
  ========================================= */

  const handleDeleteSelectedWishlist = () => {
    selectedWishlist.forEach((id) => {
      if (wishlist.includes(id)) {
        toggleWishlist(id);
      }
    });

    setSelectedWishlist([]);
  };

  /* =========================================
     CLEAR SELECTION
  ========================================= */

  const handleClearWishlistSelection = () => {
    setSelectedWishlist([]);
  };

  /* =========================================
     SHARE WISHLIST
  ========================================= */

  const handleShareWishlist = () => {
    console.log("Share wishlist");
  };

  return (
    <section className={styles.dashboardSection}>
      <div className={styles.dashboardContainer}>
        {/* =========================================
            GREETING
        ========================================= */}

        <div className={styles.greeting}>
          <h1>Hello, Ranjan</h1>

          <p>Welcome to your dashboard</p>
        </div>

        {/* =========================================
            DASHBOARD NAVIGATION
        ========================================= */}

        <nav className={styles.dashboardNav}>
          <button
            type="button"
            className={activeTab === "dashboard" ? styles.activeTab : ""}
            onClick={() => handleTabChange("dashboard")}
          >
            My Dashboard
          </button>

          <button
            type="button"
            className={activeTab === "orders" ? styles.activeTab : ""}
            onClick={() => handleTabChange("orders")}
          >
            My Orders
          </button>

          <button
            type="button"
            className={activeTab === "wishlist" ? styles.activeTab : ""}
            onClick={() => handleTabChange("wishlist")}
          >
            Wishlist
          </button>

          <button
            type="button"
            className={activeTab === "password" ? styles.activeTab : ""}
            onClick={() => handleTabChange("password")}
          >
            Passwords
          </button>

          <button
            type="button"
            className={activeTab === "logout" ? styles.activeTab : ""}
            onClick={() => handleTabChange("logout")}
          >
            Logout
          </button>
        </nav>

        {/* =========================================
            DASHBOARD CONTENT
        ========================================= */}

        <div className={styles.dashboardContent}>
          {/* =====================================================
              MY DASHBOARD
          ===================================================== */}

          {activeTab === "dashboard" && (
            <div>
              <div className={styles.sectionHeading}>
                <h2>My Dashboard</h2>
              </div>

              {/* BILLING INFORMATION */}

              <div className={styles.billingSection}>
                <div className={styles.billingHeading}>
                  <h3>Billing Information</h3>
                </div>

                {/* VIEW BILLING */}

                {!isEditing && (
                  <>
                    <div className={styles.billingGrid}>
                      <div className={styles.infoItem}>
                        <span>Full Name</span>

                        <p>{billingInfo.fullName}</p>
                      </div>

                      <div className={styles.infoItem}>
                        <span>Email Address</span>

                        <p>{billingInfo.email}</p>
                      </div>

                      <div className={styles.infoItem}>
                        <span>Phone Number</span>

                        <p>{billingInfo.phone}</p>
                      </div>

                      <div className={styles.infoItem}>
                        <span>Address</span>

                        <p>{billingInfo.address}</p>
                      </div>

                      <div className={styles.infoItem}>
                        <span>Gender</span>

                        <p>{billingInfo.gender}</p>
                      </div>

                      <div className={styles.infoItem}>
                        <span>City</span>

                        <p>{billingInfo.city}</p>
                      </div>

                      <div className={styles.infoItem}>
                        <span>Region</span>

                        <p>{billingInfo.region}</p>
                      </div>

                      <div className={styles.infoItem}>
                        <span>Country</span>

                        <p>{billingInfo.country}</p>
                      </div>

                      <div className={styles.infoItem}>
                        <span>Postal Code</span>

                        <p>{billingInfo.postalCode}</p>
                      </div>
                    </div>

                    <div className={styles.bottomLine} />

                    <div className={styles.editButtonWrapper}>
                      <button
                        type="button"
                        className={styles.editButton}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Billing Information
                      </button>
                    </div>
                  </>
                )}

                {/* EDIT BILLING */}

                {isEditing && (
                  <form className={styles.billingForm} onSubmit={handleUpdate}>
                    <div className={styles.formGroup}>
                      <label htmlFor="fullName">Full Name</label>

                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={billingInfo.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email Address</label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={billingInfo.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="phone">Phone Number</label>

                      <input
                        id="phone"
                        name="phone"
                        type="text"
                        value={billingInfo.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="address">Address</label>

                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={billingInfo.address}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="gender">Gender</label>

                      <select
                        id="gender"
                        name="gender"
                        value={billingInfo.gender}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Gender</option>

                        <option value="Male">Male</option>

                        <option value="Female">Female</option>

                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="city">City</label>

                      <select
                        id="city"
                        name="city"
                        value={billingInfo.city}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select City</option>

                        <option value="Kathmandu">Kathmandu</option>

                        <option value="Bhaktapur">Bhaktapur</option>

                        <option value="Lalitpur">Lalitpur</option>

                        <option value="Pokhara">Pokhara</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="region">Region</label>

                      <input
                        id="region"
                        name="region"
                        type="text"
                        value={billingInfo.region}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="country">Country</label>

                      <select
                        id="country"
                        name="country"
                        value={billingInfo.country}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Country</option>

                        <option value="Nepal">Nepal</option>

                        <option value="India">India</option>

                        <option value="United States">United States</option>

                        <option value="United Kingdom">United Kingdom</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="postalCode">Postal Code</label>

                      <input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        value={billingInfo.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.formActions}>
                      <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>

                      <button type="submit" className={styles.updateButton}>
                        Update
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* =====================================================
              MY ORDERS
          ===================================================== */}

          {activeTab === "orders" && (
            <div className={styles.ordersSection}>
              <div className={styles.sectionHeading}>
                <h2>My Orders</h2>

                <p>Here you can view and manage all of your recent orders.</p>
              </div>

              <div className={styles.ordersTableWrapper}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Ordered On</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className={styles.orderProduct}>
                            <div className={styles.orderImage}>
                              <Image
                                src={order.image}
                                alt={order.productName}
                                width={80}
                                height={90}
                              />
                            </div>

                            <div className={styles.orderDetails}>
                              <span>{order.id}</span>

                              <h3>{order.productName}</h3>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className={styles.orderDate}>
                            {order.orderedOn}
                          </span>
                        </td>

                        <td>
                          <span className={styles.orderTotal}>
                            {order.total}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`${styles.orderStatus} ${
                              order.status === "Delivered"
                                ? styles.delivered
                                : order.status === "Processing"
                                  ? styles.processing
                                  : styles.shipped
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>

                        <td>
                          <div className={styles.orderActions}>
                            <button
                              type="button"
                              className={styles.orderActionButton}
                              title="Share Order"
                              onClick={() => console.log(`Share ${order.id}`)}
                            >
                              <Share2 size={17} strokeWidth={1.8} />
                            </button>

                            <button
                              type="button"
                              className={styles.orderActionButton}
                              title="Download Invoice"
                              onClick={() =>
                                console.log(`Download ${order.id}`)
                              }
                            >
                              <Download size={17} strokeWidth={1.8} />
                            </button>

                            <button
                              type="button"
                              className={`${styles.orderActionButton} ${styles.deleteAction}`}
                              title="Delete Order"
                              onClick={() => console.log(`Delete ${order.id}`)}
                            >
                              <Trash2 size={17} strokeWidth={1.8} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =====================================================
              WISHLIST
          ===================================================== */}

          {activeTab === "wishlist" && (
            <div className={styles.wishlistSection}>
              {/* WISHLIST HEADER */}

              <div className={styles.wishlistHeader}>
                <div className={styles.sectionHeading}>
                  <h2>Wishlist</h2>

                  <p>Products you have saved for later.</p>
                </div>

                {/* SHARE */}

                <div className={styles.shareWishlist}>
                  <span>Share:</span>

                  <button
                    type="button"
                    aria-label="Facebook"
                    onClick={() => console.log("Share on Facebook")}
                  >
                    f
                  </button>

                  <button
                    type="button"
                    aria-label="Instagram"
                    onClick={() => console.log("Share on Instagram")}
                  >
                    ◎
                  </button>

                  <button
                    type="button"
                    aria-label="WhatsApp"
                    onClick={() => console.log("Share on WhatsApp")}
                  >
                    ◔
                  </button>

                  <button
                    type="button"
                    aria-label="Share wishlist"
                    onClick={handleShareWishlist}
                  >
                    <Share2 size={17} strokeWidth={1.7} />
                  </button>
                </div>
              </div>

              {/* WISHLIST ACTION BAR */}

              {selectedWishlist.length > 0 && (
                <div className={styles.wishlistActionsBar}>
                  <span className={styles.selectedCount}>
                    {selectedWishlist.length}{" "}
                    {selectedWishlist.length === 1 ? "item" : "items"} selected
                  </span>

                  <div className={styles.wishlistActionButtons}>
                    {/* SELECT ALL */}

                    <button type="button" onClick={handleSelectAllWishlist}>
                      <CheckSquare size={16} strokeWidth={1.7} />

                      <span>
                        {selectedWishlist.length === wishlistProducts.length
                          ? "Deselect All"
                          : "Select All"}
                      </span>
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      className={styles.deleteWishlistButton}
                      onClick={handleDeleteSelectedWishlist}
                    >
                      <Trash2 size={16} strokeWidth={1.7} />

                      <span>Delete</span>
                    </button>

                    {/* CLEAR */}

                    <button
                      type="button"
                      onClick={handleClearWishlistSelection}
                    >
                      <X size={16} strokeWidth={1.7} />

                      <span>Clear</span>
                    </button>
                  </div>
                </div>
              )}

              {/* WISHLIST GRID */}

              <div className={styles.wishlistGrid}>
                {wishlistProducts.map((product) => {
                  const isSelected = selectedWishlist.includes(product.id);

                  return (
                    <article
                      key={product.id}
                      className={`${styles.productCard} ${
                        isSelected ? styles.selectedProduct : ""
                      }`}
                    >
                      {/* PRODUCT IMAGE */}

                      <div className={styles.imageWrapper}>
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={800}
                          height={600}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          className={styles.productImage}
                        />

                        {/* CHECKBOX */}

                        <button
                          type="button"
                          className={styles.wishlistCheckbox}
                          aria-label={
                            isSelected ? "Deselect product" : "Select product"
                          }
                          onClick={() => toggleWishlistSelection(product.id)}
                        >
                          {isSelected ? (
                            <CheckSquare size={20} strokeWidth={1.7} />
                          ) : (
                            <Square size={20} strokeWidth={1.7} />
                          )}
                        </button>
                      </div>

                      {/* PRODUCT INFO */}

                      <div className={styles.productInfo}>
                        <h3 className={styles.productTitle}>{product.title}</h3>

                        {/* COLORS */}

                        <div className={styles.colors}>
                          {product.colors.map((color, index) => (
                            <span
                              key={`${product.id}-color-${index}`}
                              className={styles.color}
                              style={{
                                backgroundColor: color,
                              }}
                            />
                          ))}
                        </div>

                        {/* SIZES */}

                        <p className={styles.sizes}>
                          Size: {product.sizes.join(" | ")}
                        </p>

                        {/* PRICE */}

                        <div className={styles.priceArea}>
                          <div className={styles.priceWrapper}>
                            <span className={styles.price}>
                              Rs {product.price}
                            </span>

                            {product.oldPrice && (
                              <span className={styles.oldPrice}>
                                Rs {product.oldPrice}
                              </span>
                            )}
                          </div>

                          {/* ADD TO CART */}

                          <button
                            type="button"
                            className={styles.addToCart}
                            onClick={() =>
                              console.log("Add to cart", product.id)
                            }
                          >
                            <ShoppingBag size={16} strokeWidth={1.5} />

                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================
              ADDRESSES
          ===================================================== */}

          {activeTab === "password" && (
            <div>
              <div className={styles.sectionHeading}>
                <h2>Passwords</h2>
              </div>

              {/* BILLING INFORMATION */}

              <div className={styles.billingSection}>
                <div className={styles.billingHeading}>
                  <h3>Change Password</h3>
                </div>
                <>
                  <form className={styles.billingForm} onSubmit={handleUpdate}>
                    <div className={styles.formGroup}>
                      <label htmlFor="fullName">Old Password</label>

                      <input type="text" placeholder="Old Password" required />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="email">New Password</label>

                      <input type="text" placeholder="New Password" required />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="phone">Confirm Password</label>

                      <input
                        type="text"
                        placeholder="Confirm Password"
                        required
                      />
                    </div>

                    <button type="submit" className={styles.updateButton}>
                      Update
                    </button>
                  </form>
                </>
              </div>
            </div>
          )}

          {activeTab === "logout" && (
            <div>
              <div className={styles.sectionHeading}>
                <h2>Passwords</h2>
              </div>

              {/* BILLING INFORMATION */}

              <div className={styles.billingSection}>
                <div className={styles.logoutAction}>
                  <h3>Are you Sure you want to Logout?</h3>

                  <div className={styles.logoutButtons}>
                    <button type="button">Cancel</button>
                    <button type="button">Logout</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
