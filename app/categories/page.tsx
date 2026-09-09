import { CategoryGrid, Section } from "@/components/Home/HomeSections";
import { getCatalogFilters } from "@/lib/api/products";

export const metadata = {
  title: "Categories | Holier",
};

export default async function CategoriesPage() {
  const { categories } = await getCatalogFilters();

  return (
    <main>
      <Section title="Categories" eyebrow={`${categories.length} categories`}>
        {categories.length > 0 ? (
          <CategoryGrid categories={categories} />
        ) : (
          <p>No categories are published yet.</p>
        )}
      </Section>
    </main>
  );
}
