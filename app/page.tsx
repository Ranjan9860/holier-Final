import {
  CategoryGrid,
  ProductSection,
  SaleSection,
  Section,
} from "@/components/Home/HomeSections";
import HeroCarousel from "@/components/Home/HeroCarousel";
import { getCatalogFilters, getProducts, getSaleProducts } from "@/lib/api/products";

export default async function Home() {
  const [{ products }, { categories }, saleProducts] = await Promise.all([
    getProducts({ sort: "-created_at", per_page: "8" }),
    getCatalogFilters(),
    getSaleProducts().catch(() => []),
  ]);

  return (
    <main>
      <HeroCarousel />

      {categories.length > 0 && (
        <Section title="Shop by category" link="/categories" linkLabel="All categories">
          <CategoryGrid categories={categories} limit={6} />
        </Section>
      )}

      <ProductSection
        title="New arrivals"
        products={products}
        link="/new-arrivals"
        linkLabel="All new arrivals"
      />

      <SaleSection products={saleProducts} />
    </main>
  );
}
