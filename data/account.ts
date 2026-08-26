import { BillingInfo, Order, WishlistProduct } from "@/types/account";

/* =========================================================
   BILLING INFORMATION
========================================================= */

export const defaultBillingInfo: BillingInfo = {
  fullName: "Ranjan Kumar Acharya",
  email: "ranjan@example.com",
  phone: "+977 98XXXXXXXX",
  address: "Sanga, Bhaktapur",
  gender: "Male",
  city: "Bhaktapur",
  region: "Bagmati",
  country: "Nepal",
  postalCode: "44800",
};

/* =========================================================
   ORDERS
========================================================= */

export const orders: Order[] = [
  {
    id: "#HL001",
    productName: "Oversized Denim Jacket",
    image: "/image/products/image.jpg",
    orderedOn: "12 Aug 2026",
    total: "Rs. 5,500",
    status: "Delivered",
  },

  {
    id: "#HL002",
    productName: "Classic Cotton Shirt",
    image: "/image/products/image2.jpg",
    orderedOn: "18 Aug 2026",
    total: "Rs. 3,200",
    status: "Processing",
  },

  {
    id: "#HL003",
    productName: "Relaxed Fit Trousers",
    image: "/image/products/image3.jpg",
    orderedOn: "20 Aug 2026",
    total: "Rs. 4,800",
    status: "Shipped",
  },
];

/* =========================================================
   WISHLIST PRODUCTS
========================================================= */

export const wishlistProducts: WishlistProduct[] = [
  {
    id: "WL001",
    title: "Oversized Denim Jacket",
    image: "/image/products/image3.jpg",
    colors: ["#111111", "#6b7280"],
    sizes: ["S", "M", "L", "XL"],
    price: "5,500",
    oldPrice: "6,200",
  },

  {
    id: "WL002",
    title: "Classic Cotton Shirt",
    image: "/image/products/image2.jpg",
    colors: ["#ffffff", "#111111"],
    sizes: ["S", "M", "L"],
    price: "3,200",
  },

  {
    id: "WL003",
    title: "Relaxed Fit Trousers",
    image: "/image/products/image.jpg",
    colors: ["#252525", "#c7b299"],
    sizes: ["30", "32", "34", "36"],
    price: "4,800",
    oldPrice: "5,500",
  },

  {
    id: "WL004",
    title: "Premium Casual Hoodie",
    image: "/image/products/image3.jpg",
    colors: ["#222222", "#e5e5e5"],
    sizes: ["M", "L", "XL"],
    price: "4,200",
  },
];
