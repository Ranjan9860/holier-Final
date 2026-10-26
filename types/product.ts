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
  priceExTax: number;
  basePriceExTax: number;
  oldPrice?: number;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
  promotion?: ProductPromotion;
};

export type ProductPromotion = { name: string; percentOff: number; type: "discount" | "flash_sale" };

export type ProductSale = {
  name: string;
  endsAt?: string;
  variantId?: string;
  percentOff?: number;
};

export type ProductSeo = {
  title: string;
  description?: string;
  altText: string;
  canonicalUrl?: string;
  ogImage?: string;
  allowSearchEngine: boolean;
  allowFollowLinks: boolean;
};

export type Product = {
  id: string;
  slug?: string;
  code?: string;
  sku?: string;
  title: string;
  image: string;
  images: string[];

  price: number;
  priceExTax: number;
  basePriceExTax: number;
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

  promotion?: ProductPromotion;
  sale?: ProductSale;
  seo?: ProductSeo;
};
