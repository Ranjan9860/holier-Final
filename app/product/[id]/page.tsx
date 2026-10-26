import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetail from "@/components/ProductDetail/ProductDetail";
import { getProduct } from "@/lib/api/products";
import { productCanonicalUrl, productJsonLd, productSocialImage } from "@/lib/product-json-ld";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ variant?: string | string[] }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getProduct(id);
    const title = product.seo?.title || product.title;
    const description = product.seo?.description || product.description;
    const image = productSocialImage(product);
    return {
      title,
      description,
      alternates: { canonical: productCanonicalUrl(product) },
      robots: {
        index: product.seo?.allowSearchEngine ?? true,
        follow: product.seo?.allowFollowLinks ?? true,
      },
      openGraph: {
        title,
        description,
        type: "website",
        images: image ? [{ url: image, alt: product.seo?.altText || product.title }] : undefined,
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { id } = await params;
  const { variant } = await searchParams;

  let product;
  try {
    product = await getProduct(id);
  } catch (error) {
    if ((error as { status?: number }).status === 404) notFound();
    throw error;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product)).replace(/</g, "\\u003c") }}
      />
      <ProductDetail product={product} initialVariantId={Array.isArray(variant) ? variant[0] : variant} />
    </>
  );
}
