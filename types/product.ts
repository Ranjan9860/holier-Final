export type Review = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
};

export type SimilarProduct = {
  id: number;
  title: string;
  category: string;
  image: string;
  price: number;
  oldPrice?: number;
};

export type Product = {
  id: number;
  title: string;
  image: string;

  // These are required because every product has them
  images: string[];

  price: number;
  oldPrice?: number;

  colors: string[];
  colorNames?: string[];
  sizes: string[];

  category?: string;
  description?: string;

  // Required because every product has keyFeatures
  keyFeatures: string[];

  reviews?: Review[];
  similarProducts?: SimilarProduct[];
};
