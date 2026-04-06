import { Suspense } from "react";
import { AccountPageClient } from "@/components/account/account-page";

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="page-stack" />}>
      <AccountPageClient />
    </Suspense>
  );
}
