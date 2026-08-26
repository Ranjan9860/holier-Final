export type BillingInfo = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
};

export type OrderStatus = "Delivered" | "Processing" | "Shipped";

export type Order = {
  id: string;
  productName: string;
  image: string;
  orderedOn: string;
  total: string;
  status: OrderStatus;
};

export type WishlistProduct = {
  id: string;
  title: string;
  image: string;
  colors: string[];
  sizes: string[];
  price: string;
  oldPrice?: string;
};
