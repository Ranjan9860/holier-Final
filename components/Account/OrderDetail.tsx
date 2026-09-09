"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { storefrontRequest } from "@/lib/api/client";

type Order = { order_number: string; order_status: string; delivery_status?: string; order_date: string; total_amount: number; billing_address?: { name?: string; phone?: string; address?: string }; shipping_address?: { name?: string; phone?: string; address?: string }; items?: Array<{ product_id: string; variant_id?: string }> };

export default function OrderDetail({ id }: { id: string }) {
  const { customer, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (loading) return;
    if (!customer) {
      router.replace("/auth");
      return;
    }
    storefrontRequest<{ data: Order }>(`order/${id}`).then((payload) => setOrder(payload.data)).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load order."));
  }, [customer, id, loading, router]);
  if (!customer) return null;
  if (error) return <main><p role="alert">{error}</p><Link href="/account?tab=orders">Back to orders</Link></main>;
  if (!order) return <main><p>Loading order…</p></main>;
  return <main><Link href="/account?tab=orders">Back to orders</Link><h1>{order.order_number}</h1><p>{order.order_status} · {order.delivery_status || "pending"}</p><time>{order.order_date}</time><h2>Shipping</h2><p>{order.shipping_address?.name}<br />{order.shipping_address?.phone}<br />{order.shipping_address?.address}</p><h2>Billing</h2><p>{order.billing_address?.name}<br />{order.billing_address?.phone}<br />{order.billing_address?.address}</p><h2>Items</h2><ul>{order.items?.map((item) => <li key={`${item.product_id}-${item.variant_id || "base"}`}>{item.product_id}{item.variant_id ? ` · Variant ${item.variant_id}` : ""}</li>)}</ul><strong>Total: Rs. {Number(order.total_amount).toLocaleString()}</strong></main>;
}
