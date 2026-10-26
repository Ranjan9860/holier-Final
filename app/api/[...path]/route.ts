import { demoResponse, isDemoMode } from "@/lib/demo/backend";

const baseUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (isDemoMode()) return demoResponse(request, path);
  if (!baseUrl || !process.env.STOREFRONT_TOKEN) {
    return Response.json({ message: "Storefront API is not configured" }, { status: 503 });
  }

  const incoming = new URL(request.url);
  const target = new URL(`${baseUrl}/${path.map(encodeURIComponent).join("/")}`);
  target.search = incoming.search;

  const headers = new Headers({
    Accept: "application/json",
    "X-Storefront-Token": process.env.STOREFRONT_TOKEN,
  });
  for (const name of [
    "content-type",
    "cookie",
    "x-cart-token",
    "x-wishlist-token",
    "x-xsrf-token",
    "origin",
    "referer",
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) headers.set("x-forwarded-for", forwardedFor);
  headers.set("x-forwarded-proto", incoming.protocol.slice(0, -1));

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const responseHeaders = new Headers();
    responseHeaders.set("content-type", response.headers.get("content-type") || "application/json");
    response.headers.getSetCookie().forEach((cookie) => {
      cookie = cookie.replace(/;\s*Domain=[^;]+/i, "");
      responseHeaders.append("set-cookie", incoming.protocol === "https:" ? cookie : cookie.replace(/;\s*Secure/gi, ""));
    });
    return new Response(response.body, { status: response.status, headers: responseHeaders });
  } catch {
    return Response.json({ message: "Unable to reach the storefront API" }, { status: 502 });
  }
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
