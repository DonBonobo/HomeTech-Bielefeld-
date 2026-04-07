import Link from "next/link";
import { SiteHeader } from "@/components/home/site-header";
import styles from "@/components/checkout/checkout-status.module.css";

type Tone = "success" | "warning" | "danger";

export function CheckoutStatus({
  tone,
  badge,
  title,
  body,
  reference,
  children,
  actions
}: {
  tone: Tone;
  badge: string;
  title: string;
  body: string;
  reference?: string;
  children?: React.ReactNode;
  actions: Array<{ href: string; label: string; primary?: boolean }>;
}) {
  return (
    <main className={styles.page}>
      <SiteHeader />

      <section className={styles.card}>
        <div className={`${styles.badge} ${styles[tone]}`}>{badge}</div>
        <div>
          <h1 style={{ margin: "0 0 8px" }}>{title}</h1>
          <p className={styles.muted} style={{ margin: 0 }}>
            {body}
          </p>
        </div>

        {reference ? (
          <div>
            <strong>Referenz</strong>
            <div>{reference}</div>
          </div>
        ) : null}

        {children}

        <div className={styles.actions}>
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={action.primary ? styles.primary : styles.secondary}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
