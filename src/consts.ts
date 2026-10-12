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

/**
 * Dynamic Helper to get the API Host based on the flavor (OFF, OBF, etc.)
 */
export const getProductApiHost = (backend: BackendType = BackendType.OFF): string => {
  return `https://world.${BACKEND_DOMAINS[backend]}`;
};

/**
 * Dynamic Helper to get the Image Base URL based on the flavor
 */
export const getProductImageBaseUrl = (backend: BackendType = BackendType.OFF): string => {
  return `https://images.${BACKEND_DOMAINS[backend]}/images/products`;
};

// Default constants for backward compatibility
export const PRODUCT_API_HOST = getProductApiHost(BackendType.OFF);
export const PRODUCT_IMAGE_BASE_URL = getProductImageBaseUrl(BackendType.OFF);

export const PRODUCT_IMAGE_URL = (path: string) =>
  `${PRODUCT_IMAGE_BASE_URL}/${path}`;
