import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main>
      <h1>Product not found</h1>
      <Link href="/shop">Return to shop</Link>
    </main>
  );
}
