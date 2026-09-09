"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { storefrontRequest } from "@/lib/api/client";

type Order = { order_number: string; order_status: string; delivery_status?: string; order_date: string; total_amount: number; shipping_address?: { name?: string; phone?: string; address?: string } };

export default function GuestOrderConfirmation({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const key = `holier-guest-order-${orderNumber}`;
    const token = sessionStorage.getItem(key);
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("This confirmation link is no longer available in this browser session.");
      return;
    }
    storefrontRequest<{ data: Order }>(`guest/order/${encodeURIComponent(orderNumber)}?guest_access_token=${encodeURIComponent(token)}`)
      .then((payload) => { setOrder(payload.data); sessionStorage.removeItem(key); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load order confirmation."));
  }, [orderNumber]);
  if (error) return <main><p role="alert">{error}</p><Link href="/shop">Continue shopping</Link></main>;
  if (!order) return <main><p>Loading confirmation…</p></main>;
  return <main><h1>Thank you for your order</h1><p>Order {order.order_number} was placed successfully.</p><p>{order.order_status} · {order.delivery_status || "pending"}</p><time>{order.order_date}</time><h2>Delivery</h2><p>{order.shipping_address?.name}<br />{order.shipping_address?.phone}<br />{order.shipping_address?.address}</p><strong>Total: Rs. {Number(order.total_amount).toLocaleString()}</strong><p><Link href="/shop">Continue shopping</Link></p></main>;
}
