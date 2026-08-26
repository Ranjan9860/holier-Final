"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import styles from "./Hero.module.css";

const slides = [
  {
    id: 1,
    image: "/image/hero/hero1.jpg",
    alt: "Holier collection",
  },
  {
    id: 2,
    image: "/image/hero/hero2.jpg",
    alt: "Holier new arrivals",
  },
  {
    id: 3,
    image: "/image/hero/hero3.png.webp",
    alt: "Holier fashion collection",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className={styles.hero}>
      {/* Carousel */}

      <div className={styles.carousel}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${
              index === currentSlide ? styles.activeSlide : ""
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className={styles.slideImage}
            />
          </div>
        ))}

        {/* Previous Button */}

        <button
          type="button"
          className={`${styles.navigationButton} ${styles.previousButton}`}
          onClick={previousSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft size={28} strokeWidth={1.5} />
        </button>

        {/* Next Button */}

        <button
          type="button"
          className={`${styles.navigationButton} ${styles.nextButton}`}
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <ChevronRight size={28} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
