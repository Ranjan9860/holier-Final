"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import styles from "./Home.module.css";

const slides = ["/image/hero-campaign.jpg", "/image/hero-campaign-2.jpg"];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasMultiple = slides.length > 1;

  useEffect(() => {
    if (!hasMultiple || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setCurrent((slide) => (slide + 1) % slides.length), 10000);
    return () => window.clearTimeout(timer);
  }, [current, hasMultiple, paused]);

  return (
    <section
      className={styles.hero}
      aria-label="Featured collection"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {slides.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          className={`${styles.heroImage} ${hasMultiple ? styles.heroImageAnimated : ""} ${index === current ? styles.heroImageActive : ""}`}
        />
      ))}

      <div className={styles.heroContent}>
        <h1>Considered pieces for the colder months.</h1>

        <div className={styles.heroActions}>
          <Link href="/new-arrivals" className={styles.buttonSolid}>Shop New Arrivals</Link>
          <Link href="/shop" className={styles.buttonOutline}>Shop All</Link>
        </div>
      </div>

      {hasMultiple && (
        <div className={styles.heroControls}>
          <button type="button" aria-label="Previous slide" onClick={() => setCurrent((slide) => (slide - 1 + slides.length) % slides.length)}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" aria-label="Next slide" onClick={() => setCurrent((slide) => (slide + 1) % slides.length)}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
