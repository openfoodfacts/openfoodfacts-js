import type { paths } from "./schemas/search.js";
import openapiFetchCreateClient from "openapi-fetch";
import { unwrapCjsDefault } from "./interop-workaround.js";
import { USER_AGENT } from "./consts.js";
import type { FetchFn } from "./types.js";

// https://github.com/rolldown/tsdown/issues/1054
const createClient = unwrapCjsDefault(openapiFetchCreateClient);

const SEARCH_BASE_URL = "https://search.openfoodfacts.org";

export type DocumentQuery =
  paths["/document/{identifier}"]["get"]["parameters"]["query"];

export type SearchQuery = paths["/search"]["get"]["parameters"]["query"];
type RawSearchBody =
  paths["/search"]["post"]["requestBody"]["content"]["application/json"];

// TODO: These are defined because openapi does not have correct typing for
// the /search POST charts parameter.
// Once the OpenAPI spec is fixed, these types can be removed.
type DistributionChartParam = {
  chart_type: "DistributionChart";
  field: string;
};

type ScatterChartParam = {
  chart_type: "ScatterChart";
  x: string;
  y: string;
};

export type SearchBody = Omit<RawSearchBody, "charts"> & {
  charts?: (DistributionChartParam | ScatterChartParam)[];
};

export type AutocompleteQuery =
  paths["/autocomplete"]["get"]["parameters"]["query"];

export type HtmlSearchQuery = paths["/off-test"]["get"]["parameters"]["query"];

export class SearchApi {
  private readonly client: ReturnType<typeof createClient<paths>>;

  constructor(
    fetch: FetchFn,
    options: { baseUrl: string } = { baseUrl: SEARCH_BASE_URL },
  ) {
    this.client = createClient<paths>({
      fetch,
      baseUrl: options.baseUrl,
      credentials: "include",
      headers: {
        "User-Agent": USER_AGENT,
      },
    });
  }

  /**
   * Normalizes a search result by ensuring `hits` is always an array.
   *
   * If the API returns a 200 response with a missing or non-array `hits`
   * field (e.g. during a backend schema change or unexpected error format),
   * this guard logs a warning and replaces `hits` with an empty array so
   * callers never crash on `.hits.map(...)`.
   *
   * @param result - The raw result object from openapi-fetch.
   * @returns The same result object, with `hits` guaranteed to be an array
   *          if `data` is present.
   */
  private normalizeSearchResult<T extends { data?: unknown }>(result: T): T {
    if (
      result.data != null &&
      !Array.isArray((result.data as { hits?: unknown }).hits)
    ) {
      console.warn(
        "SearchApi: response missing 'hits' field — returning empty array as fallback",
        result.data,
      );
      result.data = { ...(result.data as object), hits: [] } as typeof result.data;
    }
    return result;
  }

  async getDocument(identifier: string, query?: DocumentQuery) {
    return this.client.GET("/document/{identifier}", {
      params: { path: { identifier }, query },
    });
  }

  async search(body: SearchBody) {
    const result = await this.client.POST("/search", {
      body: body as unknown as RawSearchBody,
    });
    return this.normalizeSearchResult(result);
  }

  async searchGet(query: SearchQuery) {
    const result = await this.client.GET("/search", { params: { query } });
    return this.normalizeSearchResult(result);
  }

  async autocomplete(query: AutocompleteQuery) {
    return this.client.GET("/autocomplete", { params: { query } });
  }

  async getOffDemo() {
    return this.client.GET("/", {});
  }

  async htmlSearch(query?: HtmlSearchQuery) {
    return this.client.GET("/off-test", { params: { query } });
  }

  async getRobotsTxt() {
    return this.client.GET("/robots.txt", {});
  }

  async healthCheck() {
    return this.client.GET("/health", {});
  }
}
