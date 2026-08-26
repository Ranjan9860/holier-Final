import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faYoutube,
  faXTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  footerShopLinks,
  footerHelpLinks,
  footerInformationLinks,
} from "@/data/footer";

import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}

      <div className={styles.footerContainer}>
        {/* =================================================
            BRAND / CONTACT
        ================================================= */}

        <div className={styles.footerBrand}>
          <Link href="/" className={styles.footerLogo}>
            <Image
              src="/image/holier-logo.png"
              alt="Holier"
              width={200}
              height={50}
              className="w-[120px] h-auto"
            />
          </Link>

          <p className={styles.description}>
            Discover premium products at unbeatable prices. We are committed to
            providing quality products, excellent customer service, and a
            seamless shopping experience for our valued customers.
          </p>

          {/* Contact Information */}

          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <MapPin size={20} strokeWidth={2} />

              <span>Kathmandu, Nepal</span>
            </div>

            <div className={styles.contactItem}>
              <Phone size={20} strokeWidth={2} />

              <span>+977 9800000000</span>
            </div>

            <div className={styles.contactItem}>
              <Mail size={20} strokeWidth={2} />

              <span>info@yourstore.com</span>
            </div>
          </div>
        </div>

        {/* =================================================
            PRODUCT CATEGORIES
        ================================================= */}

        <div className={styles.footerColumn}>
          <h3>Product Categories</h3>

          <div className={styles.headingLine} />

          <ul>
            {footerShopLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* =================================================
            USEFUL LINKS
        ================================================= */}

        <div className={styles.footerColumn}>
          <h3>Useful Links</h3>

          <div className={styles.headingLine} />

          <ul>
            {footerInformationLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* =================================================
            CUSTOMER SERVICE
        ================================================= */}

        <div className={styles.footerColumn}>
          <h3>Customer Service</h3>

          <div className={styles.headingLine} />

          <ul>
            {footerHelpLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* =====================================================
          BOTTOM FOOTER
      ===================================================== */}

      <div className={styles.footerBottom}>
        <div className={styles.copyright}>
          © 2026 Your Store. All Rights Reserved.
          <span>Powered by Anoop Innovations.</span>
        </div>

        {/* Social Icons */}

        <div className={styles.socialLinks}>
          <a href="#" aria-label="Facebook">
            <FontAwesomeIcon icon={faFacebookF} />
          </a>

          <a href="#" aria-label="Instagram">
            <FontAwesomeIcon icon={faInstagram} />
          </a>

          <a href="#" aria-label="X">
            <FontAwesomeIcon icon={faXTwitter} />
          </a>

          <a href="#" aria-label="YouTube">
            <FontAwesomeIcon icon={faYoutube} />
          </a>
        </div>
      </div>
    </footer>
  );
}
