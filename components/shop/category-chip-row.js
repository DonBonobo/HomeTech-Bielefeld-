import Link from "next/link";

export function CategoryChipRow({ categories }) {
  return (
    <section className="category-chip-row" aria-label="Shop Kategorien">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={category.slug === "sets" ? "/sets" : `/kategorie/${category.slug}`}
          className="category-chip"
        >
          {category.label}
        </Link>
      ))}
    </section>
  );
}
