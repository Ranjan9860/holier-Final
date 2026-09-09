import Catalog from "@/components/Catalog/Catalog";
import { getCatalogFilters, getProducts, parseProductQuery } from "@/lib/api/products";

export default async function NewArrivalsPage({ searchParams }: PageProps<"/new-arrivals">) {
  const query = { sort: "-created_at", ...parseProductQuery(await searchParams) };
  const [{ products, meta }, filters] = await Promise.all([
    getProducts({ ...query, per_page: "24" }),
    getCatalogFilters(),
  ]);

  return (
    <Catalog
      title="New Arrivals"
      description="The latest products added to the catalog, newest first."
      products={products}
      meta={meta}
      query={query}
      basePath="/new-arrivals"
      {...filters}
    />
  );
}
