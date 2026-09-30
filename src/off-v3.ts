import openapiFetchCreateClient from "openapi-fetch";
import { unwrapCjsDefault } from "./interop-workaround.js";
import type { components, operations, paths } from "./schemas/server/v3.js";
import type { KnowledgePanel } from "./knowledgepanels.js";
import type { Nutriments } from "./off-v2.js";
import type {
  LangIngredient,
  LangProduct,
  LangPackagingText,
  LangGenericName,
  RawImage,
  SelectedImage,
  FetchFn,
} from "./types.js";

// https://github.com/rolldown/tsdown/issues/1054
const createClient = unwrapCjsDefault(openapiFetchCreateClient);

export type ResponseStatus = components["schemas"]["response_status"];
export type Product = components["schemas"]["product_v3"];
export type PackagingComponent = components["schemas"]["packaging_component"];
export type PackagingTaxonomyTag = components["schemas"]["shape"];

export type ProductImageUploadParams = NonNullable<
  operations["post-api-v3-product-code-images"]["requestBody"]
>["content"]["application/json"];

export type ProductQuery = NonNullable<
  operations["get-api-v3-product-code"]["parameters"]["query"]
>;

export type TaxonomySuggestionsQuery = NonNullable<
  operations["get-api-v3-taxonomy_suggestions-taxonomy"]["parameters"]["query"]
>;

export type TagKnowledgePanelsQuery = NonNullable<
  operations["get-api-v3-tag-tagtype-tag_or_tagid"]["parameters"]["query"]
>;

export type TagKnowledgePanelsResponse =
  operations["get-api-v3-tag-tagtype-tag_or_tagid"]["responses"]["200"]["content"]["application/json"];

export type ImageSelectionData = NonNullable<
  NonNullable<
    operations["patch-api-v3-product-code"]["requestBody"]
  >["content"]["application/json"]["product"]
>["images"];

export type ProductDataSection = {
  created_t: number;
  creator: string;
  last_modified_t: number;
  last_editor: string;
  editors_tags: string[];
  last_checked_t: number;
  checkers_tags: string[];
  states_hierarchy: string[];
};

export type ProductDataType = ProductDataSection & {
  knowledge_panels: Record<string, KnowledgePanel>;
  product_name: string;
  _id: string;
  code: string;
  _keywords: string[];
  additives_n: number;
  ingredients: {
    id: string;
    percent: number;
    percent_estimate: number;
    percent_max: number;
    percent_min: number;
    text: string;
    vegan: string;
    vegetarian: string;
  }[];
  additives_tags: string[];

  ingredients_text: string;

  image_front_url: string;
  image_front_small_url: string;

  image_ingredients_url: string;
  image_ingredients_small_url: string;
  image_ingredients_thumb_url: string;

  images: Record<string, SelectedImage | RawImage>;

  image_nutrition_url: string;
  image_nutrition_small_url: string;
  image_nutrition_thumb_url: string;

  quantity: string;
  serving_size: string;
  nutriscore_grade: string;
  ecoscore_grade: string;
  nova_group: number;

  packaging?: string;
  packaging_text?: string;
  packagings?: PackagingComponent[];
  packagings_complete?: number;
  manufacturing_places: string;

  brands: string;
  brands_tags: string[];

  categories: string;
  categories_tags: string[];
  categories_hierarchy: object[];

  stores: string;
  stores_tags: string[];

  labels: string;
  labels_tags: string[];
  product_type: string;

  allergens?: string;
  allergens_tags?: string[];
  traces?: string;
  traces_tags?: string[];

  origins: string;
  origins_tags: string[];

  countries: string;
  countries_tags: string[];

  emb_codes: string;
  emb_codes_tags: string[];

  nutriments: Nutriments;

  no_nutrition_data?: boolean;

  source: {
    fields: string[];
    id: string;
    images: object[];
    import_t: number;
    manufacturer: number | string;
    name: string;
    source_licence: string;
    source_licence_url: string;
    url?: string;
  };

  link: string;

  languages_codes: {
    [lang: string]: number;
  };
  lang: string;
  data_quality_errors_tags?: string[];
  data_quality_warnings_tags?: string[];
  data_quality_info_tags?: string[];
} & Partial<
    Record<
      LangProduct | LangIngredient | LangPackagingText | LangGenericName,
      string
    >
  >;

export type ProductStateBase = {
  result: {
    id: string;
    name: string;
    lc_name: string;
  };
};

export type ProductStateError = {
  field?: { id?: string; value?: string };
  impact?: { lc_name?: string; name?: string; id?: string };
  message?: { lc_name?: string; name?: string; id?: string };
};

export type ProductStateFailure = ProductStateBase & {
  status: "failure";
  errors: ProductStateError[];
};

export type ProductStateFound<T = ProductDataType> = ProductStateBase & {
  product: T;
} & (
    | { status: "success" }
    | { status: "success_with_warnings"; warnings: object[] }
    | { status: "success_with_errors"; errors: ProductStateError[] }
  );

export type ProductState<T = ProductDataType> = ProductStateBase &
  (ProductStateFound<T> | ProductStateFailure);

export class ProductOpenerApiV3 {
  private readonly fetch: FetchFn;
  private readonly baseUrl: string;
  readonly client: ReturnType<typeof createClient<paths>>;

  constructor(fetch: FetchFn, options: { host: string }) {
    this.fetch = fetch;
    this.baseUrl = options.host;
    this.client = createClient<paths>({
      fetch: this.fetch,
      baseUrl: this.baseUrl,
    });
  }

  test() {
    return true;
  }

  async uploadProductImage(code: string, params: ProductImageUploadParams) {
    return this.client.POST("/api/v3/product/{code}/images", {
      params: { path: { code } },
      body: { ...params },
    });
  }

  /**
   * Deletes an uploaded image for a product
   * @param barcode - The barcode of the product corresponding to the image
   * @param imgid - The id of the image to be deleted
   * @returns A promise that resolves to the deletion response
   */
  async deleteProductImage(code: string, imgid: number) {
    return await this.client.DELETE(
      "/api/v3/product/{code}/images/uploaded/{imgid}",
      { params: { path: { code, imgid } } },
    );
  }

  /**
   * Select and crop images using API v3.3
   * @param barcode Product barcode
   * @param images Object containing image selections and crop parameters
   */
  async selectAndCropImagesV3(barcode: string, images: ImageSelectionData) {
    return await this.client.PATCH("/api/v3/product/{code}", {
      params: { path: { code: barcode } },
      body: { fields: "updated", product: { images } },
    });
  }

  /**
   * Fetch taxonomy suggestions for autocomplete
   * @param query - Suggestion query parameters
   */
  async getTaxonomySuggestions(query: TaxonomySuggestionsQuery) {
    return this.client.GET("/api/v3/taxonomy_suggestions", {
      params: { query },
    });
  }

  /**
   * Fetch knowledge panels for a tag
   * @param tagtype - Type of the tag
   * @param tagOrTagId - Tag name (e.g. "yogurts") or tag id (e.g. "en:yogurts")
   * @param query - Optional query parameters for language and country localization
   * @returns A promise that resolves to the tag knowledge panels response
   */
  async getTagKnowledgePanels(
    tagtype: string,
    tagOrTagId: string,
    query?: TagKnowledgePanelsQuery,
  ) {
    return this.client.GET("/api/v3/tag/{tagtype}/{tag_or_tagid}", {
      params: {
        path: { tagtype, tag_or_tagid: tagOrTagId },
        query,
      },
    });
  }

  /**
   * Returns product details by barcode with optional fields
   * @param code - The barcode of the product
   * @param query - An optional query object to filter the returned fields
   * @template Keys - An array of keys from ProductV3 to return
   * @example
   * ```typescript
   * const result = await api.getProductV3("1234567890123", { fields: ["product_name", "brands"] });
   * console.log(result.product.product_name, result.product.brands);
   * ```
   * @returns A promise that resolves to a product object with the specified fields or undefined if not found
   */
  async getProductV3<
    Keys extends Array<Extract<keyof Product, string> | "all">,
  >(code: string, query?: Omit<ProductQuery, "fields"> & { fields?: Keys }) {
    const { error, data } = await this.client.GET("/api/v3/product/{code}", {
      params: {
        path: { code },
        query: { ...query, fields: query?.fields?.join(",") },
      },
    });

    if (error != null) {
      return { error, data: undefined };
    }

    type ProductStateType<T extends Array<string>> = "all" extends T[number]
      ? Product & Pick<Product, Extract<T[number], keyof Product>>
      : Pick<Product, Extract<T[number], keyof Product>>;

    return {
      data: data as ProductState<ProductStateType<Keys>>,
      error: undefined,
    };
  }

  async getAttributeGroups() {
    return this.client.GET("/api/v3.4/attribute_groups");
  }
}
