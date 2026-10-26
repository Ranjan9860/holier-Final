import Link from "next/link";
import styles from "../../status.module.css";

export default function ProductNotFound() {
  return (
    <main className={styles.notFound}>
      <h1>Product not found</h1>
      <p>It may have been removed or the link is out of date.</p>
      <Link href="/shop">Return to shop</Link>
    </main>
  );
}
