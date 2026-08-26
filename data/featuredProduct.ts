export type FeaturedProduct = {
  title: string;
  sizes: string[];
  images: string[];
};

export const featuredProduct: FeaturedProduct = {
  title: "Premium Jacket",

  sizes: ["S", "M", "L", "XL", "XXL"],

  images: [
    "/image/products/featured/jacket1.jpg",
    "/image/products/featured/jacket2.jpg",
    "/image/products/featured/jacket3.jpg",
    "/image/products/featured/jacket4.webp",
  ],
};
