import type { Metadata } from "next";
import Link from "next/link";
import styles from "./status.module.css";

export const metadata: Metadata = {
  title: "Page not found | Holier",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className={styles.notFound}>
      <div className={styles.notFoundContent}>
        <h1>Page not found</h1>
        <p>The page you requested doesn&apos;t exist.</p>
        <div className={styles.actions}>
          <Link href="/shop" className={styles.primaryAction}>Shop products</Link>
          <Link href="/" className={styles.secondaryAction}>Home</Link>
        </div>
      </div>
    </main>
  );
}
