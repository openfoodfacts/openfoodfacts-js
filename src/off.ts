import { jwtDecode, type JwtPayload } from "jwt-decode";

import {
  BackendType,
  BACKEND_DOMAINS,
  BACKEND_NAMES,
  ROBOTOFF_API_URLS,
  getProductImageBaseUrl,
} from "./consts.js";

import { Robotoff } from "./robotoff.js";
import { NutriPatrol } from "./nutripatrol.js";

import { TAXONOMY_URL } from "./taxonomy/api.js";
import type {
  Additive,
  Allergen,
  Brand,
  Category,
  Country,
  Ingredient,
  Label,
  Language,
  Nutrient,
  Packaging,
  State,
  Store,
  TaxoNode,
  Taxonomy,
} from "./taxonomy/types.js";

import type { FetchFn, RawImage, SelectedImage } from "./types.js";

import type {
  FacetResponse,
  FacetSortOption,
  FacetValueResponse,
} from "./facets.js";
export type { FacetResponse, FacetSortOption, FacetValueResponse };

import {
  ProductOpenerApiV2,
  getProductNameInLang,
  getProductIngredientsInLang,
} from "./off-v2.js";
import { ProductOpenerApiV3 } from "./off-v3.js";
export { getProductNameInLang, getProductIngredientsInLang };

// Type-only imports and re-exports for off-v2.js
import type {
  SearchQuery as SearchQueryV2,
  Product as ProductV2,
  SearchResult as SearchResultV2,
  ProductAttribute as ProductAttributeV2,
  AttributeGroups as AttributeGroupV2,
  ProductAttribute as AttributeV2,
} from "./off-v2.js";
export type {
  SearchQueryV2,
  ProductV2,
  SearchResultV2,
  ProductAttributeV2,
  AttributeGroupV2,
  AttributeV2,
};

// Type-only imports and re-exports for off-v3.js
import type {
  ProductDataType,
  ProductDataSection,
  ProductImageUploadParams as ProductImageUploadParamsV3,
  ProductQuery as ProductQueryV3,
  Product as ProductV3,
  ProductState as ProductStateV3,
  ResponseStatus as ResponseStatusV3,
  PackagingComponent,
  PackagingTaxonomyTag,
  TaxonomySuggestionsQuery,
  TagKnowledgePanelsQuery,
  TagKnowledgePanelsResponse,
} from "./off-v3.js";
export type {
  ProductDataType,
  ProductDataSection,
  ProductImageUploadParamsV3,
  ProductQueryV3,
  ProductV3,
  ProductStateV3,
  ResponseStatusV3,
  PackagingComponent,
  PackagingTaxonomyTag,
  TaxonomySuggestionsQuery,
  TagKnowledgePanelsQuery,
  TagKnowledgePanelsResponse,
};

import { VERSION } from "./version.js";

// By default, use v2
export type { ProductV2 as Product, SearchResultV2 as SearchResult };

export type OpenFoodFactsOptions = {
  /** Backend flavor to target (OFF, OBF, OPFF or OPF). Defaults to OFF. */
  type?: BackendType;
  country?: string;
  language?: string;
  host?: string;

  accessToken?: string;
  onAccessTokenExpired?: () => string | Promise<string>;
};

/**
 * Wrapper of the Open Food Facts API.
 *
 * Also targets Open Beauty Facts, Open Pet Food Facts and Open Products Facts
 * via the `type` option.
 */
export class OpenFoodFacts {
  private readonly fetch: FetchFn;
  private readonly baseUrl: string;
  private readonly backendType?: BackendType;
  /** Flavor used for flavor-dependent URLs: `type` if given, else inferred from `host`, else OFF. */
  private readonly effectiveBackend: BackendType;
  private readonly customUserAgent: string;
  private accessToken?: string;
  private readonly defaultOptions: {
    lang?: string;
    country?: string;
    username?: string;
    password?: string;
  };

  /** The V2 ProductOpener API class. Do not use directly unless you know what you're doing.  */
  readonly apiv2: ProductOpenerApiV2;
  /** The V3 ProductOpener API class. Do not use directly unless you know what you're doing. */
  readonly apiv3: ProductOpenerApiV3;

  /** The Robotoff API class. */
  readonly robotoff: Robotoff;

  /** The NutriPatrol API class. */
  readonly nutriPatrol: NutriPatrol;

  /**
   * Create OFF object
   * @param fetch - Fetch implementation to use
   * @param options - Options for the OFF Object
   */
  constructor(
    fetch: FetchFn,
    options: OpenFoodFactsOptions = { country: "world", language: "en" },
  ) {
    this.validateOptions(options);
    this.backendType = options.type;
    this.effectiveBackend = this.resolveBackend(options);
    this.baseUrl = this.createBaseUrl(options);
    this.customUserAgent = this.createUserAgent();
    this.accessToken = options.accessToken;
    this.fetch = this.createFetchWrapper(fetch, options);
    this.defaultOptions = {
      lang: options.language,
      country: options.country,
      username: undefined,
      password: undefined,
    };

    this.apiv2 = new ProductOpenerApiV2(this.fetch, { host: this.baseUrl });
    this.apiv3 = new ProductOpenerApiV3(this.fetch, { host: this.baseUrl });
    this.robotoff = new Robotoff(fetch, {
      baseUrl: ROBOTOFF_API_URLS[this.effectiveBackend],
    });
    this.nutriPatrol = new NutriPatrol(fetch);
  }

  /** Returns `type` if provided, else infers the flavor from `host`, else OFF. */
  private resolveBackend(options: OpenFoodFactsOptions): BackendType {
    if (options.type != null) {
      return options.type;
    }

    if (options.host != null) {
      let hostname: string;
      try {
        hostname = new URL(this.createBaseUrl(options)).hostname;
      } catch {
        hostname = options.host;
      }

      for (const type of Object.values(BackendType)) {
        const domain = BACKEND_DOMAINS[type];
        if (hostname === domain || hostname.endsWith(`.${domain}`)) {
          return type;
        }
      }
    }

    return BackendType.OFF;
  }

  /**
   * Validates constructor options for mutual exclusivity
   */
  private validateOptions(options: OpenFoodFactsOptions): void {
    if (
      (options.host && options.country) ||
      (options.type && options.country)
    ) {
      throw new Error(
        "You must provide either `host`, `type`, or `country`, not multiple.",
      );
    }
  }

  /**
   * Creates the base URL based on options
   */
  private createBaseUrl(options: OpenFoodFactsOptions): string {
    if (options.host != null) {
      return options.host.includes("://")
        ? options.host
        : `https://${options.host}`;
    }

    if (options.type != null) {
      const domain = BACKEND_DOMAINS[options.type];
      return `https://world.${domain}`;
    }

    return `https://${options.country || "world"}.openfoodfacts.org`;
  }

  /**
   * Creates the User-Agent string based on backend type
   */
  private createUserAgent(): string {
    if (this.backendType != null) {
      const backendName = BACKEND_NAMES[this.backendType];
      return `${backendName} - NodeJS ${VERSION}`;
    }

    return `OpenFoodFacts - NodeJS ${VERSION}`;
  }

  /**
   * Validates access token format and expiration
   */
  private validateAccessToken(token: string): void {
    if (typeof token !== "string") {
      throw new Error("Access token must be a string.");
    }

    if (token.length === 0) {
      throw new Error("Access token cannot be an empty string.");
    }

    if (!/^[A-Za-z0-9-_.]+$/.test(token)) {
      throw new Error(
        "Access token can only contain alphanumeric characters, dashes, underscores, and periods.",
      );
    }

    if (this.isTokenExpired(token)) {
      throw new Error("Access token is expired.");
    }
  }

  /**
   * Creates a fetch wrapper with User-Agent and optional token handling
   */
  private createFetchWrapper(
    fetch: FetchFn,
    options: OpenFoodFactsOptions,
  ): FetchFn {
    // Base fetch wrapper with User-Agent
    let wrappedFetch = this.createUserAgentFetch(fetch);

    // Add token handling if access token is provided
    if (options.accessToken != null) {
      this.validateAccessToken(options.accessToken);
      wrappedFetch = this.createTokenAwareFetch(wrappedFetch, options);
    }

    return wrappedFetch;
  }

  /**
   * Creates a fetch wrapper that adds User-Agent header
   */
  private createUserAgentFetch(fetch: FetchFn): FetchFn {
    return (
      url: string | URL | globalThis.Request,
      init?: globalThis.RequestInit,
    ) => {
      const headers = new Headers(init?.headers);
      headers.set("User-Agent", this.customUserAgent);
      return fetch(url, { ...init, headers });
    };
  }

  /**
   * Creates a fetch wrapper that handles token refresh and authorization
   */
  private createTokenAwareFetch(
    fetch: FetchFn,
    options: OpenFoodFactsOptions,
  ): FetchFn {
    return async (
      url: string | URL | globalThis.Request | URL,
      init?: globalThis.RequestInit,
    ) => {
      const headers = new Headers(init?.headers);

      if (this.accessToken == null) {
        throw new Error("Access token was first specified and now is null.");
      }

      if (this.isTokenExpired(this.accessToken)) {
        this.accessToken = await this.refreshAccessToken(options);
      }

      headers.set("Authorization", `Bearer ${this.accessToken}`);
      return fetch(url, { ...init, headers });
    };
  }

  /**
   * Refreshes the access token using the provided callback
   */
  private async refreshAccessToken(
    options: OpenFoodFactsOptions,
  ): Promise<string> {
    if (options.onAccessTokenExpired == null) {
      throw new Error(
        "Access token expired and no handler provided to refresh it." +
          " You should provide `onAccessTokenExpired` option or wrap the fetch function to handle token expiration.",
      );
    }

    const newAccessToken = await options.onAccessTokenExpired();

    if (newAccessToken == null) {
      throw new Error(
        "onAccessTokenExpired handler did not return a new access token.",
      );
    }

    return newAccessToken;
  }

  /**
   * Checks if a JWT access token is expired. Returns false only if the token is
   * well-formed, has a valid exp claim, and is not expired. Otherwise returns
   * true.
   */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token);

      if (decoded.exp == null) {
        return true; // If there's no exp claim, consider the token expired
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime >= decoded.exp;
    } catch (error) {
      // If token is malformed or cannot be decoded, consider it expired
      console.warn("Failed to decode access token:", error);
      return true;
    }
  }

  ////////////////
  // TAXONOMIES
  ////////////////

  getBrand(brandId: string): Promise<Brand> {
    return this.apiv2.getTaxoEntry("brands", brandId);
  }

  getLanguage(languageId: string): Promise<Language> {
    return this.apiv2.getTaxoEntry("languages", languageId);
  }

  /**
   * Returns a single category taxonomy entry by id
   * @param categoryId - The id of the category (e.g., "en:beverages")
   */
  getCategory(categoryId: string): Promise<Category> {
    return this.apiv2.getTaxoEntry("categories", categoryId);
  }

  /**
   * Returns a single label taxonomy entry by id
   * @param labelId - The id of the label (e.g., "en:organic")
   */
  getLabel(labelId: string): Promise<Label> {
    return this.apiv2.getTaxoEntry("labels", labelId);
  }

  /**
   * Returns a single additive taxonomy entry by id
   * @param additiveId - The id of the additive (e.g., "en:e322")
   */
  getAdditive(additiveId: string): Promise<Additive> {
    return this.apiv2.getTaxoEntry("additives", additiveId);
  }

  /**
   * Returns a single allergen taxonomy entry by id
   * @param allergenId - The id of the allergen (e.g., "en:gluten")
   */
  getAllergen(allergenId: string): Promise<Allergen> {
    return this.apiv2.getTaxoEntry("allergens", allergenId);
  }

  /**
   * Returns a single country taxonomy entry by id
   * @param countryId - The id of the country (e.g., "en:france")
   */
  getCountry(countryId: string): Promise<Country> {
    return this.apiv2.getTaxoEntry("countries", countryId);
  }

  /**
   * Returns a single ingredient taxonomy entry by id
   * @param ingredientId - The id of the ingredient (e.g., "en:sugar")
   */
  getIngredient(ingredientId: string): Promise<Ingredient> {
    return this.apiv2.getTaxoEntry("ingredients", ingredientId);
  }

  /**
   * Returns a single packaging taxonomy entry by id
   * @param packagingId - The id of the packaging (e.g., "en:plastic")
   */
  getPackaging(packagingId: string): Promise<TaxoNode> {
    return this.apiv2.getTaxoEntry("packaging", packagingId);
  }

  /**
   * Returns a single state taxonomy entry by id
   * @param stateId - The id of the state (e.g., "en:complete")
   */
  getState(stateId: string): Promise<State> {
    return this.apiv2.getTaxoEntry("states", stateId);
  }

  /**
   * Returns a single store taxonomy entry by id
   * @param storeId - The id of the store (e.g., "en:carrefour")
   */
  getStore(storeId: string): Promise<Store> {
    return this.apiv2.getTaxoEntry("stores", storeId);
  }

  /**
   * Returns a single nutrient taxonomy entry by id
   * @param nutrientId - The id of the nutrient (e.g., "en:energy")
   */
  getNutrient(nutrientId: string): Promise<Nutrient> {
    return this.apiv2.getTaxoEntry("nutrients", nutrientId);
  }

  getBrands(): Promise<Taxonomy<Brand>> {
    return this.getTaxo<Brand>("brands");
  }

  getLanguages(): Promise<Taxonomy<Language>> {
    return this.getTaxo<Language>("languages");
  }

  getLabels(): Promise<Taxonomy<Label>> {
    return this.getTaxo<Label>("labels");
  }

  getAdditives(): Promise<Taxonomy<Additive>> {
    return this.getTaxo<Additive>("additives");
  }

  getAllergens(): Promise<Taxonomy<Allergen>> {
    return this.getTaxo<Allergen>("allergens");
  }

  getCategories(): Promise<Taxonomy<Category>> {
    return this.getTaxo<Category>("categories");
  }

  getCountries(): Promise<Taxonomy<Country>> {
    return this.getTaxo<Country>("countries");
  }

  getIngredients(): Promise<Taxonomy<Ingredient>> {
    return this.getTaxo<Ingredient>("ingredients");
  }

  getPackagings(): Promise<Taxonomy<Packaging>> {
    return this.getTaxo<Packaging>("packaging");
  }

  getStates(): Promise<Taxonomy<State>> {
    return this.getTaxo<State>("states");
  }

  getStores(): Promise<Taxonomy<Store>> {
    return this.getTaxo<Store>("stores");
  }

  getNutrients(): Promise<Taxonomy<Nutrient>> {
    return this.getTaxo<Nutrient>("nutrients");
  }

  async getTaxo<T extends TaxoNode>(taxo: string): Promise<Taxonomy<T>> {
    const res = await this.fetch(TAXONOMY_URL(taxo, this.effectiveBackend));
    return (await res.json()) as Taxonomy<T>;
  }

  ///////////
  // API V2
  ///////////

  performOCR = (
    barcode: string,
    photoId: string,
    ocrEngine?: "google_cloud_vision",
  ) => this.apiv2.performOCR(barcode, photoId, ocrEngine);

  search = (query: SearchQueryV2) => this.apiv2.search(query);

  /**
   * Returns all available attribute groups
   * @returns A promise that resolves to an array of attribute groups
   */
  getAttributeGroups = () => this.apiv2.getAttributeGroups();

  /**
   * Returns product attributes for a given barcode
   * @param barcode - The barcode of the product
   * @returns A promise that resolves to an array of product attributes
   */
  getProductAttributes = (barcode: string) =>
    this.apiv2.getProductAttributes(barcode);

  /**
   * Returns product details by barcode with optional fields
   * @param barcode - The barcode of the product
   * @param query - An optional query object to filter the returned fields
   * @template T - An array of keys from ProductV3 to return
   * @example
   * ```typescript
   * const result = await api.getProductV3("1234567890123", { fields: ["product_name", "brands"] });
   * console.log(result.product.product_name, result.product.brands);
   * ```
   * @returns A promise that resolves to a product object with the specified fields or undefined if not found
   */
  getProductV3 = <Key extends Array<Extract<keyof ProductV3, string> | "all">>(
    barcode: string,
    query?: Omit<ProductQueryV3, "fields"> & { fields?: Key },
  ) => this.apiv3.getProductV3(barcode, query);

  /**
   * Fetch knowledge panels for a tag
   * @param tagtype - Type of the tag
   * @param tagOrTagId - Tag name (e.g. "yogurts") or tag id (e.g. "en:yogurts")
   * @param query - Optional query parameters for language and country localization
   * @returns A promise that resolves to the tag knowledge panels response
   */
  getTagKnowledgePanels = (
    tagtype: string,
    tagOrTagId: string,
    query?: TagKnowledgePanelsQuery,
  ) => this.apiv3.getTagKnowledgePanels(tagtype, tagOrTagId, query);

  /**
   * Adds or edits a product using the V2 API
   * @param product - The product data to add or edit
   * @param credentials - Optional credentials for authentication
   * @returns A promise that resolves to true if successful, false otherwise
   */
  addOrEditProductV2 = (
    product: ProductDataType & { comment?: string },
    credentials?: { username: string; password: string },
  ) => {
    const username = credentials?.username ?? this.defaultOptions.username;
    const password = credentials?.password ?? this.defaultOptions.password;

    const nullableCredentials =
      username != null && password != null ? { username, password } : undefined;
    return this.apiv2.addOrEditProductV2(product, nullableCredentials);
  };

  /**
   * Uploads an image to OpenFoodFacts for a product.
   * @param barcode - The barcode of the product
   * @param imageFile - The image file to upload
   * @param imagefield - The field name for the image (e.g., "front", "ingredients", "nutrition")
   * @returns A promise that resolves to the upload response
   */
  uploadImage = (barcode: string, imageFile: File, imagefield: string) =>
    this.apiv2.uploadImage(barcode, imageFile, imagefield);

  /**
   * Crops and selects an image for a product
   * @param barcode - The barcode of the product
   * @param imgid - Identifier of the image to select (should be a number)
   * @param id - Identifier of the selected image field (format: {IMAGE_TYPE}_{LANG})
   * @param cropData - Crop coordinates and options
   * @returns A promise that resolves to the crop response
   */
  cropImage = (
    barcode: string,
    imgid: number,
    id: string,
    cropData: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      angle?: number;
      normalize?: boolean;
      white_magic?: boolean;
      comment?: string;
      app_name?: string;
      app_version?: string;
      app_uuid?: string;
      user_agent?: string;
    },
  ) => this.apiv2.cropImage(barcode, imgid, id, cropData);

  /**
   * Rotates an image for a product
   * @param barcode - The barcode of the product
   * @param id - Identifier of the selected image field (format: {IMAGE_TYPE}_{LANG})
   * @param imgid - Identifier of the image to rotate (should be a number as string)
   * @param angle - Angle of rotation in degrees (90, 180, or 270 clockwise)
   * @returns A promise that resolves to the rotation response
   */
  rotateImage = (barcode: string, id: string, imgid: string, angle: string) =>
    this.apiv2.rotateImage(barcode, id, imgid, angle);

  /**
   * Unselects an image for a product
   * @param barcode - The barcode of the product
   * @param id - Image field (image id) of the photo to unselect (e.g., "front_fr")
   * @returns A promise that resolves to the unselect response
   */
  unselectImage = (barcode: string, id: string) =>
    this.apiv2.unselectImage(barcode, id);

  /**
   * Deletes an uploaded image for a product
   * @param barcode - The barcode of the product corresponding to the image
   * @param imgid - The id of the image to be deleted
   * @returns A promise that resolves to the deletion response
   */
  deleteProductImage = (barcode: string, imgid: number) =>
    this.apiv3.deleteProductImage(barcode, imgid);

  /**
   *
   * @param barcode
   * @param params
   * @returns
   */
  uploadProductImage = (barcode: string, params: ProductImageUploadParamsV3) =>
    this.apiv3.uploadProductImage(barcode, params);

  /**
   * Returns product data using the V2 API
   * @param barcode - The barcode of the product
   * @returns A promise that resolves to the product data or undefined if not found
   */
  getProductV2 = (barcode: string) => this.apiv2.getProductV2(barcode);

  /**
   * Returns an array of image names for the product
   * @param barcode - The barcode of the product
   * @returns A promise that resolves to an array of image names or null if not found
   */
  getProductImages = (barcode: string) => this.apiv2.getProductImages(barcode);

  /**
   * Delete a product page (moderator-only action)
   * @param code - The barcode of the product to delete
   * @param comment - The reason for deleting the product
   * @returns A promise that resolves to true if successful, false otherwise
   */
  deleteProduct = (code: string, comment: string) =>
    this.apiv2.deleteProduct(code, comment);

  /**
   * Move images from one product to another (moderator-only action).
   * @param code - source product barcode
   * @param imgids - comma-separated list of image IDs (e.g., "1,2,3")
   * @param moveToBarcode - destination product barcode
   * @param copyData - whether to copy product data to destination
   * @returns A promise that resolves with `{ data }` on success or `{ error }` on failure
   */
  moveImages = (
    code: string,
    imgids: string,
    moveToBarcode: string,
    copyData?: boolean,
  ) => this.apiv2.moveImages(code, imgids, moveToBarcode, copyData);

  /**
   * Delete product images by moving them to trash (moderator-only action).
   * @param code - product barcode
   * @param imgids - comma-separated list of image IDs (e.g., "1,2,3")
   * @returns A promise that resolves with `{ data }` on success or `{ error }` on failure
   */
  deleteImages = (code: string, imgids: string) =>
    this.apiv2.deleteImages(code, imgids);

  async getFacet(
    facet: string,
    opts?: { page?: number; pageSize?: number; sortBy?: FacetSortOption },
  ): Promise<FacetResponse> {
    const params = new URLSearchParams();
    if (opts?.page) params.set("page", `${opts.page}`);
    if (opts?.pageSize) params.set("page_size", `${opts.pageSize}`);
    if (opts?.sortBy) params.set("sort_by", opts.sortBy);

    const res = await this.fetch(
      `${this.baseUrl}/facets/${facet}.json?${params}`,
    );
    return (await res.json()) as FacetResponse;
  }

  async getFacetValue(
    facet: string,
    value: string,
    opts: { page?: number; pageSize?: number; sortBy?: FacetSortOption },
  ): Promise<FacetValueResponse> {
    const params = new URLSearchParams();
    if (opts?.page) params.set("page", `${opts.page}`);
    if (opts?.pageSize) params.set("page_size", `${opts.pageSize}`);
    if (opts?.sortBy) params.set("sort_by", opts.sortBy);

    const res = await this.fetch(
      new URL(`${this.baseUrl}/facets/${facet}/${value}.json?${params}`),
    );
    return (await res.json()) as FacetValueResponse;
  }

  async getLoginStatus() {
    const response = await this.fetch(
      new URL("/cgi/auth.pl?body=1", this.baseUrl),
    );

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
    return { data: (await response.json()) as LoginStatus };
  }

  /**
   * Returns the current authenticated user's permissions.
   * Requires a valid access token (set via constructor options).
   * @returns User permissions including moderator/admin flags, or error details
   */
  async getCurrentUserPermissions() {
    // TODO: use auto-generated openapi types when they become available
    const response = await this.fetch(
      new URL("/api/v3/current-user/permissions", this.baseUrl),
    );

    if (!response.ok) {
      return { error: `HTTP error! status: ${response.status}` };
    }
    return { data: (await response.json()) as CurrentUserPermissions };
  }
}

type BaseLoginStatus = { status: 0 | 1; status_verbose: string };

type LoggedOutStatus = BaseLoginStatus;
type LoggedInStatus = BaseLoginStatus & {
  user: { admin: 0 | 1; moderator: 1 | 0; name: string };
  user_id: string;
};

export type LoginStatus = LoggedInStatus | LoggedOutStatus;

export type CurrentUserPermissions = {
  status: "success" | "failure";
  result?: { id: string };
  user?: {
    userid: string;
    name: string;
    moderator: 0 | 1;
    admin: 0 | 1;
  };
  errors?: Array<{
    message?: { id: string };
    impact?: { id: string };
  }>;
};

export type ProductSearch<T = ProductDataType> = {
  count: number;
  page: number;
  page_count: number;
  page_size: number;
  products: T[];
  skip: number;
};

export default OpenFoodFacts;

/**
 * Gets URL for a product image based on its barcode and image name
 * @param barcode - Product barcode
 * @param imageName - Name of the image (e.g., "front", "ingredients", "nutrition")
 * @param images - Image metadata from product data
 * @param size - Image size (100, 200, 400, or full) - defaults to 400
 * @param backend - Backend flavor to fetch the image from - defaults to Open Food Facts
 * @returns Complete URL to the specific image or null if not found
 */
export function getProductImageUrl(
  barcode: string,
  imageName: string,
  images: Record<string, SelectedImage | RawImage>,
  size: "100" | "200" | "400" | "full" = "400",
  backend: BackendType = BackendType.OFF,
): string | null {
  const paddedBarcode = barcode.toString().padStart(13, "0");
  const match = paddedBarcode.match(/^(.{3})(.{3})(.{3})(.*)$/);
  if (!match) {
    throw new Error(`Invalid barcode format: ${paddedBarcode}`);
  }

  const path = `${match[1]}/${match[2]}/${match[3]}/${match[4]}`;
  const image = images[imageName];

  if (!image) {
    return null;
  }

  const rev = (image as SelectedImage).rev;
  let filename: string;
  if (rev) {
    filename = `${imageName}.${rev}.${size}.jpg`;
  } else {
    filename = `${imageName}.${size}.jpg`;
  }
  return `${getProductImageBaseUrl(backend)}/${path}/${filename}`;
}
