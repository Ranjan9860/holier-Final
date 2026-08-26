import Hero from "@/components/Hero/Hero";
import FeaturedSections from "@/components/FeaturedSections/FeaturedSections";
import ProductShowcase from "@/components/ProductShowcase/ProductShowcase";
import Practice from "@/components/Practice/Practice";

export default function Home() {
  return (
    <main>
      <Hero />

      <FeaturedSections />

      <ProductShowcase />

      <ProductShowcase reverse />
    </main>
  );
}
