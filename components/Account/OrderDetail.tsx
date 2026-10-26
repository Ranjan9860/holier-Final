"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PageLoader from "@/components/PageLoader";
import OrderPayment, { type PaymentSummary } from "./OrderPayment";
import OrderReturns, { type ReturnState } from "./OrderReturns";
import OrderCancellation, { type CancellationState } from "./OrderCancellation";
import { useAuth } from "@/context/AuthContext";
import { storefrontRequest } from "@/lib/api/client";
import styles from "./OrderDetail.module.css";

export type Order = CancellationState & ReturnState & { payment?: PaymentSummary | null; order_number: string; order_status?: string; order_date: string; total_amount: number; billing_address?: { name?: string; phone?: string; address?: string }; shipping_address?: { name?: string; phone?: string; address?: string }; items?: Array<{ product_id: string; variant_id?: string; name?: string; quantity?: string | number }> };

export default function OrderDetail({ id }: { id: string }) {
  const { customer, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (loading) return;
    if (!customer) {
      router.replace(`/auth?returnTo=${encodeURIComponent(`/order/${id}`)}`);
      return;
    }
    storefrontRequest<{ data: Order }>(`order/${id}`).then((payload) => setOrder(payload.data)).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load order."));
  }, [customer, id, loading, router]);
  if (!customer) return null;
  if (!order && !error) return <PageLoader />;
  if (error) return <main className={styles.page}><div className="container"><div className={styles.errorState}><span className="eyebrow">Order unavailable</span><h1>We couldn’t load this order</h1><p role="alert">{error}</p><Link href="/account?tab=orders">Return to orders</Link></div></div></main>;

  return <OrderDetails order={order!} backHref="/account?tab=orders" backLabel="All orders" cancellationPath={`order/${encodeURIComponent(id)}`} onResolved={(result) => setOrder((current) => current ? { ...current, ...result } : current)} />;
}

export function OrderDetails({ order, backHref, backLabel, cancellationPath, guestAccessToken, onResolved }: { order: Order; backHref: string; backLabel: string; cancellationPath: string; guestAccessToken?: string; onResolved: (result: CancellationState & ReturnState & { payment?: PaymentSummary | null }) => void }) {
  const shipping = order.shipping_address;
  const billing = order.billing_address;
  const orderStatus = order.order_status || "pending";
  return <main className={styles.page}><div className="container">
    <Link href={backHref} className={styles.backLink}>← {backLabel}</Link>
    <header className={styles.hero}>
      <div><span className="eyebrow">Order Details</span><h1>{order.order_number}</h1></div>
      <div className={styles.statuses}><span>Order · {orderStatus}</span></div>
    </header>
    <section className={styles.summary} aria-label="Order summary">
      <div><span>Placed</span><time dateTime={order.order_date}>{order.order_date}</time></div>
      <div><span>Items</span><strong>{order.items?.length ?? 0}</strong></div>
      <div className={styles.summaryTotal}><span>Order total</span><strong>Rs. {Number(order.total_amount).toLocaleString()}</strong></div>
    </section>
    <OrderPayment payment={order.payment} path={cancellationPath} guestAccessToken={guestAccessToken} onResolved={onResolved} />
    <div className={styles.content}>
      <section className={styles.itemsSection}><div className={styles.sectionTitle}><span className="eyebrow">Your purchase</span><h2>Order items</h2></div>
        {order.items?.length ? <ol className={styles.itemList}>{order.items.map((item, index) => <li key={`${item.product_id}-${item.variant_id || "base"}`}><span className={styles.itemNumber}>{String(index + 1).padStart(2, "0")}</span><div><Link href={`/product/${item.product_id}`}>{item.name || `Product ${String(index + 1).padStart(2, "0")}`}</Link>{item.quantity != null && <span>× {Number(item.quantity).toLocaleString()}</span>}</div></li>)}</ol> : <p className={styles.emptyItems}>Item details are not available for this order.</p>}
      </section>
      <aside className={styles.addresses}>
        <Address title="Shipping address" address={shipping} />
        <Address title="Billing address" address={billing} />
      </aside>
    </div>
    <OrderCancellation order={order} path={cancellationPath} guestAccessToken={guestAccessToken} onResolved={onResolved} />
    <OrderReturns order={order} path={cancellationPath} guestAccessToken={guestAccessToken} onResolved={onResolved} />
  </div></main>;
}

function Address({ title, address }: { title: string; address?: { name?: string; phone?: string; address?: string } }) {
  return <section className={styles.address}><span className="eyebrow">{title}</span><h2>{address?.name || "Not provided"}</h2>{address?.phone && <a href={`tel:${address.phone}`}>{address.phone}</a>}<p>{address?.address || "Address unavailable"}</p></section>;
}
