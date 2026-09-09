import { notFound } from "next/navigation";

import ProductDetail from "@/components/ProductDetail/ProductDetail";
import { getProduct } from "@/lib/api/products";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  let product;
  try {
    product = await getProduct(id);
  } catch (error) {
    if ((error as { status?: number }).status === 404) notFound();
    throw error;
  }

  return <ProductDetail product={product} />;
}
