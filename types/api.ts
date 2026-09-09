export type ApiPrice = {
  selling_price_with_tax?: number;
  marked_price_with_tax?: number;
  effective_selling_price_with_tax?: number;
  min_effective_selling_price_with_tax?: number;
  max_effective_selling_price_with_tax?: number;
  min_marked_price_with_tax?: number;
  max_marked_price_with_tax?: number;
};

export type ApiProduct = {
  id: string;
  slug?: string;
  product_name: string;
  product_category_id?: string;
  product_category_name?: string;
  product_brand_id?: string;
  product_brand_name?: string;
  product_desc?: string;
  images?: unknown;
  price?: ApiPrice;
  rating?: number;
  reviews_count?: number;
  stock_status?: "in_stock" | "low_stock" | "out_of_stock";
  has_variants?: boolean;
  variants?: ApiVariant[];
};

export type ApiVariant = {
  id: string;
  attribute_name?: unknown;
  attribute_value?: unknown;
  images?: unknown;
  price?: ApiPrice;
  stock_status?: "in_stock" | "low_stock" | "out_of_stock";
};

export type ApiReview = {
  id: string;
  rating: number;
  review?: string;
  customer?: { name?: string };
  created_at?: string;
};

export type ApiMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type ApiPage<T> = {
  data: T[];
  meta?: ApiMeta;
};

export type ApiItem<T> = { data: T };

export type ApiCategory = {
  id: string;
  parent_category_id?: string | null;
  category_name: string;
  category_slug?: string;
  category_image?: string | null;
  description?: string | null;
  product_count?: number;
};

export type ApiBrand = {
  id: string;
  name: string;
  slug?: string;
  image?: string | null;
  product_count?: number;
};

export type ApiFlashSale = {
  id: string;
  name: string;
  sale_date?: string;
  start_time?: string;
  end_time?: string;
};

export type ApiFlashSaleItem = {
  id: string;
  flash_sale?: ApiFlashSale;
  product: ApiProduct;
  variant?: ApiVariant | null;
  selling_price_with_tax: number;
  effective_selling_price_with_tax: number;
  stock_status?: "in_stock" | "low_stock" | "out_of_stock";
};
