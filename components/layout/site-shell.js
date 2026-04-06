"use client";

import { Header } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/site-footer";

export function SiteShell({ children }) {
  return (
    <div className="site-frame">
      <Header />
      <main className="page-shell" data-testid="page-shell">{children}</main>
      <SiteFooter />
    </div>
  );
}
