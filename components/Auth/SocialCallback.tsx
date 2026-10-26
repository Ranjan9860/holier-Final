"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SocialCallback({ code }: { code: string }) {
  const [error, setError] = useState("");
  const { exchangeSocialCode } = useAuth();
  const router = useRouter();
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    // Exchange the backend's one-time code for the normal customer session.
    exchangeSocialCode(code).then(() => {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({ type: "holier-social-auth-success" }, window.location.origin);
        window.close();
        return;
      }
      const returnTo = sessionStorage.getItem("holier-auth-return-to") || "/account";
      sessionStorage.removeItem("holier-auth-return-to");
      router.replace(returnTo.startsWith("/") && !returnTo.startsWith("//") && !returnTo.startsWith("/auth") ? returnTo : "/account");
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Social login failed."));
  }, [code, exchangeSocialCode, router]);
  return <main><p role={error ? "alert" : "status"}>{error || "Completing sign in…"}</p></main>;
}
