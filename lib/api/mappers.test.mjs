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
