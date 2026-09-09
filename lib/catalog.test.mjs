import assert from "node:assert/strict";
import test from "node:test";

import { filterProducts, hasLocalFilters, parseProductQuery } from "./catalog.ts";

const products = [
  { id: "a", price: 100, stockStatus: "in_stock" },
  { id: "b", price: 400, priceMax: 900, stockStatus: "out_of_stock" },
  { id: "c", price: 1000, stockStatus: "low_stock" },
];

test("only filters locally when price or availability is requested", () => {
  assert.equal(hasLocalFilters({ q: "shirt", category_id: "1" }), false);
  assert.equal(hasLocalFilters({ min_price: "" }), false);
  assert.equal(hasLocalFilters({ min_price: "100" }), true);
  assert.equal(hasLocalFilters({ availability: "in_stock" }), true);
});

test("filters by price range using the full range of variant products", () => {
  assert.deepEqual(filterProducts(products, { min_price: "500" }).map((product) => product.id), ["b", "c"]);
  assert.deepEqual(filterProducts(products, { max_price: "400" }).map((product) => product.id), ["a", "b"]);
  assert.deepEqual(
    filterProducts(products, { min_price: "200", max_price: "500", availability: "in_stock" }).map((product) => product.id),
    [],
  );
});

test("keeps only string search params", () => {
  assert.deepEqual(parseProductQuery({ q: "shirt", tags: ["a", "b"], page: undefined }), { q: "shirt" });
});
