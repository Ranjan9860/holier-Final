import assert from "node:assert/strict";
import test from "node:test";

import { productJsonLd } from "./product-json-ld.ts";

test("builds Product JSON-LD with aggregate offers and ratings", () => {
  const jsonLd = productJsonLd({
    id: "product-1",
    sku: "JACKET-1",
    title: "Jacket",
    description: "Warm jacket",
    image: "https://cdn.test/jacket.jpg",
    images: ["https://cdn.test/jacket.jpg"],
    price: 1000,
    priceExTax: 885,
    basePriceExTax: 885,
    priceMax: 1500,
    variantCount: 2,
    brand: "Holier",
    stockStatus: "low_stock",
    rating: 4.5,
    reviewsCount: 3,
  });

  assert.equal(jsonLd["@type"], "Product");
  assert.equal(jsonLd.sku, "JACKET-1");
  assert.deepEqual(jsonLd.offers, {
    "@type": "AggregateOffer",
    priceCurrency: "NPR",
    availability: "https://schema.org/InStock",
    url: "/product/product-1",
    lowPrice: 1000,
    highPrice: 1500,
    offerCount: 2,
  });
  assert.equal(jsonLd.url, "/product/product-1");
  assert.deepEqual(jsonLd.image, ["https://cdn.test/jacket.jpg"]);
  assert.deepEqual(jsonLd.aggregateRating, { "@type": "AggregateRating", ratingValue: 4.5, reviewCount: 3 });
});
