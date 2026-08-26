import { Product } from "@/types/product";

export type ProductSort = "default" | "low" | "high" | "new";

type FilterProductsOptions = {
  products: Product[];
  selectedSizes: string[];
  selectedColor: string;
  sortBy: ProductSort;
};

export function filterProducts({
  products,
  selectedSizes,
  selectedColor,
  sortBy,
}: FilterProductsOptions): Product[] {
  let result = [...products];

  /* ==============================
     SIZE FILTER
  ============================== */

  if (selectedSizes.length > 0) {
    result = result.filter((product) =>
      selectedSizes.some((size) => product.sizes.includes(size)),
    );
  }

  /* ==============================
     COLOR FILTER
  ============================== */

  if (selectedColor !== "all") {
    result = result.filter((product) =>
      product.colorNames?.includes(selectedColor),
    );
  }

  /* ==============================
     SORT
  ============================== */

  switch (sortBy) {
    case "low":
      result.sort((a, b) => a.price - b.price);
      break;

    case "high":
      result.sort((a, b) => b.price - a.price);
      break;

    case "new":
      result.sort((a, b) => b.id - a.id);
      break;

    default:
      break;
  }

  return result;
}
