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
    exchangeSocialCode(code).then(() => router.replace("/account")).catch((reason) => setError(reason instanceof Error ? reason.message : "Social login failed."));
  }, [code, exchangeSocialCode, router]);
  return <main><p role={error ? "alert" : "status"}>{error || "Completing sign in…"}</p></main>;
}
