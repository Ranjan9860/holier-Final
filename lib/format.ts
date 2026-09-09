/** Strip to digits and cap at 10 — a Nepali mobile number, e.g. 98XXXXXXXX. */
export function maskPhone(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function formatPrice(amount: number): string {
  return `Rs. ${amount.toLocaleString()}`;
}

/** Price for one product: a single amount, or the range a variant product spans. */
export function formatPriceRange(price: number, priceMax?: number): string {
  if (price <= 0) return "Price unavailable";
  return priceMax && priceMax > price ? `${formatPrice(price)} – ${formatPrice(priceMax)}` : formatPrice(price);
}
