const backendOrigin = () => new URL(process.env.BACKEND_API_URL || "").origin;

export async function GET(request: Request) {
  if (process.env.DEMO_MODE === "true") return new Response(null, { status: 204 });
  if (!process.env.BACKEND_API_URL) return Response.json({ message: "BACKEND_API_URL is not configured." }, { status: 500 });
  const response = await fetch(`${backendOrigin()}/sanctum/csrf-cookie`, {
    headers: { Accept: "application/json", Cookie: request.headers.get("cookie") || "" },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const headers = new Headers();
  const secure = new URL(request.url).protocol === "https:";
  response.headers.getSetCookie().forEach((cookie) => {
    cookie = cookie.replace(/;\s*Domain=[^;]+/i, "");
    headers.append("set-cookie", secure ? cookie : cookie.replace(/;\s*Secure/gi, ""));
  });
  return new Response(response.body, { status: response.status, headers });
}
