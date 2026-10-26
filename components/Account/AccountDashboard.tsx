"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { storefrontRequest, StorefrontError } from "@/lib/api/client";
import { maskPhone } from "@/lib/format";
import AddressModal, { type Address, type ShippingLocation } from "./AddressModal";
import PageLoader from "@/components/PageLoader";
import styles from "./AccountDashboard.module.css";

function maskPhoneInput(event: ChangeEvent<HTMLInputElement>) {
  event.target.value = maskPhone(event.target.value);
}

type Order = { id: string; order_number: string; delivery_status?: string; order_date: string; total_amount: number };
type Tab = "profile" | "addresses" | "orders" | "security";

export default function AccountDashboard({ initialTab = "profile" }: { initialTab?: Tab }) {
  const { customer, loading, notice, refreshCustomer } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [locations, setLocations] = useState<ShippingLocation[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | "new" | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);
  const fieldError = (name: string) => errors[name]?.[0];

  const loadAddresses = useCallback(async () => {
    const payload = await storefrontRequest<{ data: Address[] }>("customer/address");
    setAddresses(payload.data);
  }, []);
  const loadOrders = useCallback(async (nextPage = 1) => {
    const payload = await storefrontRequest<{ data: Order[]; meta?: { current_page?: number; last_page?: number } }>(`order?page=${nextPage}`);
    setOrders(payload.data); setPage(payload.meta?.current_page || nextPage); setLastPage(payload.meta?.last_page || nextPage);
  }, []);
  const loadLocations = useCallback(async () => {
    const payload = await storefrontRequest<{ data: ShippingLocation[] }>("shipping/addresses");
    setLocations(payload.data);
  }, []);
  useEffect(() => {
    if (!customer) return;
    // Account data is loaded only for an authenticated customer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    Promise.all([loadAddresses(), loadOrders(), loadLocations()]).catch((reason) => toast.error(reason instanceof Error ? reason.message : "Unable to load account."));
  }, [customer, loadAddresses, loadLocations, loadOrders]);

  useEffect(() => {
    if (!loading && !customer) router.replace("/auth?returnTo=%2Faccount");
  }, [customer, loading, router]);

  if (loading) return <PageLoader />;
  if (!customer) return null;

  const fail = (reason: unknown, fallback: string) => {
    if (reason instanceof StorefrontError) setErrors(reason.errors);
    toast.error(reason instanceof Error ? reason.message : fallback);
  };
  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setErrors({});
    const form = new FormData(event.currentTarget);
    const profile = new FormData();
    (["name", "email", "phone", "gender"] as const).forEach((field) => {
      const value = String(form.get(field) ?? "");
      if (value !== (customer[field] ?? "")) profile.append(field, value);
    });
    const image = form.get("image");
    if (image instanceof File && image.size) profile.append("image", image);
    if (![...profile].length) return toast.info("No profile changes to save.");
    setPending(true);
    try {
      await storefrontRequest("customer/profile", { method: "POST", body: profile });
      await refreshCustomer(); toast.success("Profile updated.");
    } catch (reason) { fail(reason, "Profile update failed."); }
    finally { setPending(false); }
  };
  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPending(true); setErrors({});
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await storefrontRequest<{ message: string }>("customer/password/change", { method: "POST", body: JSON.stringify(form) });
      toast.success(result.message); event.currentTarget.reset();
    } catch (reason) { fail(reason, "Password change failed."); }
    finally { setPending(false); }
  };
  const deleteAccount = async () => {
    if (!confirm("Permanently delete your account? This cannot be undone.")) return;
    setPending(true);
    try {
      await storefrontRequest("customer/profile", { method: "DELETE" });
      router.push("/auth");
    } catch (reason) { fail(reason, "Account deletion failed."); setPending(false); }
  };
  return <main className={styles.dashboard}>
    <div className="container">
      <header className={styles.header}>
        <h1>My Account</h1>
        <div className={styles.headerMeta}><span>{customer.name} · {customer.email}</span></div>
      </header>
      <nav className={styles.nav} aria-label="Account sections">
        {(["profile", "addresses", "orders", "security"] as Tab[]).map((item) => <button type="button" key={item} className={`${styles.navButton} ${tab === item ? styles.activeTab : ""}`} onClick={() => { setTab(item); setErrors({}); }} aria-pressed={tab === item}>{item}</button>)}
      </nav>
      {notice && <p role="alert" className={styles.notice}>{notice}</p>}

      {tab === "profile" && <section className={styles.section}><h2>Profile</h2><form onSubmit={submitProfile} noValidate className={styles.formGrid}>
        <div className={`${styles.profileImage} ${styles.fullWidth}`}>
          {customer.image
            ? <Image src={customer.image} alt={`${customer.name}'s profile`} width={96} height={96} unoptimized />
            : <span aria-hidden="true">{customer.name.charAt(0).toUpperCase()}</span>}
          <label className={styles.formGroup}>Profile picture<input name="image" type="file" accept="image/jpeg,image/png,image/gif,image/webp" className={fieldError("image") ? styles.invalid : undefined} />{fieldError("image") && <span className={styles.errorText}>{fieldError("image")}</span>}</label>
        </div>
        <label className={styles.formGroup}>Name<input name="name" defaultValue={customer.name} className={fieldError("name") ? styles.invalid : undefined} />{fieldError("name") && <span className={styles.errorText}>{fieldError("name")}</span>}</label>
        <label className={styles.formGroup}>Email<input name="email" type="email" defaultValue={customer.email} className={fieldError("email") ? styles.invalid : undefined} />{fieldError("email") && <span className={styles.errorText}>{fieldError("email")}</span>}</label>
        <label className={styles.formGroup}>Phone<input name="phone" defaultValue={customer.phone || ""} inputMode="numeric" maxLength={10} onChange={maskPhoneInput} className={fieldError("phone") ? styles.invalid : undefined} />{fieldError("phone") && <span className={styles.errorText}>{fieldError("phone")}</span>}</label>
        <label className={styles.formGroup}>Gender<select name="gender" defaultValue={customer.gender || ""} className={fieldError("gender") ? styles.invalid : undefined}><option value="">Not specified</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>{fieldError("gender") && <span className={styles.errorText}>{fieldError("gender")}</span>}</label>
        <div className={`${styles.actions} ${styles.fullWidth}`}><button className={styles.primaryButton} disabled={pending}>Save profile</button></div>
      </form></section>}

      {tab === "addresses" && <section className={styles.section}>
        <div className={styles.sectionHeading}><h2>Addresses</h2><button type="button" className={styles.secondaryButton} onClick={() => setEditingAddress("new")}>Add address</button></div>
        {addresses.length === 0 ? <p className={styles.emptyState}>No saved addresses.</p> : <div className={styles.addressGrid}>{addresses.map((address) => <article key={address.id} className={styles.addressCard}>
          <h3>{address.label || "Address"}</h3><p>{address.name} · {address.phone}</p><p>{address.addresses?.[0]?.address}{address.addresses?.[0]?.landmark ? `, ${address.addresses[0].landmark}` : ""}</p>
          <div className={styles.addressBadges}>{address.billing_default && <span className={styles.badge}>Default billing</span>}{address.shipping_default && <span className={styles.badge}>Default shipping</span>}</div>
          <div className={styles.addressActions}>
            <button type="button" onClick={() => setEditingAddress(address)}>Edit</button>
            <button type="button" onClick={async () => { await storefrontRequest(`customer/address/${address.id}`, { method: "DELETE" }); await loadAddresses(); }}>Delete</button>
          </div>
        </article>)}</div>}
        {editingAddress && <AddressModal editing={editingAddress} locations={locations} defaultName={customer.name} defaultPhone={customer.phone || ""} onClose={() => setEditingAddress(null)} onSaved={loadAddresses} />}
      </section>}

      {tab === "orders" && <section className={styles.section}><div className={styles.sectionHeading}><div><span className="eyebrow">Purchase history</span><h2>Orders</h2></div><span className={styles.orderCount}>{orders.length} shown</span></div>
        {orders.length === 0 ? <p className={styles.emptyState}>You haven’t placed an order yet.</p> : <div className={styles.orderList}>{orders.map((order) => <Link href={`/order/${order.id}`} key={order.id} className={styles.orderRow}>
          <div className={styles.orderIdentity}><span>Order</span><strong>{order.order_number}</strong></div>
          <div className={styles.orderFact}><span>Placed</span><time dateTime={order.order_date}>{order.order_date}</time></div>
          <div className={styles.orderFact}><span>Delivery</span><strong>{order.delivery_status || "pending"}</strong></div>
          <div className={`${styles.orderFact} ${styles.orderTotal}`}><span>Total</span><strong>Rs. {Number(order.total_amount).toLocaleString()}</strong></div>
          <span className={styles.orderArrow} aria-hidden="true">→</span>
        </Link>)}</div>}
        {lastPage > 1 && <div className={styles.pagination}>
          <button type="button" className={styles.secondaryButton} disabled={page <= 1} onClick={() => loadOrders(page - 1)}>Previous</button>
          <span>Page {page} of {lastPage}</span>
          <button type="button" className={styles.secondaryButton} disabled={page >= lastPage} onClick={() => loadOrders(page + 1)}>Next</button>
        </div>}
      </section>}

      {tab === "security" && <section className={styles.section}><h2>Security</h2>
        <form onSubmit={changePassword} noValidate className={styles.formGrid}>
          <label className={styles.formGroup}>Current password<input type="password" name="current_password" className={fieldError("current_password") ? styles.invalid : undefined} />{fieldError("current_password") && <span className={styles.errorText}>{fieldError("current_password")}</span>}</label>
          <label className={styles.formGroup}>New password<input type="password" name="new_password" className={fieldError("new_password") ? styles.invalid : undefined} />{fieldError("new_password") && <span className={styles.errorText}>{fieldError("new_password")}</span>}</label>
          <label className={styles.formGroup}>Confirm new password<input type="password" name="new_password_confirmation" className={fieldError("new_password_confirmation") ? styles.invalid : undefined} />{fieldError("new_password_confirmation") && <span className={styles.errorText}>{fieldError("new_password_confirmation")}</span>}</label>
          <div className={`${styles.actions} ${styles.fullWidth}`}><button className={styles.primaryButton} disabled={pending}>Change password</button></div>
        </form>
        <div className={styles.dangerZone}>
          <div><h2>Delete account</h2><p>Permanently remove your account and all its data.</p></div>
          <button type="button" className={`${styles.primaryButton} ${styles.dangerButton}`} disabled={pending} onClick={deleteAccount}>Delete account</button>
        </div>
      </section>}
    </div>
  </main>;
}
