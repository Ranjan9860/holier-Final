// Static catalogue served when DEMO_MODE=true. Shapes mirror the e-ims storefront API (types/api.ts).
import type { ApiBrand, ApiCategory, ApiFlashSale, ApiProduct, ApiReview, ApiVariant } from "@/types/api";

export const VAT = 0.13;
const ex = (withTax: number) => Math.round(withTax / (1 + VAT));

export const categories: ApiCategory[] = [
  { id: "cat-sets", category_name: "Lingerie Sets", category_slug: "lingerie-sets", category_image: "/image/holier/IMG_3109.webp", description: "Matching bra and brief sets.", product_count: 13 },
  { id: "cat-tops", category_name: "Corset Tops", category_slug: "corset-tops", category_image: "/image/holier/IMG_1781.webp", description: "Structured corset-style tops.", product_count: 2 },
];

export const brands: ApiBrand[] = [
  { id: "brand-holier", name: "Holier", slug: "holier", product_count: 15 },
];

type Spec = {
  id: string; name: string; cat: string; brand: string; price: number; mrp?: number;
  images: string[]; colorImages?: string[][]; colors: string[]; sizes?: string[]; rating: number; reviews: number;
  discountPct?: number; flashPct?: number; stock?: "in_stock" | "low_stock" | "out_of_stock";
  xlExtra?: number; desc: string; daysOld: number;
};

const SIZES = ["S", "M", "L"];

// Products, prices, sizes, colours and photos come from holier-staging.sql; promotions, ratings and stock states are demo-only.
const specs: Spec[] = [
  { id: "p-bloom-set", name: "Bloom Set", cat: "cat-sets", brand: "brand-holier", price: 3000, images: ["/image/holier/IMG_3109.webp", "/image/holier/IMG_3110.webp"], colors: ["Black With Floral Detail"], sizes: ["S", "M"], rating: 4.8, reviews: 5, desc: "Bloom Set in black with floral detail. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in S, M.", daysOld: 1, flashPct: 30 },
  { id: "p-craze-set", name: "Craze Set", cat: "cat-sets", brand: "brand-holier", price: 3050, images: ["/image/holier/IMG_3471.webp", "/image/holier/IMG_3488.webp", "/image/holier/IMG_3012.webp"], colors: ["Black"], sizes: ["S", "L"], rating: 4.6, reviews: 3, desc: "Craze Set in black. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in S, L.", daysOld: 4 },
  { id: "p-dream-set", name: "Dream Set", cat: "cat-sets", brand: "brand-holier", price: 3000, images: ["/image/holier/IMG_3469.webp", "/image/holier/IMG_1822.webp"], colors: ["Ruby Red & White"], sizes: ["M", "L"], rating: 4.9, reviews: 4, desc: "Dream Set in ruby red & white. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in M, L.", daysOld: 7, flashPct: 20 },
  { id: "p-fuel-set", name: "Fuel Set", cat: "cat-sets", brand: "brand-holier", price: 2900, images: ["/image/holier/IMG_2284.webp", "/image/holier/IMG_2286.webp", "/image/holier/IMG_2282.webp"], colors: ["Navy Blue"], sizes: ["S", "L"], rating: 4.4, reviews: 2, desc: "Fuel Set in navy blue. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in S, L.", daysOld: 10 },
  { id: "p-heat-set", name: "Heat Set", cat: "cat-sets", brand: "brand-holier", price: 3000, images: ["/image/holier/IMG_3485.webp", "/image/holier/IMG_1561.webp", "/image/holier/IMG_1560.webp", "/image/holier/IMG_1562.webp"], colors: ["Rust & Black Animal Print"], sizes: ["M", "L"], rating: 4.7, reviews: 5, desc: "Heat Set in rust & black animal print. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in M, L.", daysOld: 13, flashPct: 35 },
  { id: "p-allure-set", name: "Allure Set", cat: "cat-sets", brand: "brand-holier", price: 2900, images: ["/image/holier/IMG_4053.webp", "/image/holier/IMG_4054.webp", "/image/holier/IMG_3476.webp"], colors: ["Black & Cream Mesh"], sizes: ["S", "M", "L"], rating: 4.5, reviews: 3, desc: "Allure Set in black & cream mesh. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in S, M, L.", daysOld: 16, stock: "low_stock" },
  { id: "p-axis-corset-top", name: "AxisCorset Top", cat: "cat-tops", brand: "brand-holier", price: 2000, images: ["/image/holier/IMG_1781.webp", "/image/holier/IMG_1771.webp", "/image/holier/IMG_1772.webp"], colors: ["Black"], sizes: ["S", "L"], rating: 4.3, reviews: 1, desc: "AxisCorset Top in black. A structured corset-style top with boning and a flattering shape that works under or over layers. Available in S, L.", daysOld: 19 },
  { id: "p-belle-corset-top", name: "BelleCorset Top", cat: "cat-tops", brand: "brand-holier", price: 2200, images: ["/image/holier/IMG_2533.webp", "/image/holier/IMG_2531.webp"], colors: ["Wine Red"], sizes: ["M", "L"], rating: 4.8, reviews: 4, desc: "BelleCorset Top in wine red. A structured corset-style top with boning and a flattering shape that works under or over layers. Available in M, L.", daysOld: 22, discountPct: 10 },
  { id: "p-chic-set", name: "Chic Set", cat: "cat-sets", brand: "brand-holier", price: 2450, images: ["/image/holier/IMG_9118.webp", "/image/holier/IMG_9116.webp", "/image/holier/IMG_9117.webp"], colors: ["Black"], sizes: ["S", "M", "L", "XL"], rating: 4.6, reviews: 2, desc: "Chic Set in black. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in S, M, L, XL.", daysOld: 25, discountPct: 15 },
  { id: "p-dahlia-set", name: "Dahlia Set", cat: "cat-sets", brand: "brand-holier", price: 3000, images: ["/image/holier/IMG_3503.webp", "/image/holier/IMG_3502.webp", "/image/holier/IMG_9166.webp", "/image/holier/IMG_9165.webp"], colors: ["Black & Cream"], sizes: ["S", "M", "L", "XL"], rating: 4.2, reviews: 0, desc: "Dahlia Set in black & cream. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in S, M, L, XL.", daysOld: 28, mrp: 3400 },
  { id: "p-ease-set", name: "Ease Set", cat: "cat-sets", brand: "brand-holier", price: 2800, images: ["/image/holier/IMG_3031.webp", "/image/holier/IMG_3473.webp", "/image/holier/IMG_3032.webp", "/image/holier/IMG_3030.webp"], colors: ["Maroon"], sizes: ["S", "M", "L"], rating: 4.9, reviews: 5, desc: "Ease Set in maroon. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in S, M, L.", daysOld: 31, mrp: 3200 },
  { id: "p-desire-set", name: "Desire Set", cat: "cat-sets", brand: "brand-holier", price: 3000, images: ["/image/holier/IMG_3478.webp", "/image/holier/IMG_4368.webp", "/image/holier/IMG_4369.webp", "/image/holier/IMG_4367.webp"], colors: ["Red"], sizes: ["S"], rating: 4.5, reviews: 3, desc: "Desire Set in red. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in S.", daysOld: 34, stock: "out_of_stock" },
  { id: "p-eclipse-set", name: "Eclipse Set", cat: "cat-sets", brand: "brand-holier", price: 2500, images: ["/image/holier/IMG_9121.webp", "/image/holier/IMG_9120.webp", "/image/holier/IMG_9122.webp"], colors: ["Black With Floral Detail"], sizes: ["S", "M", "L"], rating: 4.7, reviews: 2, desc: "Eclipse Set in black with floral detail. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in S, M, L.", daysOld: 37, discountPct: 20 },
  { id: "p-deep-set", name: "Deep Set", cat: "cat-sets", brand: "brand-holier", price: 2600, images: ["/image/holier/IMG_6938.webp", "/image/holier/IMG_2084.webp"], colors: ["Baby Pink", "Navy Blue"], sizes: ["M", "L"], rating: 4.4, reviews: 4, desc: "Deep Set in baby pink. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in M, L.", daysOld: 40, colorImages: [["/image/holier/IMG_6936.webp", "/image/holier/IMG_6938.webp"], ["/image/holier/IMG_2084.webp", "/image/holier/IMG_2083.webp"]] },
  { id: "p-aura-set", name: "Aura Set", cat: "cat-sets", brand: "brand-holier", price: 2800, images: ["/image/holier/IMG_1472.webp", "/image/holier/IMG_1471.webp"], colors: ["Black"], sizes: ["S", "M", "L", "XL"], rating: 4.6, reviews: 1, desc: "Aura Set in black. A coordinated bra and brief set with soft, breathable fabric and delicate detailing, made for all-day comfort. Available in S, M, L, XL.", daysOld: 43, flashPct: 25 },
];

const reviewText = [
  "Fits perfectly and the fabric feels so soft. Love the detailing.",
  "Exactly as pictured. Delivery to Pokhara took two days.",
  "Very comfortable for all-day wear. Already ordered a second set.",
  "Lovely quality, but I would size up if you are between sizes.",
  "Beautiful packaging too. Perfect gift. Highly recommended.",
];
const reviewers = ["Sita Gurung", "Anita Shrestha", "Pooja Lama", "Sunita Rai", "Mina Thapa"];

const daysAgo = (days: number) => new Date(Date.now() - days * 864e5).toISOString();
const find = (id: string) => specs.find((s) => s.id === id);

function priceOf(s: Spec, size?: string) {
  const base = s.price + (size === "XL" ? s.xlExtra ?? 0 : 0);
  const pct = s.flashPct ?? s.discountPct ?? 0;
  const effective = Math.round(base * (1 - pct / 100));
  const promotion = pct ? { type: s.flashPct ? "flash_sale" as const : "discount" as const, name: s.flashPct ? "Dashain Flash Sale" : `${pct}% off`, discount_amount_with_tax: base - effective, discount_price_with_tax: effective } : null;
  return { base, effective, promotion };
}

export function variantsOf(id: string): ApiVariant[] {
  const s = find(id);
  if (!s) return [];
  return s.colors.flatMap((color, ci) => (s.sizes ?? SIZES).map((size): ApiVariant => {
    const { base, effective, promotion } = priceOf(s, size);
    return {
      id: `${s.id}-${color}-${size}`.toLowerCase(),
      attribute_name: ["Size", "Color"],
      attribute_value: [size, color],
      images: s.colorImages?.[ci] ?? s.images,
      price: {
        selling_price: ex(base), effective_selling_price: ex(effective), selling_price_with_tax: base, effective_selling_price_with_tax: effective,
        marked_price_with_tax: promotion ? base : s.mrp ?? base,
      },
      stock_status: s.stock ?? (size === "XL" && ci === 0 ? "low_stock" : "in_stock"),
      promotion,
    };
  }));
}

function toApi(s: Spec): ApiProduct {
  const { base, effective, promotion } = priceOf(s);
  const top = priceOf(s, "XL").effective;
  return {
    id: s.id, slug: s.id.replace(/^p-/, ""), product_name: s.name, product_code: s.id.toUpperCase(), product_sku: `HOL-${s.id.slice(2, 6).toUpperCase()}`,
    product_category_id: s.cat, product_category_name: categories.find((c) => c.id === s.cat)?.category_name,
    product_brand_id: s.brand, product_brand_name: brands.find((b) => b.id === s.brand)?.name,
    product_desc: s.desc, images: s.images, rating: s.rating, reviews_count: s.reviews,
    stock_status: s.stock ?? "in_stock", has_variants: true, promotion,
    price: {
      selling_price: ex(base), effective_selling_price: ex(effective), selling_price_with_tax: base, effective_selling_price_with_tax: effective,
      marked_price_with_tax: promotion ? base : s.mrp ?? base,
      min_effective_selling_price_with_tax: effective, max_effective_selling_price_with_tax: top,
    },
    seo: { seo_title: `${s.name} | Holier`, seo_desc: s.desc, alt_text: s.name, allow_search_engine: true, allow_follow_links: true },
  };
}

const created = new Map(specs.map((s) => [s.id, Date.now() - s.daysOld * 864e5]));
export const products: ApiProduct[] = specs.map(toApi);
export const createdAt = (id: string) => created.get(id) ?? 0;
export const productById = (id: string) => products.find((p) => p.id === id || p.slug === id);

export function reviewsOf(id: string): ApiReview[] {
  const n = find(id)?.reviews ?? 0;
  return Array.from({ length: n }, (_, i) => ({
    id: `${id}-r${i}`, rating: Math.max(3, Math.round(find(id)!.rating) - (i % 3 === 2 ? 1 : 0)),
    review: reviewText[i % reviewText.length], customer: { name: reviewers[i % reviewers.length] }, created_at: daysAgo(3 + i * 6),
  }));
}

/** Active flash sale: runs until 23:59:59 today so the countdown is always live. */
export function flashSale(): { sale: ApiFlashSale; items: Array<{ id: string; product: ApiProduct; variant: ApiVariant; base: number; effective: number }> } {
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const sale: ApiFlashSale = { id: "fs-demo", name: "Dashain Flash Sale", sale_date: `${date}T00:00:00.000000Z`, start_time: "00:00:00", end_time: "23:59:59" };
  const items = specs.filter((s) => s.flashPct).map((s) => {
    const variant = variantsOf(s.id)[0];
    return { id: `fsi-${s.id}`, product: productById(s.id)!, variant, base: variant.price!.selling_price_with_tax!, effective: variant.price!.effective_selling_price_with_tax! };
  });
  return { sale, items };
}

// ---- Shipping / checkout configuration ----
export const shippingLocations = [
  { id: "loc-ktm", province: { id: "prov-3", name: "Bagmati" }, district: { id: "dist-ktm", name: "Kathmandu" }, area_code: "KTM-VALLEY", name: "Kathmandu Valley", charge: 100 },
  { id: "loc-lal", province: { id: "prov-3", name: "Bagmati" }, district: { id: "dist-lal", name: "Lalitpur" }, area_code: "LAL-VALLEY", name: "Lalitpur", charge: 100 },
  { id: "loc-pkr", province: { id: "prov-4", name: "Gandaki" }, district: { id: "dist-kas", name: "Kaski" }, area_code: "PKR", name: "Pokhara", charge: 200 },
  { id: "loc-brt", province: { id: "prov-1", name: "Koshi" }, district: { id: "dist-mor", name: "Morang" }, area_code: "BRT", name: "Biratnagar", charge: 250 },
];

export const paymentMethods = [
  { id: "pay-cod", payment_mode_name: "Cash on delivery", payment_type: "cash" },
];
