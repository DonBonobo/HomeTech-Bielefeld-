"use client";

import { useRouter } from "next/navigation";

export function StickyCartCta({ label, href }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="primary-link set-dock-cta"
      data-testid="set-dock-cta"
      aria-label={label}
      onClick={() => router.push(href)}
    >
      {label}
    </button>
  );
}
