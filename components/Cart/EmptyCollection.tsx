import Link from "next/link";
import styles from "./CartPage.module.css";

export default function EmptyCollection({
  title,
  description,
  error,
}: {
  title: string;
  description: string;
  error?: string | null;
}) {
  return (
    <main className={styles.emptyCart}>
      <div className={styles.emptyContent}>
        <h1>{title}</h1>
        {error && <p role="alert">{error}</p>}
        <p>{description}</p>
        <Link href="/shop" className={styles.shopButton}>Continue Shopping</Link>
      </div>
    </main>
  );
}
