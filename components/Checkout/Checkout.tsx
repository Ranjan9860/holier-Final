"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import PageLoader from "@/components/PageLoader";
import AddressModal, { type Address, type ShippingLocation } from "@/components/Account/AddressModal";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { storefrontRequest, StorefrontError } from "@/lib/api/client";
import { maskPhone } from "@/lib/format";
import styles from "./Checkout.module.css";

type PaymentMethod = { id: string; payment_mode_name: string; payment_type: string };
type OrderResult = { data: { id: string; order_number: string; guest_access_token?: string } };
type AddressTarget = "shipping" | "billing";
type BuyNowItem = { productId: string; variantId?: string; quantity: number; title: string; image?: string; unitPrice: number; lineTotal: number };

function readBuyNow(): BuyNowItem | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("holier-buy-now");
  if (!raw) return null;
  sessionStorage.removeItem("holier-buy-now");
  try { return JSON.parse(raw); } catch { return null; }
}

export default function Checkout() {
  const { customer } = useAuth();
  const { cart, summary, loading: cartLoading, refreshCart } = useCart();
  const router = useRouter();
  const [buyNow] = useState<BuyNowItem | null>(readBuyNow);
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [locations, setLocations] = useState<ShippingLocation[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [paymentId, setPaymentId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [billingId, setBillingId] = useState("");
  const [shippingId, setShippingId] = useState("");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [picker, setPicker] = useState<AddressTarget | null>(null);
  const [addingAddress, setAddingAddress] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const loadAddresses = useCallback(async () => {
    const payload = await storefrontRequest<{ data: Address[] }>("customer/address");
    setAddresses(payload.data);
    setShippingId((current) => current || payload.data.find((item) => item.shipping_default)?.id || payload.data[0]?.id || "");
    setBillingId((current) => current || payload.data.find((item) => item.billing_default)?.id || payload.data[0]?.id || "");
  }, []);
  const loadOptions = useCallback(async () => {
    const [paymentPayload, locationPayload] = await Promise.all([
      storefrontRequest<{ data: PaymentMethod[] }>("customer/payment-methods"),
      storefrontRequest<{ data: ShippingLocation[] }>("shipping/addresses"),
    ]);
    setPayments(paymentPayload.data); setLocations(locationPayload.data);
    setPaymentId((current) => current || paymentPayload.data[0]?.id || "");
    setLocationId((current) => current || locationPayload.data[0]?.id || "");
    if (customer) await loadAddresses();
  }, [customer, loadAddresses]);
  useEffect(() => {
    // Checkout choices come from tenant configuration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOptions()
      .catch((reason) => setMessage(reason instanceof Error ? reason.message : "Unable to load checkout."))
      .finally(() => setOptionsLoading(false));
  }, [loadOptions]);

  const selectAddress = (address: Address, target: AddressTarget) => {
    if (target === "shipping") {
      setShippingId(address.id);
      if (sameAsShipping) setBillingId(address.id);
    } else {
      setBillingId(address.id);
    }
    setPicker(null);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending) return;
    setPending(true); setMessage(""); setErrors({});
    try {
      if (!buyNow) {
        const latest = await refreshCart();
        if (!latest.cart.length) throw new Error("Your cart is empty.");
        const unavailable = latest.cart.find((item) => !item.inStock);
        if (unavailable) throw new Error(`${unavailable.title} is no longer available in the requested quantity.`);
      }
      const form = new FormData(event.currentTarget);
      let path = "order";
      let tokenKind: "cart" | undefined;
      let body: Record<string, unknown> = { payment_method_id: paymentId };
      if (customer) {
        body = { ...body, billing_address_id: sameAsShipping ? shippingId : billingId, shipping_address_id: shippingId };
      } else {
        const location = locations.find((item) => item.id === locationId);
        if (!location) throw new Error("Choose a shipping location.");
        const address = { addresses: [{ province_id: location.province.id, district_id: location.district?.id || null, area_code: location.area_code, address: form.get("address"), landmark: form.get("landmark") }] };
        body = { ...body, name: form.get("name"), email: form.get("email"), phone: form.get("phone"), billing_address: address, shipping_address: address };
        path = "guest/order";
        tokenKind = "cart";
      }
      // Buy Now bypasses the cart entirely — order this single item instead of whatever's in the cart.
      if (buyNow) body = { ...body, items: [{ product_id: buyNow.productId, product_variant_id: buyNow.variantId, quantity: buyNow.quantity }] };
      const result = await storefrontRequest<OrderResult>(path, { method: "POST", body: JSON.stringify(body) }, tokenKind);
      if (customer) {
        await refreshCart();
        router.push(`/order/${result.data.id}`);
      }
      else {
        sessionStorage.setItem(`holier-guest-order-${result.data.order_number}`, result.data.guest_access_token || "");
        localStorage.removeItem("holier-cart-token");
        await refreshCart();
        router.push(`/order/guest/${result.data.order_number}`);
      }
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Order submission failed.");
      if (reason instanceof StorefrontError) setErrors(reason.errors);
      setPending(false);
    }
  };

  if (cartLoading && cart.length === 0 && !buyNow) return <PageLoader />;
  if (!cart.length && !buyNow) return <section className={styles.checkoutSection}><div className={styles.emptyCart}><h1>Your cart is empty</h1><p>Add products before proceeding to checkout.</p><Link href="/shop" className={styles.shopButton}>Continue shopping</Link></div></section>;
  if (optionsLoading) return <PageLoader />;

  const savedLocation = addresses.find((address) => address.id === shippingId)?.addresses?.[0];
  const location = customer
    ? locations.find((item) => item.province.id === savedLocation?.province_id && (item.district?.id || null) === (savedLocation?.district_id || null) && item.area_code === (savedLocation?.area_code || null))
    : locations.find((item) => item.id === locationId);
  const shippingCharge = Number(location?.charge || 0);
  const shippingAddress = addresses.find((item) => item.id === shippingId);
  const billingAddress = addresses.find((item) => item.id === billingId);
  const pickerTarget = picker;

  // Buy Now shows a single synthetic line instead of the shared cart — no separate tax/discount breakdown available for it.
  const orderItems = buyNow ? [{ id: "buy-now", title: buyNow.title, quantity: buyNow.quantity, lineTotal: buyNow.lineTotal }] : cart;
  const orderSubtotal = buyNow ? buyNow.unitPrice * buyNow.quantity : summary.subtotal;
  const orderDiscount = buyNow ? 0 : summary.discountAmount;
  const orderTax = buyNow ? 0 : summary.taxAmount;
  const orderTotal = buyNow ? buyNow.lineTotal : summary.total;

  return <section className={styles.checkoutSection}><div className={styles.checkoutContainer}><div className={styles.pageHeading}><h1>Checkout</h1></div>
    <form onSubmit={submit}><div className={styles.checkoutGrid}><div className={styles.billingSection}>
      {customer ? <div className={styles.sectionBlock}><div className={styles.sectionHeading}><h2>Delivery address</h2></div>
        {addresses.length === 0 ? <div className={styles.addressEmpty}>
          <p>No saved addresses yet.</p>
          <button type="button" className={styles.secondaryButton} onClick={() => setAddingAddress(true)}>Add address</button>
        </div> : <>
          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={sameAsShipping} onChange={(event) => { const checked = event.target.checked; setSameAsShipping(checked); if (checked) setBillingId(shippingId); }} />
            Billing address same as shipping
          </label>
          <div className={styles.addressCardsGrid}>
            <AddressSummary title="Shipping address" address={shippingAddress} onChange={() => setPicker("shipping")} />
            {!sameAsShipping && <AddressSummary title="Billing address" address={billingAddress} onChange={() => setPicker("billing")} />}
          </div>
        </>}
      </div> : <div className={styles.sectionBlock}><div className={styles.sectionHeading}><h2>Contact and delivery</h2></div><div className={styles.formGrid}>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}><label htmlFor="name">Name</label><input id="name" name="name" required /></div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}><label htmlFor="email">Email</label><input id="email" name="email" type="email" required /></div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}><label htmlFor="phone">Phone</label><input id="phone" name="phone" inputMode="numeric" maxLength={10} pattern="[0-9]{10}" onChange={(event) => { event.target.value = maskPhone(event.target.value); }} required /></div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}><label htmlFor="location">Delivery location</label><select id="location" value={locationId} onChange={(event) => setLocationId(event.target.value)} required>{locations.map((item) => <option key={item.id} value={item.id}>{item.province.name} — {item.name}</option>)}</select></div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}><label htmlFor="address">Street address</label><textarea id="address" name="address" rows={4} required /></div>
        <div className={`${styles.formGroup} ${styles.fullWidth}`}><label htmlFor="landmark">Landmark</label><input id="landmark" name="landmark" /></div>
      </div></div>}
    </div><div className={styles.orderSection}><div className={styles.orderBox}><div className={styles.orderHeading}><h2>Your Order</h2></div>
      <div className={styles.orderProducts}>{orderItems.map((item) => <div key={item.id} className={styles.orderProduct}><div className={styles.productName}><span>{item.title}</span><span className={styles.quantity}>× {item.quantity}</span></div><span className={styles.productSubtotal}>Rs. {item.lineTotal.toLocaleString()}</span></div>)}</div>
      <div className={styles.totalArea}><div className={styles.totalRow}><span>Subtotal</span><strong>Rs. {orderSubtotal.toLocaleString()}</strong></div>{orderDiscount > 0 && <div className={styles.totalRow}><span>Discount</span><strong>- Rs. {orderDiscount.toLocaleString()}</strong></div>}<div className={styles.totalRow}><span>Tax</span><strong>Rs. {orderTax.toLocaleString()}</strong></div><div className={styles.totalRow}><span>Shipment</span><strong>Rs. {shippingCharge.toLocaleString()}</strong></div><div className={styles.grandTotal}><span>Total</span><strong>Rs. {(orderTotal + shippingCharge).toLocaleString()}</strong></div></div>
    </div><div className={styles.paymentBox}><div className={styles.orderHeading}><h2>Payment Method</h2></div>
      <div className={styles.paymentGrid}>{payments.map((payment) => <button key={payment.id} type="button" className={`${styles.paymentOption} ${paymentId === payment.id ? styles.activePayment : ""}`} onClick={() => setPaymentId(payment.id)}>{payment.payment_mode_name}</button>)}</div>
      {message && <p role="alert">{message}</p>}{Object.values(errors).flat().map((error) => <p role="alert" key={error}>{error}</p>)}
      <button type="submit" className={styles.placeOrderButton} disabled={pending || !paymentId || (customer ? !shippingId || (!sameAsShipping && !billingId) : !locationId)}>{pending ? "Placing order…" : "Place Order"}</button>
    </div></div></div></form>
    {pickerTarget && <div className={styles.modalOverlay} onClick={(event) => { if (event.target === event.currentTarget) setPicker(null); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`Choose ${pickerTarget} address`}>
        <div className={styles.modalHeading}><h3>Choose {pickerTarget} address</h3><button type="button" className={styles.modalClose} aria-label="Close" onClick={() => setPicker(null)}>×</button></div>
        <div className={styles.addressList}>{addresses.map((address) => <button type="button" key={address.id} className={styles.addressOption} onClick={() => selectAddress(address, pickerTarget)}>
          <span className={styles.addressName}>{address.label || address.name}</span>
          <span>{address.name} · {address.phone}</span>
          <span>{address.full_address}</span>
        </button>)}</div>
        <button type="button" className={styles.secondaryButton} onClick={() => { setPicker(null); setAddingAddress(true); }}>Add new address</button>
      </div>
    </div>}
    {addingAddress && <AddressModal editing="new" locations={locations} defaultName={customer?.name} defaultPhone={customer?.phone || ""} onClose={() => setAddingAddress(false)} onSaved={loadAddresses} />}
  </div></section>;
}

function AddressSummary({ title, address, onChange }: { title: string; address?: Address; onChange: () => void }) {
  return <div className={styles.addressSummary}>
    <div className={styles.addressSummaryHeading}><h3>{title}</h3><button type="button" className={styles.secondaryButton} onClick={onChange}>Change</button></div>
    {address ? <div className={styles.addressDetails}>
      <span>{address.name} · {address.phone}</span>
      <span>{address.full_address}</span>
    </div> : <p>Select an address.</p>}
  </div>;
}
