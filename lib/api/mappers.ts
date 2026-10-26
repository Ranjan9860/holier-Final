import type { ApiProduct, ApiPromotion, ApiReview, ApiVariant } from "@/types/api";
import type { Product, ProductSale, ProductVariant, Review } from "@/types/product";

export const fallbackImage = "/image/products/placeholder.svg";

function strings(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try {
    return strings(JSON.parse(value));
  } catch {
    return value ? [value] : [];
  }
}

function images(value: unknown): string[] {
  return strings(value).filter((image) => image.startsWith("/") || image.startsWith("http"));
}

function number(value: unknown): number | undefined {
  const parsed = Number(value);
  return value === null || value === undefined || Number.isNaN(parsed) ? undefined : parsed;
}

function mapPromotion(promotion?: ApiPromotion | null) {
  if (!promotion) return undefined;
  const discount = Number(promotion.discount_amount_with_tax);
  const basePrice = discount + Number(promotion.discount_price_with_tax);
  return { type: promotion.type, name: promotion.name || (promotion.type === "flash_sale" ? "Flash sale" : "Discount"), percentOff: basePrice > 0 ? Math.round(discount / basePrice * 100) : 0 };
}

function mapVariant(variant: ApiVariant): ProductVariant {
  const names = strings(variant.attribute_name);
  const values = strings(variant.attribute_value);
  const price = number(variant.price?.effective_selling_price_with_tax) || 0;
  const basePrice = number(variant.price?.selling_price_with_tax) ?? price;
  const priceExTax = number(variant.price?.effective_selling_price) ?? price;
  const basePriceExTax = number(variant.price?.selling_price) ?? basePrice;
  const marked = number(variant.price?.marked_price_with_tax) || 0;

  return {
    id: variant.id,
    options: Object.fromEntries(names.map((name, index) => [name.toLowerCase(), values[index]])),
    images: images(variant.images),
    price,
    priceExTax,
    basePriceExTax,
    oldPrice: variant.promotion
      ? (basePrice > price ? basePrice : undefined)
      : (marked > price ? marked : undefined),
    stockStatus: variant.stock_status,
    promotion: mapPromotion(variant.promotion),
  };
}

export function mapReview(review: ApiReview): Review {
  return {
    id: review.id,
    name: review.customer?.name || "Customer",
    rating: Number(review.rating),
    comment: review.review || "",
    date: review.created_at || "",
  };
}

export function mapProduct(
  api: ApiProduct,
  variants: ApiVariant[] = [],
  reviews: Review[] = [],
  sale?: ProductSale,
): Product {
  const mappedVariants = variants.map(mapVariant);
  const productImages = [...new Set([...images(api.images), ...mappedVariants.flatMap((variant) => variant.images)])];

  const price = number(api.price?.effective_selling_price_with_tax)
    ?? number(api.price?.min_effective_selling_price_with_tax)
    ?? mappedVariants[0]?.price
    ?? 0;
  const basePrice = number(api.price?.selling_price_with_tax) ?? price;
  const priceExTax = number(api.price?.effective_selling_price) ?? price;
  const basePriceExTax = number(api.price?.selling_price) ?? basePrice;
  const priceMax = number(api.price?.max_effective_selling_price_with_tax);
  const range = Boolean(priceMax && priceMax > price);
  const oldPrice = api.promotion
    ? number(api.price?.selling_price_with_tax)
      ?? mappedVariants.find((variant) => variant.price === price)?.oldPrice
      ?? price + Number(api.promotion.discount_amount_with_tax)
    : number(api.price?.marked_price_with_tax)
      ?? number(api.price?.min_marked_price_with_tax)
      ?? mappedVariants[0]?.oldPrice;

  return {
    id: api.id,
    slug: api.slug,
    code: api.product_code,
    sku: api.product_sku,
    title: api.product_name,
    image: productImages[0] || fallbackImage,
    images: productImages.length ? productImages : [fallbackImage],
    price,
    priceExTax,
    basePriceExTax,
    priceMax: range ? priceMax : undefined,
    // A single comparison price next to a price range compares nothing, so only keep it for
    // products that have one price.
    oldPrice: !range && oldPrice && oldPrice > price ? oldPrice : undefined,
    brand: api.product_brand_name,
    category: api.product_category_name,
    description: api.product_desc || "",
    rating: number(api.rating) || undefined,
    reviewsCount: number(api.reviews_count),
    reviews,
    stockStatus: api.stock_status,
    hasVariants: api.has_variants,
    variantCount: mappedVariants.length || undefined,
    variants: mappedVariants,
    promotion: mapPromotion(api.promotion),
    sale,
    seo: api.seo && {
      title: api.seo.seo_title,
      description: api.seo.seo_desc || undefined,
      altText: api.seo.alt_text,
      canonicalUrl: api.seo.canonical_url || undefined,
      ogImage: api.seo.og_image || undefined,
      allowSearchEngine: api.seo.allow_search_engine,
      allowFollowLinks: api.seo.allow_follow_links,
    },
  };
}
