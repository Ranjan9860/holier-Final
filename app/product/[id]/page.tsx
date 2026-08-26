import { notFound } from "next/navigation";

import { products } from "@/data/products";
import ProductDetail from "@/components/ProductDetail/ProductDetail";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
