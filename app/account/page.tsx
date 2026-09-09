import { Suspense } from "react";
import Account from "@/components/Account/AccountDashboard";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const requestedTab = (await searchParams).tab;
  const tab = ["profile", "addresses", "orders", "security"].includes(requestedTab || "")
    ? requestedTab as "profile" | "addresses" | "orders" | "security"
    : "profile";
  return (
    <Suspense fallback={<div>Loading account...</div>}>
      <Account initialTab={tab} />
    </Suspense>
  );
}
