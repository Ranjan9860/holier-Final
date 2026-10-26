import type { Product } from "@/types/product";

const availability = {
  in_stock: "https://schema.org/InStock",
  low_stock: "https://schema.org/InStock",
  out_of_stock: "https://schema.org/OutOfStock",
} as const;

export const productCanonicalUrl = (product: Product) =>
  product.seo?.canonicalUrl || `/product/${encodeURIComponent(product.slug || product.id)}`;

export const productSocialImage = (product: Product) =>
  product.seo?.ogImage || product.images.find((image) => /^https?:\/\//.test(image));

export function productJsonLd(product: Product) {
  const productUrl = productCanonicalUrl(product);
  const images = product.images.filter((image) => /^https?:\/\//.test(image));
  const offer = {
    "@type": product.priceMax && product.priceMax > product.price ? "AggregateOffer" : "Offer",
    priceCurrency: "NPR",
    availability: availability[product.stockStatus || "in_stock"],
    url: productUrl,
    ...(product.priceMax && product.priceMax > product.price
      ? { lowPrice: product.price, highPrice: product.priceMax, offerCount: product.variantCount || product.variants?.length }
      : { price: product.price }),
  };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    ...(images.length && { image: images }),
    url: productUrl,
    ...((product.sku || product.code) && { sku: product.sku || product.code }),
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    ...(product.category && { category: product.category }),
    offers: offer,
    ...(product.rating && product.reviewsCount
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewsCount } }
      : {}),
    ...(product.reviews?.length
      ? {
          review: product.reviews.map((review) => ({
            "@type": "Review",
            author: { "@type": "Person", name: review.name },
            reviewRating: { "@type": "Rating", ratingValue: review.rating },
            reviewBody: review.comment,
            ...(review.date && { datePublished: review.date }),
          })),
        }
      : {}),
  };
}
