import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Catalog from "@/components/Catalog/Catalog";
import { getCatalogFilters, getProducts, parseProductQuery } from "@/lib/api/products";
import { categorySlug } from "@/lib/catalog";

type Props = PageProps<"/shop/category/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCatalogFilters()).categories.find((item) => categorySlug(item) === slug);
  return category
    ? { title: `${category.category_name} | Holier`, description: category.description || `Shop ${category.category_name} at Holier.`, alternates: { canonical: `/shop/category/${encodeURIComponent(slug)}` } }
    : {};
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, rawQuery, filters] = await Promise.all([params, searchParams, getCatalogFilters()]);
  const category = filters.categories.find((item) => categorySlug(item) === slug);
  if (!category) notFound();

  const query = { ...parseProductQuery(rawQuery), category_id: category.id };
  const { products, meta } = await getProducts({ ...query, per_page: "24" });

  return <Catalog title={category.category_name} description={category.description} products={products} meta={meta} query={query} basePath={`/shop/category/${encodeURIComponent(slug)}`} {...filters} />;
}
