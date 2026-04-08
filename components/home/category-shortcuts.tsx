import Image from "next/image";
import Link from "next/link";
import styles from "@/components/home/homepage.module.css";
import type { CategoryShortcutModel } from "@/lib/catalog/types";

export function CategoryShortcuts({ categories }: { categories: CategoryShortcutModel[] }) {
  return (
    <section className={styles.section} aria-labelledby="category-shortcuts-title">
      <div className={styles.sectionHead}>
        <div>
          <h2 id="category-shortcuts-title" className={styles.sectionTitle}>
            Sortiment
          </h2>
          <p className={styles.sectionBody}>Direkte Wege in die wichtigsten Lagerbereiche.</p>
        </div>
      </div>
      <div className={styles.categoryGrid}>
        {categories.map((category) => (
          <Link key={category.slug} href={category.href} className={styles.categoryCard}>
            <div className={styles.categoryImage}>
              <Image src={category.imageUrl} alt={category.imageAlt} width={72} height={72} />
            </div>
            <div className={styles.categoryMeta}>
              <h3>{category.label}</h3>
              <span>{category.productCount} Produkte</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
