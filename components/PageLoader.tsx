import Image from "next/image";
import styles from "@/app/status.module.css";

export default function PageLoader() {
  return (
    <main className={styles.loader} aria-busy="true" aria-live="polite">
      <div className={styles.loaderPanel}>
        <Image src="/image/holier-logo.png" alt="Holier" width={144} height={60} priority className={styles.loaderLogo} />
        <p className={styles.loadingLabel}>Loading</p>
        <div className={styles.progress} aria-hidden="true"><span /></div>
        <span className={styles.srOnly}>Loading page content</span>
      </div>
    </main>
  );
}
