import assert from "node:assert/strict";
import test from "node:test";
import { storefrontRequest } from "./client.ts";

test("persists and reuses a guest cart token", async () => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  };
  const requests = [];
  globalThis.fetch = async (_url, init) => {
    requests.push(init);
    return new Response(JSON.stringify({ data: {}, meta: { cart_token: "guest-token" } }), {
      headers: { "content-type": "application/json" },
    });
  };

  await storefrontRequest("cart", {}, "cart");
  await storefrontRequest("cart", {}, "cart");

  assert.equal(storage.get("holier-cart-token"), "guest-token");
  assert.equal(requests[1].headers.get("x-cart-token"), "guest-token");
});

test("initializes CSRF before a mutation", async () => {
  globalThis.document = { cookie: "XSRF-TOKEN=csrf-token" };
  const urls = [];
  globalThis.fetch = async (url, init) => {
    urls.push({ url, init });
    return url === "/api/csrf"
      ? new Response(null, { status: 204 })
      : new Response(JSON.stringify({ data: {} }), { headers: { "content-type": "application/json" } });
  };

  await storefrontRequest("customer/logout", { method: "POST" });

  assert.deepEqual(urls.map((request) => request.url), ["/api/csrf", "/api/customer/logout"]);
  assert.equal(urls[1].init.headers.get("x-xsrf-token"), "csrf-token");
});

test("refreshes CSRF before each mutation", async () => {
  globalThis.document = { cookie: "XSRF-TOKEN=csrf-token" };
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(url);
    return url === "/api/csrf"
      ? new Response(null, { status: 204 })
      : new Response(JSON.stringify({ data: {} }), { headers: { "content-type": "application/json" } });
  };

  await storefrontRequest("cart/items", { method: "POST", body: "{}" }, "cart");
  await storefrontRequest("wishlist/items", { method: "POST", body: "{}" }, "wishlist");

  assert.deepEqual(urls, ["/api/csrf", "/api/cart/items", "/api/csrf", "/api/wishlist/items"]);
});

test("refreshes CSRF and retries once after a mismatch", async () => {
  globalThis.document = { cookie: "XSRF-TOKEN=stale-token" };
  let mutationCount = 0;
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(url);
    if (url === "/api/csrf") {
      globalThis.document.cookie = "XSRF-TOKEN=fresh-token";
      return new Response(null, { status: 204 });
    }
    mutationCount++;
    return mutationCount === 1
      ? new Response(JSON.stringify({ message: "CSRF token mismatch." }), { status: 419 })
      : new Response(JSON.stringify({ data: {} }), { headers: { "content-type": "application/json" } });
  };

  await storefrontRequest("cart/items", { method: "POST", body: "{}" }, "cart");

  assert.deepEqual(urls, ["/api/csrf", "/api/cart/items", "/api/csrf", "/api/cart/items"]);
});
