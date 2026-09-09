import { apiGet } from "./server";
import { mapProduct, mapReview } from "./mappers";
import type {
  ApiCategory,
  ApiFlashSaleItem,
  ApiItem,
  ApiMeta,
  ApiPage,
  ApiProduct,
  ApiReview,
  ApiVariant,
} from "@/types/api";
import { filterProducts, hasLocalFilters, type ProductQuery } from "@/lib/catalog";
import type { Product } from "@/types/product";

export { parseProductQuery, type ProductQuery } from "@/lib/catalog";

const backendKeys = ["q", "category_id", "brand_id", "sort", "page", "per_page"] as const;

function queryString(query: ProductQuery): string {
  const params = new URLSearchParams();
  backendKeys.forEach((key) => query[key] && params.set(key, query[key] as string));
  return params.toString();
}

export async function getProducts(query: ProductQuery = {}) {
  if (!hasLocalFilters(query)) {
    const suffix = queryString(query);
    const response = await apiGet<ApiPage<ApiProduct>>(`products${suffix ? `?${suffix}` : ""}`);
    return { products: response.data.map((product) => mapProduct(product)), meta: response.meta };
  }

  // ponytail: price and availability are filtered over the first 100 matches (the API's
  // per_page ceiling) because the backend exposes neither filter; move them into the API
  // query once it supports them.
  const perPage = Number(query.per_page) || 24;
  const page = Math.max(1, Number(query.page) || 1);
  const suffix = queryString({ ...query, page: undefined, per_page: "100" });
  const response = await apiGet<ApiPage<ApiProduct>>(`products?${suffix}`);
  const filtered = filterProducts(response.data.map((product) => mapProduct(product)), query);
  const meta: ApiMeta = {
    current_page: page,
    last_page: Math.max(1, Math.ceil(filtered.length / perPage)),
    per_page: perPage,
    total: filtered.length,
  };
  return { products: filtered.slice((page - 1) * perPage, page * perPage), meta };
}

export async function getProduct(id: string) {
  const { data } = await apiGet<ApiItem<ApiProduct>>(`products/${encodeURIComponent(id)}`);
  const [variants, reviews] = await Promise.all([
    data.has_variants
      ? apiGet<ApiItem<ApiVariant[]>>(`products/${encodeURIComponent(data.id)}/variants`).then((result) => result.data)
      : Promise.resolve([]),
    apiGet<ApiPage<ApiReview>>(`products/${encodeURIComponent(data.id)}/reviews`).then((result) => result.data.map(mapReview)),
  ]);
  return mapProduct(data, variants, reviews);
}

export async function getCatalogFilters() {
  const categories = await apiGet<ApiPage<ApiCategory>>("products/categories?per_page=100");
  return {
    categories: categories.data.filter((category) => category.product_count !== 0),
  };
}

export async function getSaleProducts(): Promise<Product[]> {
  const response = await apiGet<ApiPage<ApiFlashSaleItem>>("flash-sales/active?per_page=50");
  return response.data.map((item) =>
    mapProduct(
      {
        ...item.product,
        price: {
          selling_price_with_tax: item.selling_price_with_tax,
          marked_price_with_tax: item.selling_price_with_tax,
          effective_selling_price_with_tax: item.effective_selling_price_with_tax,
        },
        stock_status: item.stock_status,
      },
      item.variant ? [item.variant] : [],
      [],
      item.flash_sale && {
        name: item.flash_sale.name,
        endsAt: item.flash_sale.end_time?.slice(0, 5),
      },
    ),
  );
}

/** Header navigation data. Never throws: the storefront still renders without it. */
export async function getNavigation() {
  const [categories, sale] = await Promise.all([
    apiGet<ApiPage<ApiCategory>>("products/categories?per_page=100")
      .then((response) => response.data.filter((category) => category.product_count !== 0))
      .catch(() => [] as ApiCategory[]),
    apiGet<ApiPage<ApiFlashSaleItem>>("flash-sales/active?per_page=1")
      .then((response) => (response.meta?.total ?? response.data.length) > 0)
      .catch(() => false),
  ]);
  return { categories, hasSale: sale };
}
