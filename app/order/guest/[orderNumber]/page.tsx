import GuestOrderConfirmation from "@/components/Checkout/GuestOrderConfirmation";

export default async function GuestOrderPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <GuestOrderConfirmation orderNumber={orderNumber} />;
}
