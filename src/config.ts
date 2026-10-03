import {
  PRODUCT_API_HOST,
  PRODUCT_IMAGE_BASE_URL,
  STATIC_HOST,
} from "./consts.js";
import type { components } from "./schemas/server/v3.js";

export type ProductType = components["parameters"]["RequestedProductType"];

export interface SDKConfig {
  locale?: { language?: string; country?: string };
  app?: { name: string; version?: string; contact?: string };
  defaults?: { productType?: ProductType };
  endpoints?: Partial<Record<SDKEndpoint, string>>;
}

export type SDKEndpoint = "products" | "images" | "taxonomies";

export interface ResolvedSDKConfig {
  readonly locale: Readonly<{ language: string; country: string }>;
  readonly app?: Readonly<{ name: string; version?: string; contact?: string }>;
  readonly defaults: Readonly<{ productType: ProductType }>;
  readonly endpoints: Readonly<Record<SDKEndpoint, string>>;
}

const PRODUCTION_ENDPOINTS: Record<SDKEndpoint, string> = {
  products: PRODUCT_API_HOST,
  images: PRODUCT_IMAGE_BASE_URL,
  taxonomies: STATIC_HOST,
};

/** Resolve SDK defaults without mutating the supplied options. */
export function resolveConfig(config: SDKConfig = {}): ResolvedSDKConfig {
  const endpoints: Record<SDKEndpoint, string> = {
    ...PRODUCTION_ENDPOINTS,
  };
  for (const [name, endpoint] of Object.entries(config.endpoints ?? {})) {
    if (endpoint === undefined) continue;
    if (!Object.prototype.hasOwnProperty.call(PRODUCTION_ENDPOINTS, name)) {
      throw new Error(`Unknown SDK endpoint: "${name}".`);
    }
    if (endpoint.length === 0) {
      throw new Error(`SDK endpoint "${name}" cannot be empty.`);
    }
    endpoints[name as SDKEndpoint] = endpoint;
  }
  for (const name of Object.keys(endpoints) as SDKEndpoint[]) {
    endpoints[name] = endpoints[name].replace(/\/$/, "");
  }
  const frozenEndpoints = Object.freeze(endpoints);
  for (const [name, endpoint] of Object.entries(frozenEndpoints)) {
    if (endpoint == null) continue;
    try {
      const url = new URL(endpoint);
      if (
        (url.protocol !== "https:" && url.protocol !== "http:") ||
        url.search !== "" ||
        url.hash !== ""
      )
        throw new Error();
    } catch {
      throw new Error(`Invalid URL for SDK endpoint "${name}": ${endpoint}`);
    }
  }

  const app = config.app ? Object.freeze({ ...config.app }) : undefined;
  if (app && !app.name.trim()) throw new Error("app.name cannot be empty.");
  const productType = config.defaults?.productType ?? "all";
  if (!["all", "beauty", "food", "petfood", "product"].includes(productType)) {
    throw new Error(`Unsupported default product type: ${productType}`);
  }

  return Object.freeze({
    locale: Object.freeze({
      language: config.locale?.language ?? "en",
      country: config.locale?.country ?? "world",
    }),
    app,
    defaults: Object.freeze({
      productType,
    }),
    endpoints: frozenEndpoints,
  });
}
