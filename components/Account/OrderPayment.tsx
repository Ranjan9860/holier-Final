"use client";

import { useRef, useState } from "react";
import { storefrontRequest } from "@/lib/api/client";
import { submitEsewaPayment, type EsewaPayment } from "@/lib/esewa";
import styles from "./OrderDetail.module.css";

export type PaymentSummary = {
  gateway: string;
  status: string;
  can_retry: boolean;
  review_reason?: string | null;
};

export default function OrderPayment({ payment, path, guestAccessToken, onResolved }: {
  payment?: PaymentSummary | null;
  path: string;
  guestAccessToken?: string;
  onResolved?: (result: { payment?: PaymentSummary | null; order_status?: string }) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  if (payment?.gateway !== "esewa") return null;

  const canRetry = !payment.review_reason && (payment.status === "pending" || (payment.status === "failed" && payment.can_retry === true));

  async function retry() {
    if (!canRetry || submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      const response = await storefrontRequest<{ data: { payment: EsewaPayment } }>(`${path}/payments/esewa/retry`, {
        method: "POST",
        body: JSON.stringify(guestAccessToken ? { guest_access_token: guestAccessToken } : {}),
      });
      if (!submitEsewaPayment(response.data.payment)) throw new Error("Unable to start eSewa payment.");
    } catch (reason) {
      let message = reason instanceof Error ? reason.message : "Unable to retry eSewa payment.";
      try {
        const query = guestAccessToken ? `?guest_access_token=${encodeURIComponent(guestAccessToken)}` : "";
        const refreshed = await storefrontRequest<{ data: { payment?: PaymentSummary | null; order_status?: string } }>(`${path}${query}`);
        onResolved?.(refreshed.data);
        if (refreshed.data.payment?.status === "paid") message = "";
        else if (refreshed.data.payment?.status === "pending") message = "Your payment is still processing. Please check again later.";
      } catch {
        // Keep the original retry error if refreshing the order also fails.
      }
      setError(message);
      submitting.current = false;
      setPending(false);
    }
  }

  return <section className={styles.cancellation} aria-label="Payment details">
    <h2>Payment Details</h2>
    <p>eSewa: {payment.status}</p>
    {payment.review_reason && <p>{payment.review_reason}</p>}
    {canRetry && <button type="button" disabled={pending} onClick={retry}>{pending ? "Checking payment…" : "Retry payment"}</button>}
    {error && <p className={styles.cancellationError} role="alert">{error}</p>}
  </section>;
}
