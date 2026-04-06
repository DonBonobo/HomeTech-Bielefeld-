"use client";

import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";

export function SiteShell({ children }) {
  return (
    <>
      <Header />
      <main className="page-shell">{children}</main>
      <SiteFooter />
    </>
  );
}
