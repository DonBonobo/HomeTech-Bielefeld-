import Image from "next/image";
import styles from "@/components/home/homepage.module.css";
import { reassuranceItems } from "@/lib/catalog/catalog-store";

export function ValueStrip() {
  return (
    <section className={styles.section} aria-labelledby="value-strip-title">
      <div className={styles.sectionHead}>
        <div>
          <h2 id="value-strip-title" className={styles.sectionTitle}>
            Fakten für den Abschluss
          </h2>
          <p className={styles.sectionBody}>Lieferung, Mengenpreise und Bestellweg ohne Marketington.</p>
        </div>
      </div>
      <div className={styles.valueGrid}>
        {reassuranceItems.map((item) => (
          <article key={item.title} className={styles.valueCard}>
            <div className={styles.valueImage}>
              <Image src={item.imageUrl} alt="" width={160} height={160} />
            </div>
            <div>
              <h3>{item.title}</h3>
              <p className={styles.sectionBody}>{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
