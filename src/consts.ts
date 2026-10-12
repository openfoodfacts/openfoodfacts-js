export const STATIC_HOST = "https://static.openfoodfacts.org";

import { VERSION } from "./version.js";
export const USER_AGENT = `OpenFoodFacts - NodeJS ${VERSION}`;

/* eslint-disable no-unused-vars */
export enum BackendType {
  OFF = "OFF",
  OBF = "OBF",
  OPFF = "OPFF",
  OPF = "OPF",
}

export const BACKEND_DOMAINS = {
  [BackendType.OFF]: "openfoodfacts.org",
  [BackendType.OBF]: "openbeautyfacts.org",
  [BackendType.OPFF]: "openpetfoodfacts.org",
  [BackendType.OPF]: "openproductsfacts.org",
};

export const STATIC_HOSTS = {
  [BackendType.OFF]: `https://static.${BACKEND_DOMAINS[BackendType.OFF]}`,
  [BackendType.OBF]: `https://static.${BACKEND_DOMAINS[BackendType.OBF]}`,
  [BackendType.OPFF]: `https://static.${BACKEND_DOMAINS[BackendType.OPFF]}`,
  [BackendType.OPF]: `https://static.${BACKEND_DOMAINS[BackendType.OPF]}`,
};

export const BACKEND_NAMES = {
  [BackendType.OFF]: "OpenFoodFacts",
  [BackendType.OBF]: "OpenBeautyFacts",
  [BackendType.OPFF]: "OpenPetFoodFacts",
  [BackendType.OPF]: "OpenProductsFacts",
};

export const DEFAULT_FOLKSONOMY_API_URL =
  "https://api.folksonomy.openfoodfacts.org";
export const DEFAULT_ROBOTOFF_API_URL =
  "https://robotoff.openfoodfacts.org/api/v1";
export const DEFAULT_NUTRIPATROL_API_URL =
  "https://nutripatrol.openfoodfacts.org";

/** Robotoff is deployed for every flavor; the `/api/v1` path is appended by the client. */
export const ROBOTOFF_API_URLS = {
  [BackendType.OFF]: `https://robotoff.${BACKEND_DOMAINS[BackendType.OFF]}`,
  [BackendType.OBF]: `https://robotoff.${BACKEND_DOMAINS[BackendType.OBF]}`,
  [BackendType.OPFF]: `https://robotoff.${BACKEND_DOMAINS[BackendType.OPFF]}`,
  [BackendType.OPF]: `https://robotoff.${BACKEND_DOMAINS[BackendType.OPF]}`,
};

export const PRODUCT_IMAGE_BASE_URL =
  "https://images.openfoodfacts.org/images/products";

/**
 * Returns the product image base URL for a given backend flavor.
 * @param type - The backend flavor, defaults to Open Food Facts.
 * @returns The image base URL, e.g. `https://images.openbeautyfacts.org/images/products`.
 */
export const getProductImageBaseUrl = (type: BackendType = BackendType.OFF) =>
  `https://images.${BACKEND_DOMAINS[type]}/images/products`;

export const PRODUCT_API_HOST = "https://world.openfoodfacts.org";
export const PRODUCT_IMAGE_URL = (path: string) =>
  `${PRODUCT_IMAGE_BASE_URL}/${path}`;
