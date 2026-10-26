"use client";

import { useEffect, useState } from "react";

export default function FlashSaleTimer({ endsAt }: { endsAt?: string }) {
  const [remaining, setRemaining] = useState<number>();

  useEffect(() => {
    if (!endsAt) return;
    const update = () => setRemaining(Math.max(0, new Date(endsAt).getTime() - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  if (!endsAt || remaining === undefined) return null;
  if (remaining === 0) return <time dateTime={endsAt}>Sale ended</time>;

  const seconds = Math.floor(remaining / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return <time dateTime={endsAt}>Ends in {days ? `${days}d ` : ""}{String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</time>;
}
