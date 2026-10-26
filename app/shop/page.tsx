import Catalog from "@/components/Catalog/Catalog";
import { getCatalogFilters, getProducts, parseProductQuery } from "@/lib/api/products";

export const metadata = { alternates: { canonical: "/shop" } };

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const query = parseProductQuery(await searchParams);
  const [{ products, meta }, filters] = await Promise.all([
    getProducts({ ...query, per_page: "24" }),
    getCatalogFilters(),
  ]);

  return (
    <Catalog
      title="Shop"
      description="The complete Holier catalog."
      products={products}
      meta={meta}
      query={query}
      basePath="/shop"
      {...filters}
    />
  );
}
