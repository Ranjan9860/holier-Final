import "server-only";
import { demoGet, isDemoMode } from "@/lib/demo/backend";

const baseUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");
const token = process.env.STOREFRONT_TOKEN;

export async function apiGet<T>(path: string): Promise<T> {
  if (isDemoMode()) return demoGet<T>(path);
  if (!baseUrl || !token) {
    throw new Error("BACKEND_API_URL and STOREFRONT_TOKEN must be configured");
  }

  const response = await fetch(`${baseUrl}/${path.replace(/^\//, "")}`, {
    headers: { Accept: "application/json", "X-Storefront-Token": token },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw Object.assign(
      new Error(`Storefront API request failed (${response.status})`),
      { status: response.status },
    );
  }

  return response.json() as Promise<T>;
}
