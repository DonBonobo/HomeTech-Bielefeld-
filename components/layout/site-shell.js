"use client";

import { Header } from "@/components/layout/header";

export function SiteShell({ children }) {
  return (
    <>
      <Header />
      <main className="page-shell">{children}</main>
    </>
  );
}
