import Link from "next/link";

import Catalog from "@/components/Catalog/Catalog";
import { getSaleProducts } from "@/lib/api/products";

export default async function SalePage() {
  const products = await getSaleProducts();
  const saleName = products[0]?.sale?.name;

  return (
    <Catalog
      title={saleName || "Sale"}
      description={products.length > 0 ? "Flash sale prices, while the sale is running." : undefined}
      products={products}
      basePath="/sale"
      controls={false}
      empty={
        <>
          <h2>No sale is running right now</h2>
          <p>Flash sales appear here as soon as one starts.</p>
          <Link href="/shop">Shop the catalog</Link>
        </>
      }
    />
  );
}
