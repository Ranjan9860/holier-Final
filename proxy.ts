import { NextResponse } from "next/server";
import { allowIndexing } from "@/lib/indexing";

export function proxy() {
  const response = NextResponse.next();
  if (!allowIndexing()) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet, noimageindex");
  }
  return response;
}

export const config = { matcher: "/((?!_next/static|_next/image).*)" };
