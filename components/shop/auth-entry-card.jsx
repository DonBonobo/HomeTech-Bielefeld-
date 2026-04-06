"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export function AuthEntryCard({ compact = false }) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (user) {
    return null;
  }

  return (
    <div className={compact ? "auth-entry auth-entry--compact" : "auth-entry"}>
      <div>
        <strong>Mit Konto fortfahren</strong>
        <p>Bestellungen, Adressen und dein Warenkorb bleiben mit Anmeldung an einem Ort.</p>
      </div>
      <Link href={`/konto?next=${encodeURIComponent(pathname)}`} className="secondary-link">
        Anmelden
      </Link>
    </div>
  );
}
