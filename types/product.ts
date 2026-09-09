export type Review = {
  id: string | number;
  name: string;
  rating: number;
  comment: string;
  date: string;
};

export type ProductVariant = {
  id: string;
  options: Record<string, string>;
  images: string[];
  price: number;
  oldPrice?: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
};

export type ProductSale = {
  name: string;
  endsAt?: string;
};

export type Product = {
  id: string;
  slug?: string;
  title: string;
  image: string;
  images: string[];

  price: number;
  // Highest variant price, only set when the product spans a price range.
  priceMax?: number;
  oldPrice?: number;

  brand?: string;
  category?: string;
  description?: string;

  rating?: number;
  reviewsCount?: number;
  reviews?: Review[];

  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  hasVariants?: boolean;
  // Only known once variants have been fetched (product page, flash sale).
  variantCount?: number;
  variants?: ProductVariant[];

  sale?: ProductSale;
};
