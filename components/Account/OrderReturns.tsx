"use client";

import { useRef, useState, type FormEvent } from "react";
import { StorefrontError, storefrontRequest } from "@/lib/api/client";
import styles from "./OrderDetail.module.css";

export type ReturnItem = { sale_item_id: string; name: string; unit?: string; sold_quantity: string | number; remaining_quantity: string | number; requestable_quantity: string | number };
export type ReturnRequest = { id: string; status: string; reason: string; notes?: string | null; requested_resolution: "refund" | "exchange"; resolution_note?: string | null; requested_at?: string; can_withdraw: boolean; items: Array<{ sale_item_id: string; name: string; unit?: string; requested_quantity: string | number; approved_quantity?: string | number | null; received_quantity?: string | number | null }> };
export type ReturnState = { can_request_return?: boolean; returnable_items?: ReturnItem[]; return_requests?: ReturnRequest[] };

const statusLabels: Record<string, string> = { pending_review: "Awaiting review", approved_awaiting_item: "Approved, awaiting items", item_received: "Items received and inspected", completed: "Return completed", rejected: "Rejected", cancelled_by_customer: "Withdrawn" };
const steps = ["pending_review", "approved_awaiting_item", "item_received", "completed"];
const stepLabels = ["Requested", "Approved", "Received", "Completed"];

export default function OrderReturns({ order, path, guestAccessToken, onResolved }: { order: ReturnState; path: string; guestAccessToken?: string; onResolved: (result: ReturnState) => void }) {
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [resolution, setResolution] = useState<"refund" | "exchange">("refund");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const submission = useRef<{ body: string; key: string } | null>(null);
  const eligible = (order.returnable_items ?? []).filter(item => Number(item.requestable_quantity) > 0);
  const requests = order.return_requests ?? [];
  if (!order.can_request_return && !requests.length) return null;

  function failureMessage(failure: unknown): string {
    if (failure instanceof StorefrontError) return Object.values(failure.errors).flat()[0] || failure.message;
    return failure instanceof Error ? failure.message : "Unable to update your return request.";
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const items = eligible.filter(item => Number(quantities[item.sale_item_id]) > 0).map(item => ({ sale_item_id: item.sale_item_id, quantity: quantities[item.sale_item_id] }));
    if (!reason.trim() || reason.trim().length > 500) { setError("Enter a return reason of up to 500 characters."); return; }
    if (!items.length) { setError("Select at least one item and a positive quantity."); return; }
    if (eligible.some(item => quantities[item.sale_item_id] && (!Number.isFinite(Number(quantities[item.sale_item_id])) || Number(quantities[item.sale_item_id]) < 0 || Number(quantities[item.sale_item_id]) > Number(item.requestable_quantity)))) { setError("Enter quantities within the remaining eligible quantity."); return; }
    const data = { reason: reason.trim(), notes: notes.trim() || null, requested_resolution: resolution, items, guest_access_token: guestAccessToken };
    const body = JSON.stringify(data);
    if (submission.current?.body !== body) submission.current = { body, key: crypto.randomUUID() };
    setBusy(true);
    try {
      const response = await storefrontRequest<{ data: ReturnState }>(`${path}/return-requests`, { method: "POST", body: JSON.stringify({ ...data, submission_key: submission.current.key }) });
      onResolved(response.data);
      setQuantities({}); setReason(""); setNotes(""); submission.current = null; setOpen(false);
    } catch (failure) { setError(failureMessage(failure)); }
    finally { setBusy(false); }
  }

  async function withdraw(id: string) {
    setBusy(true); setError("");
    try {
      const response = await storefrontRequest<{ data: ReturnState }>(`${path}/return-requests/${encodeURIComponent(id)}/withdraw`, { method: "POST", body: JSON.stringify({ guest_access_token: guestAccessToken }) });
      onResolved(response.data);
    } catch (failure) { setError(failureMessage(failure)); }
    finally { setBusy(false); }
  }

  return <section className={`${styles.cancellation} ${styles.plainSection}`} aria-label="Order returns">
    <div className={styles.sectionHead}>
      <h2>Returns</h2>
      {order.can_request_return && <button type="button" className={`${styles.primaryButton} ${styles.inlineAction}`} onClick={() => setOpen(true)}>Request return</button>}
    </div>
    <p className={styles.hint}>Approval does not issue a refund. We verify returned items before arranging a refund or exchange.</p>
    {requests.map(request => {
      const step = steps.indexOf(request.status);
      return <article key={request.id} className={`${styles.returnRequest} ${request.status === "rejected" ? styles.toneRejected : ""}`}>
        <header className={styles.requestHead}>
          <h3>{statusLabels[request.status] || request.status}</h3>
          {request.requested_at && <time dateTime={request.requested_at}>{new Date(request.requested_at).toLocaleDateString()}</time>}
        </header>
        {step >= 0 && <ol className={styles.stepper} aria-label="Return progress">
          {stepLabels.map((label, index) => <li key={label} className={index < step ? styles.stepDone : index === step ? styles.stepCurrent : undefined} aria-current={index === step ? "step" : undefined}>{label}</li>)}
        </ol>}
        <p className={styles.requestMeta}>{request.reason} · Requested {request.requested_resolution}</p>
        {request.resolution_note && <p className={styles.resolutionNote}>{request.resolution_note}</p>}
        <ul className={styles.requestItems}>{request.items.map(item => <li key={item.sale_item_id}>
          <span>{item.name}</span>
          <span className={styles.qtyChips}>
            <b>Requested {Number(item.requested_quantity)} {item.unit}</b>
            {item.approved_quantity != null && <b>Approved {Number(item.approved_quantity)}</b>}
            {item.received_quantity != null && <b>Received {Number(item.received_quantity)}</b>}
          </span>
        </li>)}</ul>
        {request.status === "completed" && <p className={styles.hint}>Your return is complete. Any refund or exchange is handled separately.</p>}
        {request.can_withdraw && <button type="button" disabled={busy} onClick={() => withdraw(request.id)} className={styles.ghostButton}>Withdraw return request</button>}
      </article>;
    })}
    {order.can_request_return && open && <dialog className={styles.modal} aria-labelledby="return-title" ref={el => { if (el && !el.open) { el.showModal(); el.querySelector<HTMLElement>("input, textarea")?.focus(); } }} onClose={() => setOpen(false)} onCancel={event => { if (busy) event.preventDefault(); }} onClick={event => { if (event.target === event.currentTarget && !busy) event.currentTarget.close(); }}>
      <header className={styles.modalHead}>
        <h2 id="return-title">Request return</h2>
        <button type="button" className={styles.modalClose} aria-label="Close" disabled={busy} onClick={event => event.currentTarget.closest("dialog")?.close()}>×</button>
      </header>
      <form onSubmit={submit} noValidate className={styles.formBody}>
      <fieldset disabled={busy} className={styles.returnItems}><legend>Select items and quantities</legend>
        {eligible.map(item => <div key={item.sale_item_id} className={styles.returnRow}>
          <label htmlFor={`return-quantity-${item.sale_item_id}`}><strong>{item.name}</strong><span>up to {Number(item.requestable_quantity)} {item.unit}</span></label>
          <input id={`return-quantity-${item.sale_item_id}`} type="number" min="0" max={Number(item.requestable_quantity)} step="0.000001" placeholder="0" value={quantities[item.sale_item_id] || ""} onChange={event => setQuantities(current => ({ ...current, [item.sale_item_id]: event.target.value }))} aria-label={`Return quantity for ${item.name}`} />
        </div>)}
      </fieldset>
      <fieldset disabled={busy} className={styles.returnItems}><legend>What would you like?</legend>
        <div className={styles.segmented}>
          {(["refund", "exchange"] as const).map(value => <label key={value} className={resolution === value ? styles.segmentOn : undefined}>
            <input type="radio" name="return-resolution" value={value} checked={resolution === value} onChange={() => setResolution(value)} />{value === "refund" ? "Refund" : "Exchange"}
          </label>)}
        </div>
      </fieldset>
      <label htmlFor="return-reason">Reason for return</label>
      <textarea id="return-reason" value={reason} onChange={event => setReason(event.target.value)} required maxLength={500} disabled={busy} placeholder="What's wrong with the item?" />
      <label htmlFor="return-notes">Additional notes <em>(optional)</em></label>
      <textarea id="return-notes" value={notes} onChange={event => setNotes(event.target.value)} maxLength={1000} disabled={busy} />
      {error && <p className={styles.cancellationError} role="alert">{error}</p>}
      <button type="submit" disabled={busy} className={styles.primaryButton}>{busy ? "Submitting…" : "Request return"}</button>
      </form>
    </dialog>}
    {!(order.can_request_return && open) && error && <p className={styles.cancellationError} role="alert">{error}</p>}
  </section>;
}
