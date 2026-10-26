// Stand-in for the e-ims storefront API, used when DEMO_MODE=true.
// Each visitor's state (cart, wishlist, orders, ...) lives in signed, compressed cookies, so it works on
// serverless hosts and every visitor gets a private demo that starts from the same seed.
import { createHmac, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import type { ApiProduct } from "@/types/api";
import {
  VAT, brands, categories, createdAt, flashSale, paymentMethods, productById, products,
  reviewsOf, shippingLocations, variantsOf,
} from "./data";

export const isDemoMode = () => process.env.DEMO_MODE === "true";

type Body = Record<string, unknown>;
type CartLine = { id: string; product_id: string; variant_id?: string; quantity: number };
type Customer = { id: string; name: string; email: string; phone: string | null; image: string | null; gender: string | null };
type ReturnReq = { id: string; status: string; reason: string; notes: string | null; requested_resolution: "refund" | "exchange"; resolution_note?: string; requested_at: string; can_withdraw: boolean; items: Array<{ sale_item_id: string; name: string; unit: string; requested_quantity: number; approved_quantity?: number | null; received_quantity?: number | null }> };
type OrderItem = { sale_item_id: string; product_id: string; variant_id?: string; name: string; quantity: number };
type Order = {
  id: string; order_number: string; order_status: string; delivery_status: string; order_date: string; total_amount: number;
  payment: { gateway: string; status: string; can_retry: boolean; review_reason?: string | null } | null;
  billing_address: Addr; shipping_address: Addr; items: OrderItem[]; delivered: boolean;
  cancellation_request_status: string | null; return_requests: ReturnReq[]; guest_token?: string;
};
type Addr = { name: string; phone: string; address: string };
type Address = { id: string; name: string; phone: string; label: string; billing_default: boolean; shipping_default: boolean; full_address: string; addresses: Array<Record<string, unknown>> };
type Store = { customer: Customer; cart: CartLine[]; wishlist: Array<{ id: string; product_id: string; product_variant_id: string | null }>; orders: Order[]; addresses: Address[]; reviews: Record<string, unknown[]>; seq: number };

const SESSION = "demo_session";
const ok = (body: unknown, status = 200, headers?: HeadersInit) => Response.json(body, { status, headers });
const fail = (message: string, status = 422, errors: Record<string, string[]> = {}) => ok({ message, errors }, status);
const date = (daysAgo = 0) => new Date(Date.now() - daysAgo * 864e5).toISOString().slice(0, 10);
const nextId = (prefix: string) => `${prefix}-${++store().seq}`;

function seed(): Store {
  const loc = shippingLocations[0];
  const home: Address = {
    id: "addr-1", name: "Demo Customer", phone: "9800000000", label: "home", billing_default: true, shipping_default: true,
    full_address: `Thamel Marg 12, ${loc.province.name}, ${loc.name}`,
    addresses: [{ province_id: loc.province.id, district_id: loc.district.id, area_code: loc.area_code, address: "Thamel Marg 12", landmark: "Near Garden of Dreams" }],
  };
  const a: Addr = { name: home.name, phone: home.phone, address: home.full_address };
  const line = (n: number, product_id: string, variant: number, quantity: number): OrderItem => ({
    sale_item_id: `si-${n}`, product_id, variant_id: variantsOf(product_id)[variant].id, name: productById(product_id)!.product_name, quantity,
  });
  const order = (n: number, o: Partial<Order> & Pick<Order, "order_status" | "delivery_status" | "items">): Order => ({
    id: `ord-${n}`, order_number: `HOL-${1000 + n}`, order_date: date(n * 6), total_amount: 0, payment: { gateway: "cod", status: "pending", can_retry: false },
    billing_address: a, shipping_address: a, delivered: false, cancellation_request_status: null, return_requests: [], ...o,
  });
  const orders = [
    order(1, { order_status: "confirmed", delivery_status: "shipped", items: [line(1, "p-bloom-set", 0, 1)] }),
    order(2, { order_status: "completed", delivery_status: "delivered", delivered: true, items: [line(2, "p-aura-set", 0, 2), line(3, "p-dream-set", 1, 1)],
      return_requests: [{ id: "ret-1", status: "approved_awaiting_item", reason: "Size runs small", notes: null, requested_resolution: "exchange", requested_at: new Date(Date.now() - 2 * 864e5).toISOString(), can_withdraw: true, items: [{ sale_item_id: "si-2", name: "Aura Set", unit: "pcs", requested_quantity: 1, approved_quantity: 1 }] }] }),
    order(3, { order_status: "completed", delivery_status: "delivered", delivered: true, items: [line(4, "p-ease-set", 1, 1)] }),
  ];
  orders.forEach((o) => { o.total_amount = o.items.reduce((sum, i) => sum + unitPrice(i.product_id, i.variant_id).effective * i.quantity, 0) + 100; });
  return {
    customer: { id: "cust-1", name: "Demo Customer", email: "demo@holier.test", phone: "9800000000", image: null, gender: null },
    cart: [], addresses: [home], orders, reviews: {}, seq: 100,
    wishlist: [
      { id: "wl-1", product_id: "p-dahlia-set", product_variant_id: null },
      { id: "wl-2", product_id: "p-heat-set", product_variant_id: null },
    ],
  };
}

// State of the request being handled. demoResponse sets it and runs the router with no await in between,
// so concurrent requests cannot see each other's state.
let cur: Store | undefined;
const store = () => cur!;

// ---- cookie persistence ----
const STATE_COOKIE = "demo_state";
const CHUNK = 3500; // a cookie is capped at ~4KB
const MAX_CHUNKS = 3;
const secret = () => process.env.DEMO_SECRET || "holier-demo-secret"; // integrity only; the data is not sensitive
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

function readCookies(header: string) {
  return Object.fromEntries(header.split(/;\s*/).filter(Boolean).map((part) => {
    const i = part.indexOf("=");
    return [part.slice(0, i), part.slice(i + 1)];
  }));
}

function loadState(cookies: Record<string, string>): { state: Store; raw: string } {
  let joined = "";
  for (let i = 0; cookies[`${STATE_COOKIE}${i}`]; i++) joined += cookies[`${STATE_COOKIE}${i}`];
  const [payload, signature] = joined.split(".");
  try {
    const expected = Buffer.from(sign(payload ?? ""));
    const given = Buffer.from(signature ?? "");
    if (given.length === expected.length && timingSafeEqual(given, expected)) {
      return { state: JSON.parse(inflateRawSync(Buffer.from(payload, "base64url")).toString()) as Store, raw: joined };
    }
  } catch {
    // Tampered or corrupt cookie: fall through to a fresh demo.
  }
  return { state: seed(), raw: "" };
}

function encodeState(state: Store): string {
  // Oldest orders go first when the state outgrows the cookie budget.
  for (;;) {
    const payload = deflateRawSync(JSON.stringify(state)).toString("base64url");
    const joined = `${payload}.${sign(payload)}`;
    if (joined.length <= CHUNK * MAX_CHUNKS || state.orders.length <= 1) return joined;
    state.orders.pop();
  }
}

function withState(response: Response, state: Store, raw: string, cookies: Record<string, string>, secure: boolean): Response {
  const joined = encodeState(state);
  if (joined === raw) return response;
  const headers = new Headers(response.headers);
  const attrs = `Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure ? "; Secure" : ""}`;
  const chunks = joined.match(new RegExp(`.{1,${CHUNK}}`, "g")) ?? [];
  chunks.forEach((chunk, i) => headers.append("set-cookie", `${STATE_COOKIE}${i}=${chunk}; ${attrs}`));
  for (let i = chunks.length; cookies[`${STATE_COOKIE}${i}`]; i++) headers.append("set-cookie", `${STATE_COOKIE}${i}=; Path=/; Max-Age=0`);
  return new Response(response.body, { status: response.status, headers });
}

// ---- pricing helpers ----
function unitPrice(productId: string, variantId?: string) {
  const product = productById(productId)!;
  const variant = variantsOf(product.id).find((v) => v.id === variantId);
  const price = variant?.price ?? product.price!;
  return { base: price.selling_price_with_tax!, effective: price.effective_selling_price_with_tax!, promotion: variant?.promotion ?? product.promotion ?? null, stock: variant?.stock_status ?? product.stock_status ?? "in_stock", images: variant?.images ?? product.images, variant };
}

function renderCart(s: Store) {
  const items = s.cart.map((line) => {
    const product = productById(line.product_id)!;
    const p = unitPrice(line.product_id, line.variant_id);
    return {
      id: line.id, product_id: line.product_id, product_name: product.product_name, product_images: p.images,
      variant_id: line.variant_id, variant_attribute_name: p.variant?.attribute_name, variant_attribute_value: p.variant?.attribute_value,
      quantity: line.quantity, unit_price_with_tax: p.effective, line_total: p.effective * line.quantity,
      tax_amount: Math.round((p.effective - p.effective / (1 + VAT)) * line.quantity),
      discount_amount_with_tax: (p.base - p.effective) * line.quantity, promotion: p.promotion, stock_status: p.stock, in_stock: p.stock !== "out_of_stock",
    };
  });
  const total = items.reduce((sum, i) => sum + i.line_total, 0);
  const tax = items.reduce((sum, i) => sum + i.tax_amount, 0);
  const discountWithTax = items.reduce((sum, i) => sum + i.discount_amount_with_tax, 0);
  const discount = Math.round(discountWithTax / (1 + VAT));
  return {
    data: { id: "cart-demo", items, summary: { subtotal: total - tax + discount, discount_amount: discount, tax_amount: tax, total, items_count: items.length, quantity_total: items.reduce((sum, i) => sum + i.quantity, 0) } },
    meta: { cart_token: "demo-cart" },
  };
}

function renderWishlist(s: Store) {
  return {
    data: { items: s.wishlist.map((item) => {
      const product = productById(item.product_id)!;
      const variant = variantsOf(item.product_id).find((v) => v.id === item.product_variant_id);
      return { ...item, product: { id: product.id, name: product.product_name, images: product.images }, variant: variant && { id: variant.id, name: `${product.product_name} (${(variant.attribute_value as string[]).join(" / ")})`, images: variant.images } };
    }) },
    meta: { wishlist_token: "demo-wishlist" },
  };
}

// ---- catalogue ----
function listProducts(q: URLSearchParams) {
  const search = q.get("q")?.toLowerCase();
  let list: ApiProduct[] = products.filter((p) =>
    (!q.get("category_id") || p.product_category_id === q.get("category_id"))
    && (!q.get("brand_id") || p.product_brand_id === q.get("brand_id"))
    && (!search || `${p.product_name} ${p.product_category_name} ${p.product_brand_name}`.toLowerCase().includes(search)));
  const price = (p: ApiProduct) => p.price!.effective_selling_price_with_tax!;
  const sort = q.get("sort");
  if (sort === "-created_at") list = [...list].sort((a, b) => createdAt(b.id) - createdAt(a.id));
  else if (sort === "ecommerce_selling_price") list = [...list].sort((a, b) => price(a) - price(b));
  else if (sort === "-ecommerce_selling_price") list = [...list].sort((a, b) => price(b) - price(a));
  return paginate(list, q);
}

function paginate<T>(list: T[], q: URLSearchParams) {
  const perPage = Math.min(100, Number(q.get("per_page")) || 15);
  const page = Math.max(1, Number(q.get("page")) || 1);
  return { data: list.slice((page - 1) * perPage, page * perPage), meta: { current_page: page, last_page: Math.max(1, Math.ceil(list.length / perPage)), per_page: perPage, total: list.length } };
}

function activeFlashSales(q: URLSearchParams) {
  const { sale, items } = flashSale();
  const data = items.map((item) => ({
    id: item.id, flash_sale: sale, product: item.product, variant: item.variant, selling_price_with_tax: item.base, effective_selling_price_with_tax: item.effective,
    discount_amount_with_tax: item.base - item.effective, promotion: item.variant.promotion, stock_status: item.variant.stock_status,
  }));
  return paginate(data, q);
}

// ---- orders ----
function renderOrder(o: Order) {
  const returnable = o.delivered ? o.items.map((i) => ({ sale_item_id: i.sale_item_id, name: i.name, unit: "pcs", sold_quantity: i.quantity, remaining_quantity: i.quantity, requestable_quantity: i.quantity - pendingReturn(o, i.sale_item_id) })) : [];
  return {
    id: o.id, order_number: o.order_number, order_status: o.order_status, delivery_status: o.delivery_status, order_date: o.order_date, total_amount: o.total_amount,
    payment: o.payment, billing_address: o.billing_address, shipping_address: o.shipping_address,
    items: o.items.map(({ product_id, variant_id, name, quantity }) => ({ product_id, variant_id, name, quantity })),
    can_request_cancellation: !o.delivered && o.order_status !== "cancelled" && !o.cancellation_request_status,
    cancellation_request_status: o.cancellation_request_status,
    cancellation_request_resolution_note: null, return_required: false,
    can_request_return: returnable.some((i) => i.requestable_quantity > 0),
    returnable_items: returnable, return_requests: o.return_requests,
  };
}
const pendingReturn = (o: Order, saleItemId: string) => o.return_requests.filter((r) => ["pending_review", "approved_awaiting_item"].includes(r.status)).flatMap((r) => r.items).filter((i) => i.sale_item_id === saleItemId).reduce((n, i) => n + i.requested_quantity, 0);

function createOrder(s: Store, body: Body, guest: boolean) {
  const methodId = String(body.payment_method_id ?? "");
  const method = paymentMethods.find((m) => m.id === methodId);
  if (!method) return fail("Choose a payment method.", 422, { payment_method_id: ["Choose a payment method."] });
  const lines = Array.isArray(body.items)
    ? (body.items as Array<{ product_id: string; variant_id?: string; quantity: number }>).map((i, n) => ({ id: String(n), product_id: i.product_id, variant_id: i.variant_id, quantity: Number(i.quantity) || 1 }))
    : s.cart;
  if (!lines.length) return fail("Your cart is empty.");
  let address: Addr;
  let charge: number;
  if (guest) {
    for (const field of ["name", "email", "phone"]) if (!body[field]) return fail(`The ${field} field is required.`, 422, { [field]: [`The ${field} field is required.`] });
    const part = ((body.shipping_address as Body).addresses as Body[])[0];
    const loc = shippingLocations.find((l) => l.province.id === part.province_id && l.area_code === part.area_code);
    if (!part.address) return fail("The address field is required.", 422, { address: ["The address field is required."] });
    address = { name: String(body.name), phone: String(body.phone), address: `${part.address}, ${loc?.name ?? ""}` };
    charge = loc?.charge ?? 0;
  } else {
    const saved = s.addresses.find((a) => a.id === body.shipping_address_id);
    if (!saved) return fail("Choose a shipping address.");
    const part = saved.addresses[0];
    address = { name: saved.name, phone: saved.phone, address: saved.full_address };
    charge = shippingLocations.find((l) => l.province.id === part.province_id && l.area_code === part.area_code)?.charge ?? 0;
  }
  const n = s.orders.length + 1;
  const items = lines.map((l, i): OrderItem => ({ sale_item_id: `si-n${n}-${i}`, product_id: l.product_id, variant_id: l.variant_id, name: productById(l.product_id)!.product_name, quantity: l.quantity }));
  const order: Order = {
    id: nextId("ord"), order_number: `HOL-${1000 + n + 10}`, order_status: "pending", delivery_status: "pending", order_date: date(), delivered: false,
    total_amount: items.reduce((sum, i) => sum + unitPrice(i.product_id, i.variant_id).effective * i.quantity, 0) + charge,
    payment: { gateway: method.payment_type, status: "pending", can_retry: false },
    billing_address: address, shipping_address: address, items, cancellation_request_status: null, return_requests: [],
    guest_token: guest ? `guest-${crypto.randomUUID()}` : undefined,
  };
  s.orders.unshift(order);
  if (!body.items) s.cart = [];
  return ok({ data: { id: order.id, order_number: order.order_number, guest_access_token: order.guest_token } }, 201);
}

// ---- router ----
function route(request: Request, path: string[], body: Body): Response {
  const s = store();
  const url = new URL(request.url);
  const q = url.searchParams;
  const method = request.method.toUpperCase();
  const authed = (request.headers.get("cookie") || "").includes(`${SESSION}=1`);
  const [a, b, c, d, e] = path;
  const m = (...allowed: string[]) => allowed.includes(method);
  const signedIn = (customer: Customer = s.customer) =>
    ok({ data: customer, customer }, 200, { "set-cookie": `${SESSION}=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400` });

  // catalogue
  if (a === "products") {
    if (b === "categories") return ok(paginate(categories, q));
    if (!b) return ok(listProducts(q));
    const product = productById(b);
    if (!product) return fail("Product not found.", 404);
    if (c === "variants") return ok({ data: variantsOf(product.id) });
    if (c === "reviews" && method === "POST") {
      if (!authed) return fail("Unauthenticated.", 401);
      if (!body.rating) return fail("The rating field is required.", 422, { rating: ["The rating field is required."] });
      return ok({ message: "Thanks! Your review was submitted for moderation." }, 201);
    }
    if (c === "reviews") return ok(paginate(reviewsOf(product.id), q));
    return ok({ data: product });
  }
  if (a === "brands") return ok(paginate(brands, q));
  if (a === "flash-sales" && b === "active") return ok(activeFlashSales(q));

  // checkout configuration
  if (a === "shipping" && b === "addresses") return ok({ data: shippingLocations });
  if (a === "customer" && b === "payment-methods") return ok({ data: paymentMethods });

  // auth
  if (a === "customer" && m("POST") && ["login", "register"].includes(b)) {
    const email = String(body.email || "demo@holier.test");
    if (b === "register") s.customer = { ...s.customer, name: String(body.name || "Demo Customer"), email };
    return signedIn();
  }
  if (a === "customer" && b === "logout") return ok({ message: "Logged out." }, 200, { "set-cookie": `${SESSION}=; Path=/; Max-Age=0` });
  if (a === "customer" && ["forgot-password", "reset-password"].includes(b)) return ok({ message: "Demo mode: password email skipped." });
  if (a === "customer" && b === "auth") return c === "redirect" ? fail("Google sign-in is disabled in demo mode.", 400) : signedIn();

  // cart (guest-friendly)
  if (a === "cart") {
    if (b === "merge") return ok(renderCart(s));
    if (b === "items" && method === "POST") {
      const product = productById(String(body.product_id));
      if (!product) return fail("Product not found.", 404);
      const variants = variantsOf(product.id);
      const variantId = String(body.product_variant_id || variants.find((v) => v.stock_status !== "out_of_stock")?.id || "");
      if (unitPrice(product.id, variantId).stock === "out_of_stock") return fail("This item is out of stock.");
      const existing = s.cart.find((l) => l.product_id === product.id && l.variant_id === variantId);
      const quantity = Math.max(1, Number(body.quantity) || 1);
      if (existing) existing.quantity = Math.min(10, existing.quantity + quantity);
      else s.cart.push({ id: nextId("ci"), product_id: product.id, variant_id: variantId, quantity: Math.min(10, quantity) });
      return ok(renderCart(s), 201);
    }
    if (b === "items") {
      const line = s.cart.find((l) => l.id === c);
      if (!line) return fail("Cart item not found.", 404);
      if (method === "PATCH") line.quantity = Math.min(10, Math.max(1, Number(body.quantity) || 1));
      else s.cart = s.cart.filter((l) => l !== line);
      return ok(renderCart(s));
    }
    if (method === "DELETE") s.cart = [];
    return ok(renderCart(s));
  }

  // wishlist (guest-friendly)
  if (a === "wishlist") {
    if (b === "items" && !c && method === "POST") {
      const variant = (body.product_variant_id as string | undefined) || null;
      if (!s.wishlist.some((i) => i.product_id === body.product_id && i.product_variant_id === variant)) s.wishlist.push({ id: nextId("wl"), product_id: String(body.product_id), product_variant_id: variant });
      return ok(renderWishlist(s), 201);
    }
    if (b === "items") {
      const item = s.wishlist.find((i) => i.id === c);
      if (!item) return fail("Wishlist item not found.", 404);
      if (d === "move-to-cart") {
        const variant = item.product_variant_id || variantsOf(item.product_id).find((v) => v.stock_status !== "out_of_stock")?.id;
        if (!variant || unitPrice(item.product_id, variant).stock === "out_of_stock") return fail("This item is out of stock.");
        const line = s.cart.find((l) => l.product_id === item.product_id && l.variant_id === variant);
        if (line) line.quantity += 1; else s.cart.push({ id: nextId("ci"), product_id: item.product_id, variant_id: variant, quantity: 1 });
      }
      s.wishlist = s.wishlist.filter((i) => i !== item);
      return ok(renderWishlist(s));
    }
    return ok(renderWishlist(s));
  }

  // guest orders
  if (a === "guest" && b === "order") {
    if (!c) return method === "POST" ? createOrder(s, body, true) : fail("Not found.", 404);
    const token = String(q.get("guest_access_token") || body.guest_access_token || "");
    const order = s.orders.find((o) => o.order_number === c && o.guest_token && o.guest_token === token);
    return order ? orderAction(order, d, e, method, body) : fail("Order not found.", 404);
  }

  // everything below needs a signed-in customer
  if (!authed) return fail("Unauthenticated.", 401);

  if (a === "customer" && b === "profile") {
    if (method === "DELETE") return ok({ message: "Account deleted." }, 200, { "set-cookie": `${SESSION}=; Path=/; Max-Age=0` });
    if (method === "POST") s.customer = { ...s.customer, ...body } as Customer;
    return ok({ data: s.customer });
  }
  if (a === "customer" && b === "password" && c === "change") return ok({ message: "Password updated." });
  if (a === "customer" && b === "address") {
    if (method === "GET") return ok({ data: s.addresses });
    if (method === "DELETE") { s.addresses = s.addresses.filter((x) => x.id !== c); return ok({ message: "Address deleted." }); }
    for (const field of ["name", "phone"]) if (!body[field]) return fail(`The ${field} field is required.`, 422, { [field]: [`The ${field} field is required.`] });
    const part = (body.addresses as Array<Record<string, unknown>>)[0];
    const loc = shippingLocations.find((l) => l.province.id === part.province_id && l.area_code === part.area_code);
    const saved: Address = { id: c || nextId("addr"), name: String(body.name), phone: String(body.phone), label: String(body.label || "home"), billing_default: !!body.billing_default, shipping_default: !!body.shipping_default, full_address: `${part.address}, ${loc?.province.name ?? ""}, ${loc?.name ?? ""}`, addresses: [part] };
    if (saved.billing_default) s.addresses.forEach((x) => (x.billing_default = false));
    if (saved.shipping_default) s.addresses.forEach((x) => (x.shipping_default = false));
    s.addresses = c ? s.addresses.map((x) => (x.id === c ? saved : x)) : [...s.addresses, saved];
    return ok({ data: saved }, c ? 200 : 201);
  }

  if (a === "order") {
    if (!b) return method === "POST" ? createOrder(s, body, false) : ok(paginate(s.orders.filter((o) => !o.guest_token).map(renderOrder), q));
    const order = s.orders.find((o) => o.id === b && !o.guest_token);
    return order ? orderAction(order, c, d, method, body) : fail("Order not found.", 404);
  }

  return fail("Not found.", 404);
}

function orderAction(order: Order, action: string | undefined, sub: string | undefined, method: string, body: Body) {
  if (!action) return ok({ data: renderOrder(order) });
  if (action === "cancellation-request") {
    if (!body.reason) return fail("Enter a reason.", 422, { reason: ["The reason field is required."] });
    order.cancellation_request_status = "pending";
    return ok({ data: { order_status: order.order_status, cancellation_request_status: "pending", can_request_cancellation: false } });
  }
  if (action === "return-requests") {
    if (method === "POST" && !sub) {
      const wanted = (body.items as Array<{ sale_item_id: string; quantity: string }>) ?? [];
      const rendered = renderOrder(order).returnable_items;
      for (const w of wanted) if (Number(w.quantity) > (rendered.find((r) => r.sale_item_id === w.sale_item_id)?.requestable_quantity ?? 0)) return fail("Quantity exceeds what can be returned.", 422, { items: ["Quantity exceeds what can be returned."] });
      order.return_requests.unshift({
        id: nextId("ret"), status: "pending_review", reason: String(body.reason), notes: (body.notes as string) || null, requested_resolution: body.requested_resolution === "exchange" ? "exchange" : "refund",
        requested_at: new Date().toISOString(), can_withdraw: true,
        items: wanted.map((w) => ({ sale_item_id: w.sale_item_id, name: order.items.find((i) => i.sale_item_id === w.sale_item_id)?.name ?? "", unit: "pcs", requested_quantity: Number(w.quantity) })),
      });
    } else if (sub) {
      const request = order.return_requests.find((r) => r.id === sub);
      if (request) { request.status = "cancelled_by_customer"; request.can_withdraw = false; }
    }
    const { can_request_return, returnable_items, return_requests } = renderOrder(order);
    return ok({ data: { can_request_return, returnable_items, return_requests } });
  }
  return fail("Not found.", 404);
}

export async function demoResponse(request: Request, path: string[]): Promise<Response> {
  const method = request.method.toUpperCase();
  const type = request.headers.get("content-type") || "";
  // Profile edits arrive as multipart (avatar upload); everything else is JSON.
  const body: Body = method === "GET" || method === "HEAD" || method === "DELETE" ? {}
    : type.includes("multipart/form-data") ? Object.fromEntries([...(await request.formData()).entries()].filter(([, v]) => typeof v === "string"))
    : await request.json().catch(() => ({}));
  const cookies = readCookies(request.headers.get("cookie") || "");
  const { state, raw } = loadState(cookies);
  cur = state;
  const response = route(request, path, body); // synchronous: nothing else runs while `cur` is set
  cur = undefined;
  const secure = new URL(request.url).protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  return withState(response, state, raw, cookies, secure);
}

/** Server-side GET used by lib/api/server.ts in place of the real backend. */
export async function demoGet<T>(path: string): Promise<T> {
  const response = await demoResponse(new Request(`http://demo.local/${path.replace(/^\//, "")}`), path.split("?")[0].split("/").filter(Boolean));
  if (!response.ok) throw Object.assign(new Error(`Demo API request failed (${response.status})`), { status: response.status });
  return response.json() as Promise<T>;
}
