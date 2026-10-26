"use client";

import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { storefrontFieldError, storefrontRequest, StorefrontError } from "@/lib/api/client";
import { maskPhone } from "@/lib/format";
import styles from "./AccountDashboard.module.css";

export type AddressPart = { province_id?: string; district_id?: string | null; area_code?: string | null; address?: string; landmark?: string };
export type Address = { id: string; name: string; phone: string; label?: string; billing_default?: boolean; shipping_default?: boolean; full_address?: string; addresses?: AddressPart[] };
export type ShippingLocation = { id: string; province: { id: string; name: string }; district: { id: string; name: string } | null; area_code: string | null; name: string; charge: number };

/** Shared add/edit address modal — used by the Account addresses tab and Checkout. */
export default function AddressModal({ editing, locations, defaultName, defaultPhone, onClose, onSaved }: {
  editing: Address | "new";
  locations: ShippingLocation[];
  defaultName?: string;
  defaultPhone?: string;
  onClose: () => void;
  onSaved: () => Promise<unknown> | void;
}) {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const fieldError = (name: string) => storefrontFieldError(errors, name);
  const current = editing === "new" ? undefined : editing;
  const part = current?.addresses?.[0];
  const locationId = locations.find((location) => location.province.id === part?.province_id && (location.district?.id || null) === (part?.district_id || null) && location.area_code === (part?.area_code || null))?.id;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPending(true); setErrors({});
    const form = new FormData(event.currentTarget);
    const location = locations.find((item) => item.id === form.get("location_id"));
    if (!location) { setPending(false); setErrors({ location_id: ["Choose a delivery location."] }); return; }
    const payload = {
      name: form.get("name"), phone: form.get("phone"), label: form.get("label"),
      billing_default: form.get("billing_default") === "on", shipping_default: form.get("shipping_default") === "on",
      address_role: "both",
      addresses: [{ province_id: location.province.id, district_id: location.district?.id || null, area_code: location.area_code, address: form.get("address"), landmark: form.get("landmark") }],
    };
    try {
      const path = editing === "new" ? "customer/address" : `customer/address/${editing.id}`;
      await storefrontRequest(path, { method: "POST", body: JSON.stringify(payload) });
      await onSaved();
      toast.success("Address saved.");
      onClose();
    } catch (reason) {
      if (reason instanceof StorefrontError) setErrors(reason.errors);
      toast.error(reason instanceof Error ? reason.message : "Address update failed.");
    } finally { setPending(false); }
  };

  return <div className={styles.modalOverlay} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={styles.modal} role="dialog" aria-modal="true" aria-label={current ? "Edit address" : "Add address"}>
      <div className={styles.modalHeading}><h3>{current ? "Edit address" : "Add address"}</h3><button type="button" className={styles.modalClose} aria-label="Close" onClick={onClose}>×</button></div>
      <form key={current?.id || "new"} onSubmit={submit} noValidate className={styles.addressForm}>
        <div className={styles.formGrid}>
          <label className={styles.formGroup}>Name<input name="name" defaultValue={current?.name || defaultName || ""} className={fieldError("name") ? styles.invalid : undefined} />{fieldError("name") && <span className={styles.errorText}>{fieldError("name")}</span>}</label>
          <label className={styles.formGroup}>Phone<input name="phone" defaultValue={current?.phone || defaultPhone || ""} inputMode="numeric" maxLength={10} onChange={(event) => { event.target.value = maskPhone(event.target.value); }} className={fieldError("phone") ? styles.invalid : undefined} />{fieldError("phone") && <span className={styles.errorText}>{fieldError("phone")}</span>}</label>
          <label className={styles.formGroup}>Label<input name="label" defaultValue={current?.label || "home"} className={fieldError("label") ? styles.invalid : undefined} />{fieldError("label") && <span className={styles.errorText}>{fieldError("label")}</span>}</label>
          <label className={`${styles.formGroup} ${styles.fullWidth}`}>Delivery location<select name="location_id" defaultValue={locationId || ""} className={fieldError("location_id") ? styles.invalid : undefined}><option value="">Choose a location</option>{locations.map((location) => <option key={location.id} value={location.id}>{location.province.name} — {location.name}</option>)}</select>{fieldError("location_id") && <span className={styles.errorText}>{fieldError("location_id")}</span>}</label>
          <label className={`${styles.formGroup} ${styles.fullWidth}`}>Street address<textarea name="address" defaultValue={part?.address || ""} className={fieldError("address") ? styles.invalid : undefined} />{fieldError("address") && <span className={styles.errorText}>{fieldError("address")}</span>}</label>
          <label className={`${styles.formGroup} ${styles.fullWidth}`}>Landmark<input name="landmark" defaultValue={part?.landmark || ""} className={fieldError("landmark") ? styles.invalid : undefined} />{fieldError("landmark") && <span className={styles.errorText}>{fieldError("landmark")}</span>}</label>
          <label className={`${styles.checkboxRow} ${styles.fullWidth}`}><input type="checkbox" name="billing_default" defaultChecked={current?.billing_default} /> Default billing</label>
          <label className={`${styles.checkboxRow} ${styles.fullWidth}`}><input type="checkbox" name="shipping_default" defaultChecked={current ? current.shipping_default : true} /> Default shipping</label>
        </div>
        <div className={styles.actions}>
          <button className={styles.primaryButton} disabled={pending}>Save address</button>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  </div>;
}
