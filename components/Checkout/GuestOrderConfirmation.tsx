"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderDetails, type Order } from "@/components/Account/OrderDetail";
import styles from "@/components/Account/OrderDetail.module.css";
import PageLoader from "@/components/PageLoader";
import { storefrontRequest } from "@/lib/api/client";

export default function GuestOrderConfirmation({ orderNumber, guestAccessToken }: { orderNumber: string; guestAccessToken: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!guestAccessToken) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("This order link is missing its guest access token.");
      return;
    }
    storefrontRequest<{ data: Order }>(`guest/order/${encodeURIComponent(orderNumber)}?guest_access_token=${encodeURIComponent(guestAccessToken)}`)
      .then((payload) => setOrder(payload.data))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load order confirmation."));
  }, [guestAccessToken, orderNumber]);
  if (error) return <main className={styles.page}><div className="container"><div className={styles.errorState}><span className="eyebrow">Order unavailable</span><h1>We couldn’t load this order</h1><p role="alert">{error}</p><Link href="/shop">Continue shopping</Link></div></div></main>;
  if (!order) return <PageLoader />;
  return <OrderDetails order={order} backHref="/shop" backLabel="Continue shopping" cancellationPath={`guest/order/${encodeURIComponent(orderNumber)}`} guestAccessToken={guestAccessToken} onResolved={(result) => setOrder((current) => current ? { ...current, ...result } : current)} />;
}
