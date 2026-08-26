"use client";

import Image from "next/image";
import { X } from "lucide-react";

import styles from "./ProductImageModal.module.css";

type ProductImageModalProps = {
  image: string;
  title: string;
  onClose: () => void;
};

export default function ProductImageModal({
  image,
  title,
  onClose,
}: ProductImageModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Close Button */}

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close image"
        >
          <X size={28} strokeWidth={1.5} />
        </button>

        {/* Image */}

        <div className={styles.imageContainer}>
          <Image
            src={image}
            alt={title}
            fill
            sizes="90vw"
            className={styles.image}
            priority
          />
        </div>
      </div>
    </div>
  );
}
