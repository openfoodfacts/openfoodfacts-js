export type LangIngredient = `ingredients_text_${string}`;
export type LangProduct = `product_name_${string}`;
export type LangPackagingText = `packaging_text_${string}`;
export type LangGenericName = `generic_name_${string}`;

export type ImageSize = { h: number; w: number };

/** Available sizes for product image URLs. */
export type ProductImageSize = "100" | "200" | "400" | "full";

export type SelectedImage = {
  angle: number;
  coordinates_image_size: string;
  geometry: string;
  imgid: string;
  normalize: string | boolean | null;
  rev: string;
  sizes: {
    100: ImageSize;
    200: ImageSize;
    400: ImageSize;
    full: ImageSize;
  };
  white_magic: string | boolean | null;
  x1: string;
  x2: string;
  y1: string;
  y2: string;
};

export type RawImage = {
  url: string;
  sizes: {
    full: ImageSize;
    100: ImageSize;
    400: ImageSize;
  };
  uploaded_t: string;
  uploader: string;
};

export type FetchFn = typeof globalThis.fetch;

export type FetchResponse<D, E = unknown> = Promise<
  | { data: D; error?: never; response: Response }
  | { data?: never; error: E; response: Response }
>;
