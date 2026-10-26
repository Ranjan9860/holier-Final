"use client";

import { useState, type FormEvent } from "react";
import { StorefrontError, storefrontRequest } from "@/lib/api/client";
import styles from "./OrderDetail.module.css";

export type CancellationState = {
  order_status?: string;
  can_request_cancellation?: boolean;
  can_request_return?: boolean;
  cancellation_request_status?: string | null;
  cancellation_request_resolution_note?: string | null;
  return_required?: boolean;
};

export default function OrderCancellation({ order, path, guestAccessToken, onResolved }: {
  order: CancellationState;
  path: string;
  guestAccessToken?: string;
  onResolved: (result: CancellationState) => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [open, setOpen] = useState(false);
  const pending = order.cancellation_request_status === "pending";
  const cancelled = order.order_status === "cancelled";
  const rejected = order.cancellation_request_status === "rejected";
  const canRequest = order.can_request_cancellation === true && !pending && !cancelled;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !canRequest) return;
    setError("");
    setReasonError("");
    if (!reason.trim() || reason.trim().length > 500) {
      setReasonError(!reason.trim() ? "Enter a reason for requesting cancellation." : "The reason may not exceed 500 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await storefrontRequest<{ data: CancellationState }>(`${path}/cancellation-request`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim(), ...(guestAccessToken ? { guest_access_token: guestAccessToken } : {}) }),
      });
      onResolved({ ...response.data, can_request_cancellation: false });
      setOpen(false);
    } catch (failure) {
      if (failure instanceof StorefrontError && failure.errors.reason?.[0]) setReasonError(failure.errors.reason[0]);
      else setError(failure instanceof Error ? failure.message : "Unable to request cancellation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!cancelled && !pending && !rejected && (!order.return_required || order.can_request_return) && !canRequest) return null;
  const tone = cancelled ? "toneMuted" : pending ? "tonePending" : rejected ? "toneRejected" : "toneNeutral";
  return <section className={`${styles.cancellation} ${styles[tone]}`} aria-label="Order cancellation">
    <div role="status" aria-live="polite" className={styles.noticeHead}>
      <span className={styles.noticeDot} aria-hidden="true" />
      <div>
        {cancelled ? <h2>Cancelled</h2> : pending ? <h2>Cancellation requested, awaiting review</h2> : rejected ? <h2>Request rejected</h2> : order.return_required ? <h2>Return required</h2> : <h2>Need to cancel?</h2>}
        {rejected && order.cancellation_request_resolution_note && <p>{order.cancellation_request_resolution_note}</p>}
        {pending && <p>Your order is awaiting cancellation review. It has not been cancelled yet.</p>}
        {order.return_required && !cancelled && <p>This order has already been sold. Contact us to arrange a return for eligible items.</p>}
        {canRequest && !order.return_required && <p>Cancellation requests are reviewed before anything changes.</p>}
      </div>
      {canRequest && <button type="button" className={`${styles.dangerButton} ${styles.inlineAction}`} onClick={() => setOpen(true)}>Request cancellation</button>}
    </div>
    {canRequest && open && <dialog className={styles.modal} aria-labelledby="cancellation-title" ref={(el) => { if (el && !el.open) { el.showModal(); el.querySelector<HTMLElement>("textarea")?.focus(); } }} onClose={() => setOpen(false)} onCancel={(event) => { if (submitting) event.preventDefault(); }} onClick={(event) => { if (event.target === event.currentTarget && !submitting) event.currentTarget.close(); }}>
      <header className={styles.modalHead}>
        <h2 id="cancellation-title">Request cancellation</h2>
        <button type="button" className={styles.modalClose} aria-label="Close" disabled={submitting} onClick={(event) => event.currentTarget.closest("dialog")?.close()}>×</button>
      </header>
      <form onSubmit={submit} noValidate className={styles.formBody}>
        <p className={styles.hint}>Orders already with a courier require review. Delivered goods may require a return. A cancellation request does not issue a refund.</p>
        <label htmlFor="cancellation-reason">Reason for cancellation</label>
        <textarea id="cancellation-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} required disabled={submitting} placeholder="Tell us why you want to cancel this order" aria-invalid={!!reasonError} aria-describedby={reasonError ? "cancellation-reason-error" : undefined} />
        <div className={styles.fieldMeta}>
          {reasonError ? <p id="cancellation-reason-error" className={styles.cancellationError} role="alert">{reasonError}</p> : <span />}
          <span className={styles.counter}>{reason.length}/500</span>
        </div>
        {error && <p className={styles.cancellationError} role="alert">{error}</p>}
        <button type="submit" disabled={submitting} className={styles.dangerButton}>{submitting ? "Submitting…" : "Request cancellation"}</button>
      </form>
    </dialog>}
  </section>;
}
