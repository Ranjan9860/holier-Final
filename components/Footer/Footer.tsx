import Image from "next/image";
import Link from "next/link";
import { footerShopLinks } from "@/data/footer";
import styles from "./Footer.module.css";

export default function Footer() {
  return <footer className={styles.footer}>
    <div className={styles.footerContainer}>
      <div className={styles.footerBrand}>
        <Link href="/" className={styles.footerLogo}><Image src="/image/holier-logo.png" alt="Holier" width={200} height={50} className="w-[120px] h-auto" /></Link>
        <p className={styles.description}>Browse the latest products available from Holier.</p>
      </div>
      <div className={styles.footerColumn}>
        <h3>Shop</h3><div className={styles.headingLine} />
        <ul>{footerShopLinks.map((link) => <li key={link.href}><Link href={link.href}>{link.name}</Link></li>)}</ul>
      </div>
    </div>
    <div className={styles.footerBottom}><div className={styles.copyright}><span>© 2026 Holier.</span></div></div>
  </footer>;
}
