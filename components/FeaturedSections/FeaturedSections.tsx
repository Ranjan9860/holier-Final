"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "./FeaturedSections.module.css";

const topSections = [
  {
    id: 1,
    category: "MEN",
    title: "New Season",
    description:
      "Discover premium smart watches with modern technology and elegant design.Discover premium smart watches with modern technology and elegant design.Discover premium smart watches with modern technology and elegant design.Discover premium smart watches with modern technology and elegant design.Discover premium smart watches with modern technology and elegant design.",
    image: "/image/featured/image.jpg",
    alt: "Holier men's collection",
    link: "/collections",
  },
  {
    id: 2,
    category: "WOMEN",
    title: "New Collection",
    description:
      "Discover premium smart watches with modern technology and elegant design.Discover premium smart watches with modern technology and elegant design.Discover premium smart watches with modern technology and elegant design.Discover premium smart watches with modern technology and elegant design.Discover premium smart watches with modern technology and elegant design.",
    image: "/image/featured/image2.jpg",
    alt: "Holier women's collection",
    link: "/shop",
  },
];

const bottomSections = [
  {
    id: 1,
    category: "T-SHIRTS",
    title: "Everyday Essentials",
    description:
      "Discover premium smart watches with modern technology and elegant design.Discover premium smart watches with modern technology a.",
    image: "/image/featured/image.jpg",
    alt: "Holier T-shirts",
    link: "/shop",
  },
  {
    id: 2,
    category: "SHIRTS",
    title: "Classic Shirts",
    description:
      "Discover premium smart watches with modern technology and elegant design.Discover premium smart watches with modern technology a.",
    image: "/image/featured/image2.jpg",
    alt: "Holier shirts",
    link: "/new-arrivals",
  },
  {
    id: 3,
    category: "ACCESSORIES",
    title: "Complete Your Look",
    description:
      "Discover premium smart watches with modern technology and elegant design.Discover premium smart watches with modern technology a.",
    image: "/image/featured/image3.jpg",
    alt: "Holier accessories",
    link: "/sale",
  },
];

export default function FeaturedSections() {
  return (
    <section className={styles.featuredSection}>
      {/* =====================================================
          TOP TWO SECTIONS
      ===================================================== */}

      <div className={styles.topSections}>
        {topSections.map((section) => (
          <article key={section.id} className={styles.topCard}>
            {/* Content */}

            <div className={styles.topContent}>
              <span className={styles.category}>{section.category}</span>

              <h2>{section.title}</h2>

              <p>{section.description}</p>

              <Link href={section.link} className={styles.shopButton}>
                Shop Now
              </Link>
            </div>

            {/* Image */}

            <div className={styles.topImage}>
              <Image
                src={section.image}
                alt={section.alt}
                width={800}
                height={600}
                sizes="50vw"
              />
            </div>
          </article>
        ))}
      </div>

      <hr className={styles.sectionDivider} />

      {/* =====================================================
          BOTTOM THREE SECTIONS
      ===================================================== */}

      <div className={styles.bottomSections}>
        {bottomSections.map((section) => (
          <article key={section.id} className={styles.bottomCard}>
            {/* Image */}

            {/* Content */}

            <div className={styles.bottomContent}>
              <span className={styles.category}>{section.category}</span>

              <h3>{section.title}</h3>

              <p>{section.description}</p>

              <Link href={section.link} className={styles.shopButton}>
                Shop Now
              </Link>
            </div>

            {/* Image */}

            <div className={styles.bottomImage}>
              <Image
                src={section.image}
                alt={section.alt}
                width={800}
                height={600}
                sizes="33vw"
              />
            </div>
          </article>
        ))}
      </div>
      <hr className={styles.sectionDivider} />
    </section>
  );
}
