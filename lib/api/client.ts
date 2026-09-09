type TokenKind = "cart" | "wishlist";

export class StorefrontError extends Error {
  readonly errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]> = {}) {
    super(message);
    this.errors = errors;
  }
}

const tokenConfig = {
  cart: { storage: "holier-cart-token", header: "X-Cart-Token", meta: "cart_token" },
  wishlist: { storage: "holier-wishlist-token", header: "X-Wishlist-Token", meta: "wishlist_token" },
} as const;

let csrfRequest: Promise<Response> | undefined;
const inflightGets = new Map<string, Promise<unknown>>();

function cookie(name: string) {
  const value = document.cookie.split("; ").find((item) => item.startsWith(`${name}=`))?.split("=").slice(1).join("=");
  return value ? decodeURIComponent(value) : undefined;
}

async function ensureCsrf() {
  csrfRequest ||= fetch("/api/csrf", { credentials: "include" });
  try {
    const response = await csrfRequest;
    if (response.ok) return;
    throw new StorefrontError("Unable to initialize the secure session.");
  } finally {
    csrfRequest = undefined;
  }
}

export async function storefrontRequest<T = unknown>(
  path: string,
  init: RequestInit = {},
  tokenKind?: TokenKind,
): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  // Dev's React StrictMode (and any other accidental double-fire) mounts effects twice,
  // firing duplicate GETs. Share one in-flight promise per path instead of hitting the API twice.
  if (method === "GET") {
    const existing = inflightGets.get(path);
    if (existing) return existing as Promise<T>;
    const request = runStorefrontRequest<T>(path, init, tokenKind).finally(() => inflightGets.delete(path));
    inflightGets.set(path, request);
    return request;
  }
  return runStorefrontRequest<T>(path, init, tokenKind);
}

async function runStorefrontRequest<T>(
  path: string,
  init: RequestInit,
  tokenKind?: TokenKind,
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body) headers.set("Content-Type", "application/json");
  if (tokenKind) {
    const config = tokenConfig[tokenKind];
    const token = localStorage.getItem(config.storage);
    if (token) headers.set(config.header, token);
  }
  const method = (init.method || "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    await ensureCsrf();
    const xsrf = cookie("XSRF-TOKEN");
    if (xsrf) headers.set("X-XSRF-TOKEN", xsrf);
  }

  let response = await fetch(`/api/${path}`, { ...init, headers, credentials: "include" });
  if (response.status === 419 && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    await ensureCsrf();
    const xsrf = cookie("XSRF-TOKEN");
    if (xsrf) headers.set("X-XSRF-TOKEN", xsrf);
    response = await fetch(`/api/${path}`, { ...init, headers, credentials: "include" });
  }
  const payload = await response.json().catch(() => ({})) as { message?: string; errors?: Record<string, string[]>; meta?: Record<string, string> };
  if (!response.ok) throw new StorefrontError(payload.message || `Request failed (${response.status}).`, payload.errors);
  if (tokenKind) {
    const config = tokenConfig[tokenKind];
    const token = payload.meta?.[config.meta];
    if (token) localStorage.setItem(config.storage, token);
  }
  return payload as T;
}
