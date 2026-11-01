import openapiFetchCreateClient from "openapi-fetch";
import { unwrapCjsDefault } from "./interop-workaround.js";
import type { components, paths } from "./schemas/prices.js";
import { USER_AGENT } from "./consts.js";
import type { UnwrapContent } from "./openapi.js";
import type { FetchFn } from "./types.js";

// https://github.com/rolldown/tsdown/issues/1054
const createClient = unwrapCjsDefault(openapiFetchCreateClient);

type GetPricesQuery = paths["/api/v1/prices"]["get"]["parameters"]["query"];

export type PricesCreate = components["schemas"]["PriceCreate"];
export type PriceFull = components["schemas"]["PriceFull"];
export type Location = components["schemas"]["Location"];
export type ProductFull = components["schemas"]["ProductFull"];
export type ProofFull = components["schemas"]["ProofFull"];
export type Challenge = components["schemas"]["Challenge"];
export type PriceTag = components["schemas"]["PriceTagFull"];
export type ReceiptItem = components["schemas"]["ReceiptItemFull"];
export type PriceFlag = components["schemas"]["Flag"];

export type PriceUpdate = UnwrapContent<
  paths["/api/v1/prices/{id}"]["patch"]["requestBody"]
>;
export type PriceFlagCreate = UnwrapContent<
  paths["/api/v1/prices/{id}/flag"]["post"]["requestBody"]
>;
export type GetPriceHistoryQuery =
  paths["/api/v1/prices/{id}/history"]["get"]["parameters"]["query"];
export type GetPricesStatsQuery =
  paths["/api/v1/prices/stats"]["get"]["parameters"]["query"];

export type GetLocationsQuery =
  paths["/api/v1/locations"]["get"]["parameters"]["query"];
export type LocationCreate = UnwrapContent<
  paths["/api/v1/locations"]["post"]["requestBody"]
>;
export type CompareLocationsQuery =
  paths["/api/v1/locations/compare"]["get"]["parameters"]["query"];
export type GetOSMCountriesQuery =
  paths["/api/v1/locations/osm/countries"]["get"]["parameters"]["query"];
export type GetOSMCountryCitiesQuery =
  paths["/api/v1/locations/osm/countries/{country_code}/cities"]["get"]["parameters"]["query"];
export type OSMType =
  paths["/api/v1/locations/osm/{osm_type}/{osm_id}"]["get"]["parameters"]["path"]["osm_type"];

export type GetProductsQuery =
  paths["/api/v1/products"]["get"]["parameters"]["query"];
export type ProductOFFUpdateBody = UnwrapContent<
  paths["/api/v1/products/code/{code}/off-update"]["patch"]["requestBody"]
>;
export type ProductOFFUploadImageBody = UnwrapContent<
  paths["/api/v1/products/code/{code}/off-upload-image"]["patch"]["requestBody"]
>;
export type ProofUpdate = UnwrapContent<
  paths["/api/v1/proofs/{id}"]["patch"]["requestBody"]
>;
export type GetProofHistoryQuery =
  paths["/api/v1/proofs/{id}/history"]["get"]["parameters"]["query"];
export type ProofFlagCreate = UnwrapContent<
  paths["/api/v1/proofs/{id}/flag"]["post"]["requestBody"]
>;
export type ProcessProofWithGeminiBody = UnwrapContent<
  paths["/api/v1/proofs/process-with-gemini"]["post"]["requestBody"]
>;

export type GetUsersQuery =
  paths["/api/v1/users"]["get"]["parameters"]["query"];

export type GetChallengesQuery =
  paths["/api/v1/challenges"]["get"]["parameters"]["query"];

export type GetPriceTagsQuery =
  paths["/api/v1/price-tags"]["get"]["parameters"]["query"];
export type PriceTagCreate = UnwrapContent<
  paths["/api/v1/price-tags"]["post"]["requestBody"]
>;
export type PriceTagUpdate = UnwrapContent<
  paths["/api/v1/price-tags/{id}"]["patch"]["requestBody"]
>;

export type GetReceiptItemsQuery =
  paths["/api/v1/receipt-items"]["get"]["parameters"]["query"];
export type ReceiptItemCreate = UnwrapContent<
  paths["/api/v1/receipt-items"]["post"]["requestBody"]
>;
export type ReceiptItemUpdate = UnwrapContent<
  paths["/api/v1/receipt-items/{id}"]["patch"]["requestBody"]
>;
export type GetFlagsQuery =
  paths["/api/v1/flags"]["get"]["parameters"]["query"];
export type FlagUpdate = UnwrapContent<
  paths["/api/v1/flags/{id}"]["patch"]["requestBody"]
>;

const BASE_URL = "https://prices.openfoodfacts.org";

export class PricesApi {
  private readonly client: ReturnType<typeof createClient<paths>>;

  constructor(
    fetch: FetchFn,
    options: { baseUrl: string; authToken?: string } = { baseUrl: BASE_URL },
  ) {
    this.client = createClient({
      fetch,
      baseUrl: options.baseUrl,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options?.authToken}`,
        "User-Agent": USER_AGENT,
      },
    });
  }

  getPrices(query: GetPricesQuery) {
    return this.client.GET("/api/v1/prices", { params: { query } });
  }
  createPrice(body: PricesCreate) {
    return this.client.POST("/api/v1/prices", { body });
  }

  getPrice(id: number) {
    return this.client.GET("/api/v1/prices/{id}", { params: { path: { id } } });
  }
  updatePrice(id: number, body: PriceUpdate) {
    return this.client.PATCH("/api/v1/prices/{id}", {
      params: { path: { id } },
      body,
    });
  }
  deletePrice(id: number) {
    return this.client.DELETE("/api/v1/prices/{id}", {
      params: { path: { id } },
    });
  }
  getPriceHistory(id: number, query?: GetPriceHistoryQuery) {
    return this.client.GET("/api/v1/prices/{id}/history", {
      params: { path: { id }, query: query ?? {} },
    });
  }
  getPricesStats(query?: GetPricesStatsQuery) {
    return this.client.GET("/api/v1/prices/stats", {
      params: { query: query ?? {} },
    });
  }
  flagPrice(id: number, body: PriceFlagCreate) {
    return this.client.POST("/api/v1/prices/{id}/flag", {
      params: { path: { id } },
      body,
    });
  }

  getLocations(query?: GetLocationsQuery) {
    return this.client.GET("/api/v1/locations", {
      params: { query: query ?? {} },
    });
  }
  createLocation(body: LocationCreate) {
    return this.client.POST("/api/v1/locations", { body });
  }
  getLocation(id: number) {
    return this.client.GET("/api/v1/locations/{id}", {
      params: { path: { id } },
    });
  }
  compareLocations(query: CompareLocationsQuery) {
    return this.client.GET("/api/v1/locations/compare", { params: { query } });
  }
  getLocationByOSM(osm_type: OSMType, osm_id: number) {
    return this.client.GET("/api/v1/locations/osm/{osm_type}/{osm_id}", {
      params: { path: { osm_type, osm_id } },
    });
  }
  getOSMCountries(query?: GetOSMCountriesQuery) {
    return this.client.GET("/api/v1/locations/osm/countries", {
      params: { query: query ?? {} },
    });
  }
  getOSMCountryCities(country_code: string, query?: GetOSMCountryCitiesQuery) {
    return this.client.GET(
      "/api/v1/locations/osm/countries/{country_code}/cities",
      {
        params: { path: { country_code }, query: query ?? {} },
      },
    );
  }

  getProducts(query?: GetProductsQuery) {
    return this.client.GET("/api/v1/products", {
      params: { query: query ?? {} },
    });
  }
  getProduct(id: number) {
    return this.client.GET("/api/v1/products/{id}", {
      params: { path: { id } },
    });
  }
  getProductByCode(code: string) {
    return this.client.GET("/api/v1/products/code/{code}", {
      params: { path: { code } },
    });
  }
  triggerOFFUpdate(code: string, body: ProductOFFUpdateBody) {
    return this.client.PATCH("/api/v1/products/code/{code}/off-update", {
      params: { path: { code } },
      body,
    });
  }
  triggerOFFUploadImage(code: string, body: ProductOFFUploadImageBody) {
    return this.client.PATCH("/api/v1/products/code/{code}/off-upload-image", {
      params: { path: { code } },
      body,
    });
  }

  getUsers(query?: GetUsersQuery) {
    return this.client.GET("/api/v1/users", { params: { query: query ?? {} } });
  }
  getUser(user_id: string) {
    return this.client.GET("/api/v1/users/{user_id}", {
      params: { path: { user_id } },
    });
  }

  getChallenges(query?: GetChallengesQuery) {
    return this.client.GET("/api/v1/challenges", {
      params: { query: query ?? {} },
    });
  }
  getChallenge(id: number) {
    return this.client.GET("/api/v1/challenges/{id}", {
      params: { path: { id } },
    });
  }

  getPriceTags(query?: GetPriceTagsQuery) {
    return this.client.GET("/api/v1/price-tags", {
      params: { query: query ?? {} },
    });
  }
  createPriceTag(body: PriceTagCreate) {
    return this.client.POST("/api/v1/price-tags", { body });
  }
  getPriceTag(id: number) {
    return this.client.GET("/api/v1/price-tags/{id}", {
      params: { path: { id } },
    });
  }
  updatePriceTag(id: number, body: PriceTagUpdate) {
    return this.client.PATCH("/api/v1/price-tags/{id}", {
      params: { path: { id } },
      body,
    });
  }
  deletePriceTag(id: number) {
    return this.client.DELETE("/api/v1/price-tags/{id}", {
      params: { path: { id } },
    });
  }

  getReceiptItems(query?: GetReceiptItemsQuery) {
    return this.client.GET("/api/v1/receipt-items", {
      params: { query: query ?? {} },
    });
  }
  createReceiptItem(body: ReceiptItemCreate) {
    return this.client.POST("/api/v1/receipt-items", { body });
  }
  getReceiptItem(id: number) {
    return this.client.GET("/api/v1/receipt-items/{id}", {
      params: { path: { id } },
    });
  }
  updateReceiptItem(id: number, body: ReceiptItemUpdate) {
    return this.client.PATCH("/api/v1/receipt-items/{id}", {
      params: { path: { id } },
      body,
    });
  }
  deleteReceiptItem(id: number) {
    return this.client.DELETE("/api/v1/receipt-items/{id}", {
      params: { path: { id } },
    });
  }

  getFlags(query?: GetFlagsQuery) {
    return this.client.GET("/api/v1/flags", { params: { query: query ?? {} } });
  }
  updateFlag(id: number, body: FlagUpdate) {
    return this.client.PATCH("/api/v1/flags/{id}", {
      params: { path: { id } },
      body,
    });
  }

  login(body: { username: string; password: string }) {
    return this.client.POST("/api/v1/auth", {
      params: { query: { set_cookie: 1 } },
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      bodySerializer: (body) =>
        new URLSearchParams(body as Record<string, string>),
    });
  }

  getSession() {
    return this.client.GET("/api/v1/session");
  }

  deleteSession() {
    return this.client.DELETE("/api/v1/session");
  }

  uploadProof(body: { file: Blob }) {
    return this.client.POST("/api/v1/proofs/upload", {
      // @ts-expect-error - FormData is not supported by openapi-fetch
      body: body,
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  getProofs() {
    return this.client.GET("/api/v1/proofs");
  }

  getProof(id: number) {
    return this.client.GET("/api/v1/proofs/{id}", { params: { path: { id } } });
  }

  updateProof(id: number, body: ProofUpdate) {
    return this.client.PATCH("/api/v1/proofs/{id}", {
      params: { path: { id } },
      body,
    });
  }

  deleteProof(id: number) {
    return this.client.DELETE("/api/v1/proofs/{id}", {
      params: { path: { id } },
    });
  }

  getProofHistory(id: number, query?: GetProofHistoryQuery) {
    return this.client.GET("/api/v1/proofs/{id}/history", {
      params: { path: { id }, query: query ?? {} },
    });
  }

  flagProof(id: number, body: ProofFlagCreate) {
    return this.client.POST("/api/v1/proofs/{id}/flag", {
      params: { path: { id } },
      body,
    });
  }

  processProofWithGemini(body: ProcessProofWithGeminiBody) {
    return this.client.POST("/api/v1/proofs/process-with-gemini", { body });
  }

  async isAuthenticated() {
    const res = await this.client.GET("/api/v1/session");
    return res.response.ok;
  }

  getStats() {
    return this.client.GET("/api/v1/stats");
  }

  async getStatus() {
    const res = await this.client.GET("/api/v1/status");
    return res.data as { status: string };
  }

  private async getSchema(format?: "json" | "yaml") {
    const res = await this.client.GET("/api/schema", {
      params: { query: format ? { format } : {} },
    });
    return res;
  }

  async getCurrenciesList(): Promise<string[]> {
    const res = await this.getSchema("json");

    // @ts-expect-error - OpenAPI types do not reflect the dynamic structure of schema paths
    return res?.data?.components?.schemas?.CurrencyEnum?.enum || [];
  }
}
