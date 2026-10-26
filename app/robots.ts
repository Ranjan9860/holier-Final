import type { MetadataRoute } from "next";
import { allowIndexing } from "@/lib/indexing";

// Read the environment per request so one build can be promoted between environments.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return { rules: allowIndexing() ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" } };
}
