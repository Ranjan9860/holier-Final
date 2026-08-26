import { Suspense } from "react";
import Account from "@/components/Account/AccountDashboard";

export default function AccountPage() {
  return (
    <Suspense fallback={<div>Loading account...</div>}>
      <Account />
    </Suspense>
  );
}
