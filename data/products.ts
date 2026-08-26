import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: 1,

    title: "Classic Jacket",

    image: "/image/products/image.jpg",

    images: [
      "/image/products/image.jpg",
      "/image/products/image2.jpg",
      "/image/products/image3.jpg",
    ],

    price: 129,

    oldPrice: 199,

    colors: ["#000000", "#5daee8", "#f4aaaa"],

    colorNames: ["Black", "Blue", "Pink"],

    sizes: ["S", "M", "L", "XL"],

    category: "Jackets",

    description:
      "A premium classic jacket designed for everyday comfort and style.",

    keyFeatures: ["Premium quality", "Comfortable fit", "Modern design"],

    reviews: [
      {
        id: 1,
        name: "John Doe",
        rating: 5,
        comment: "Really comfortable and the quality is excellent.",
        date: "12 Aug 2026",
      },
      {
        id: 2,
        name: "Sarah Smith",
        rating: 4,
        comment: "Very good product and fits perfectly.",
        date: "15 Aug 2026",
      },
    ],
  },

  {
    id: 2,

    title: "Premium Shirt",

    image: "/image/products/image2.jpg",

    images: [
      "/image/products/image2.jpg",
      "/image/products/image.jpg",
      "/image/products/image3.jpg",
    ],

    price: 99,

    oldPrice: 149,

    colors: ["#ffffff", "#333333"],

    colorNames: ["White", "Black"],

    sizes: ["S", "M", "L", "XL"],

    category: "Shirts",

    description: "A premium shirt with a clean and modern design.",

    keyFeatures: ["Soft fabric", "Regular fit", "Premium finish"],

    reviews: [
      {
        id: 3,
        name: "Michael",
        rating: 5,
        comment: "Excellent shirt and very comfortable.",
        date: "10 Aug 2026",
      },
    ],
  },

  {
    id: 3,

    title: "Modern Jacket",

    image: "/image/products/image3.jpg",

    images: [
      "/image/products/image3.jpg",
      "/image/products/image.jpg",
      "/image/products/image2.jpg",
    ],

    price: 159,

    oldPrice: 219,

    colors: ["#333333", "#777777"],

    colorNames: ["Black", "Grey"],

    sizes: ["M", "L", "XL"],

    category: "Jackets",

    description:
      "Modern jacket featuring a stylish silhouette and comfortable fit.",

    keyFeatures: ["Premium fabric", "Modern cut", "Durable finish"],
  },

  {
    id: 4,

    title: "Classic Collection",

    image: "/image/products/image.jpg",

    images: ["/image/products/image.jpg", "/image/products/image2.jpg"],

    price: 129,

    oldPrice: 189,

    colors: ["#f4aaaa", "#333333"],

    colorNames: ["Pink", "Black"],

    sizes: ["S", "M", "L"],

    category: "Collections",

    description: "A classic collection piece designed for versatile styling.",

    keyFeatures: ["Classic design", "Comfortable fabric", "Versatile style"],
  },

  {
    id: 5,

    title: "Casual Wear",

    image: "/image/products/image2.jpg",

    images: ["/image/products/image2.jpg", "/image/products/image3.jpg"],

    price: 89,

    oldPrice: 129,

    colors: ["#5daee8", "#333333"],

    colorNames: ["Blue", "Black"],

    sizes: ["S", "M", "L", "XL"],

    category: "Casual Wear",

    description: "Comfortable casual wear suitable for everyday use.",

    keyFeatures: ["Lightweight fabric", "Relaxed fit", "Everyday comfort"],
  },

  {
    id: 6,

    title: "Premium Style",

    image: "/image/products/image3.jpg",

    images: ["/image/products/image3.jpg", "/image/products/image.jpg"],

    price: 179,

    oldPrice: 249,

    colors: ["#333333"],

    colorNames: ["Black"],

    sizes: ["M", "L", "XL"],

    category: "Premium",

    description: "A premium style piece with a refined and modern appearance.",

    keyFeatures: ["Premium quality", "Refined design", "Comfortable fit"],
  },
];
