import type { Product } from "@/types/product";

export type ProductQuery = {
  q?: string;
  category_id?: string;
  brand_id?: string;
  sort?: string;
  page?: string;
  per_page?: string;
  // The backend has no price or availability filters yet, so these are applied here.
  min_price?: string;
  max_price?: string;
  availability?: string;
};

/** Keeps only the string search params the catalog understands. */
export function parseProductQuery(raw: Record<string, string | string[] | undefined>): ProductQuery {
  return Object.fromEntries(
    Object.entries(raw).flatMap(([key, value]) => (typeof value === "string" ? [[key, value]] : [])),
  ) as ProductQuery;
}

function bound(value?: string) {
  const parsed = Number(value);
  return value && !Number.isNaN(parsed) ? parsed : undefined;
}

/** True when the query asks for something the backend cannot filter itself. */
export function hasLocalFilters(query: ProductQuery): boolean {
  return bound(query.min_price) !== undefined
    || bound(query.max_price) !== undefined
    || query.availability === "in_stock";
}

export function filterProducts(products: Product[], query: ProductQuery): Product[] {
  const min = bound(query.min_price);
  const max = bound(query.max_price);
  const inStock = query.availability === "in_stock";

  return products.filter((product) =>
    (min === undefined || (product.priceMax ?? product.price) >= min)
    && (max === undefined || product.price <= max)
    && (!inStock || product.stockStatus !== "out_of_stock"));
}
