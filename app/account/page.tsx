import { Suspense } from "react";
import Account from "@/components/Account/AccountDashboard";
import PageLoader from "@/components/PageLoader";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const requestedTab = (await searchParams).tab;
  const tab = ["profile", "addresses", "orders", "security"].includes(requestedTab || "")
    ? requestedTab as "profile" | "addresses" | "orders" | "security"
    : "profile";
  return (
    <Suspense fallback={<PageLoader />}>
      <Account initialTab={tab} />
    </Suspense>
  );
}
