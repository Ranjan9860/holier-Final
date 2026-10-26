import assert from "node:assert/strict";
import test from "node:test";

import { mapProduct } from "./mappers.ts";

test("maps variant attributes and uses the image fallback", () => {
  const product = mapProduct(
    { id: "product-1", product_name: "Jacket", has_variants: true },
    [{
      id: "variant-1",
      attribute_name: '["size","material"]',
      attribute_value: '["XL","Leather"]',
      price: { effective_selling_price_with_tax: 125, marked_price_with_tax: 137 },
    }],
  );

  assert.equal(product.image, "/image/products/placeholder.svg");
  assert.equal(product.price, 125);
  assert.equal(product.oldPrice, 137);
  assert.equal(product.variantCount, 1);
  assert.deepEqual(product.variants?.[0].options, { size: "XL", material: "Leather" });
});

test("keeps a variant price range and drops the marked price that cannot be compared to it", () => {
  const product = mapProduct({
    id: "product-2",
    product_name: "Pants",
    has_variants: true,
    price: {
      min_effective_selling_price_with_tax: 419,
      max_effective_selling_price_with_tax: 504,
      min_marked_price_with_tax: 600,
    },
  });

  assert.equal(product.price, 419);
  assert.equal(product.priceMax, 504);
  assert.equal(product.oldPrice, undefined);
  assert.equal(product.variantCount, undefined);
});

test("carries flash sale details onto the product", () => {
  const product = mapProduct(
    { id: "product-3", product_name: "Shirt", price: { effective_selling_price_with_tax: 70, marked_price_with_tax: 100 } },
    [],
    [],
    { name: "Morning Flash Sale", endsAt: "11:00" },
  );

  assert.equal(product.price, 70);
  assert.equal(product.oldPrice, 100);
  assert.deepEqual(product.sale, { name: "Morning Flash Sale", endsAt: "11:00" });
});

test("maps product SEO settings", () => {
  const product = mapProduct({
    id: "product-4",
    product_name: "Jacket",
    seo: {
      seo_title: "Winter Jacket",
      seo_desc: "Warm winter jacket.",
      alt_text: "Black winter jacket",
      canonical_url: "https://shop.test/product/winter-jacket",
      og_image: "https://cdn.test/jacket.jpg",
      allow_search_engine: false,
      allow_follow_links: true,
    },
  });

  assert.deepEqual(product.seo, {
    title: "Winter Jacket",
    description: "Warm winter jacket.",
    altText: "Black winter jacket",
    canonicalUrl: "https://shop.test/product/winter-jacket",
    ogImage: "https://cdn.test/jacket.jpg",
    allowSearchEngine: false,
    allowFollowLinks: true,
  });
});


test("active discounts compare against selling price instead of marked price", () => {
  const product = mapProduct({
    id: "discounted-jacket",
    product_name: "Jacket",
    price: { selling_price_with_tax: 929, marked_price_with_tax: 1115, effective_selling_price_with_tax: 836.1 },
    promotion: { type: "discount", discount_amount_with_tax: 92.9, discount_price_with_tax: 836.1 },
  });

  assert.equal(product.price, 836.1);
  assert.equal(product.oldPrice, 929);
  assert.equal(product.promotion.percentOff, 10);
});

test("promoted variants compare against their own selling price", () => {
  const product = mapProduct(
    { id: "variant-jacket", product_name: "Jacket", has_variants: true },
    [{
      id: "variant-1",
      price: { selling_price_with_tax: 929, marked_price_with_tax: 1115, effective_selling_price_with_tax: 836.1 },
      promotion: { type: "flash_sale", discount_amount_with_tax: 92.9, discount_price_with_tax: 836.1 },
    }],
  );

  assert.equal(product.variants[0].oldPrice, 929);
  assert.equal(product.oldPrice, 929);
  assert.equal(product.variants[0].promotion.percentOff, 10);
});

test("variant summaries recover the selling price from the promotion without comparing price ranges", () => {
  const api = {
    id: "summary-jacket", product_name: "Jacket", has_variants: true,
    price: { min_effective_selling_price_with_tax: 836.1, max_effective_selling_price_with_tax: 836.1, min_marked_price_with_tax: 1115 },
    promotion: { type: "discount", discount_amount_with_tax: 92.9, discount_price_with_tax: 836.1 },
  };

  assert.equal(mapProduct(api).oldPrice, 929);
  assert.equal(mapProduct({ ...api, price: { ...api.price, max_effective_selling_price_with_tax: 950 } }).oldPrice, undefined);
});
