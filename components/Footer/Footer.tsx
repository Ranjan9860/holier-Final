import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faTiktok } from "@fortawesome/free-brands-svg-icons";
import { footerShopLinks } from "@/data/footer";
import styles from "./Footer.module.css";

export default function Footer() {
  return <footer className={styles.footer}>
    <div className={styles.footerContainer}>
      <div className={styles.footerBrand}>
        <Link href="/" className={styles.footerLogo}><Image src="/image/holier-logo.png" alt="Holier" width={200} height={50} className="w-[120px] h-auto" /></Link>
        <p className={styles.description}>Intimate wear made to help you feel confident, every day. Follow us for new arrivals and updates.</p>
        <div className={styles.socialLinks}>
          <a href="https://www.instagram.com/holierofficial" target="_blank" rel="noopener noreferrer" aria-label="Holier on Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
          <a href="https://www.tiktok.com/@holierofficial" target="_blank" rel="noopener noreferrer" aria-label="Holier on TikTok"><FontAwesomeIcon icon={faTiktok} /></a>
        </div>
      </div>
      <div className={styles.footerColumn}>
        <h3>Shop</h3><div className={styles.headingLine} />
        <ul>{footerShopLinks.map((link) => <li key={link.href}><Link href={link.href}>{link.name}</Link></li>)}</ul>
      </div>
    </div>
    <div className={styles.footerBottom}><div className={styles.copyright}><span>© 2026 Holier.</span></div></div>
  </footer>;
}
