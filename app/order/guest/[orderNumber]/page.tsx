import GuestOrderConfirmation from "@/components/Checkout/GuestOrderConfirmation";

export default async function GuestOrderPage({ params, searchParams }: { params: Promise<{ orderNumber: string }>; searchParams: Promise<{ guest_access_token?: string | string[] }> }) {
  const { orderNumber } = await params;
  const { guest_access_token: value } = await searchParams;
  const guestAccessToken = Array.isArray(value) ? value[0] : value;
  return <GuestOrderConfirmation orderNumber={orderNumber} guestAccessToken={guestAccessToken || ""} />;
}
