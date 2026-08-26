"use client";

import { useState } from "react";

export function useWishlist() {
  const [wishlist, setWishlist] = useState<number[]>([]);

  const toggleWishlist = (id: number) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const isInWishlist = (id: number) => {
    return wishlist.includes(id);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return {
    wishlist,
    toggleWishlist,
    isInWishlist,
    clearWishlist,
  };
}
