import { USER_AGENT } from "./consts.js";
import type { components, operations } from "./schemas/query.js";
import type { FetchFn } from "./types.js";

type StripGroupPrefix<T> = T extends `$${infer Field}` ? Field : never;
type AggregateOperation = operations["aggregate_aggregate_post"];
export type QueryAggregateStage =
  AggregateOperation["requestBody"]["content"]["application/json"][number];
export type QueryAggregateResponse =
  AggregateOperation["responses"]["200"]["content"]["application/json"];
export type QueryFindRequest = components["schemas"]["FindQuery"];
export type QueryFindResponse =
  operations["find_find_post"]["responses"]["200"]["content"]["application/json"];
type AggregateQuery = AggregateOperation["parameters"]["query"];

/** Fields accepted by openfoodfacts-query's `$group: { _id: "$field" }`. */
export type QueryFacetField = StripGroupPrefix<
  components["schemas"]["GroupFields"]
>;
/** Product filter using the fields and comparison operators from the OpenAPI schema. */
export type QueryFilter = components["schemas"]["Filter"];
export type QueryFieldOperators = components["schemas"]["Qualify"];
export type QueryProductType = NonNullable<
  NonNullable<AggregateQuery>["product_type"]
>;
export type QueryFacetValue = Required<
  components["schemas"]["AggregateResult"]
>;

export type QueryOptions = {
  obsolete?: boolean;
  productType?: QueryProductType;
};

export type QueryFacetOptions = QueryOptions & {
  filter?: QueryFilter;
  limit?: number;
  skip?: number;
};

const DEFAULT_QUERY_URL = "https://query.openfoodfacts.org";

/** Client for the Open Food Facts query service. */
export class QueryApi {
  private readonly fetch: FetchFn;
  private readonly baseUrl: string;

  constructor(fetch: FetchFn, options: { baseUrl?: string } = {}) {
    this.fetch = fetch;
    this.baseUrl = (options.baseUrl ?? DEFAULT_QUERY_URL).replace(/\/$/, "");
  }

  /** Find product documents using a filter, projection, sort and pagination. */
  async find(
    query: QueryFindRequest,
    options: QueryOptions = {},
  ): Promise<QueryFindResponse> {
    return this.post("find", query, options);
  }

  /** Count products matching a filter. */
  async count(
    filter: QueryFilter,
    options: QueryOptions = {},
  ): Promise<number> {
    return this.post("count", filter, options);
  }

  /** Run an aggregation pipeline supported by the query service. */
  async aggregate(
    stages: QueryAggregateStage[],
    options: QueryOptions = {},
  ): Promise<QueryAggregateResponse> {
    return this.post("aggregate", stages, options);
  }

  /**
   * Return grouped facet values and product counts. This method uses the service's supported
   * `$match`, `$group`, `$limit`, and `$skip` stages.
   *
   * @example
   * const brands = await client.query.getFacetValues("brands_tags", {
   *   filter: { countries_tags: "en:france" },
   *   limit: 20,
   * });
   */
  async getFacetValues(
    facet: QueryFacetField,
    options: QueryFacetOptions = {},
  ): Promise<QueryFacetValue[]> {
    this.validatePagination(options);
    const stages: QueryAggregateStage[] = [
      { $match: options.filter ?? {} },
      { $group: { _id: `$${facet}` } },
    ];
    if (options.skip !== undefined) stages.push({ $skip: options.skip });
    if (options.limit !== undefined) stages.push({ $limit: options.limit });

    return (await this.aggregate(stages, options)) as QueryFacetValue[];
  }

  /**
   * Return the number of distinct values in a facet, optionally restricted by a product filter.
   */
  async countFacetValues(
    facet: QueryFacetField,
    options: Pick<
      QueryFacetOptions,
      "filter" | "obsolete" | "productType"
    > = {},
  ): Promise<number> {
    const result = (await this.aggregate(
      [
        { $match: options.filter ?? {} },
        { $group: { _id: `$${facet}` } },
        { $count: 1 },
      ],
      options,
    )) as components["schemas"]["AggregateCountResult"];
    return result[facet];
  }

  private async post<T>(
    endpoint: "find" | "count" | "aggregate",
    body: QueryFindRequest | QueryFilter | QueryAggregateStage[],
    options: QueryOptions,
  ): Promise<T> {
    const params = new URLSearchParams();
    if (options.obsolete !== undefined) {
      params.set("obsolete", String(options.obsolete));
    }
    if (options.productType !== undefined) {
      params.set("product_type", options.productType);
    }
    const queryString = params.toString();
    const query = queryString ? `?${queryString}` : "";
    const response = await this.fetch(`${this.baseUrl}/${endpoint}${query}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Query API error: HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  }

  private validatePagination(options: QueryFacetOptions): void {
    if (
      options.limit !== undefined &&
      (!Number.isInteger(options.limit) || options.limit <= 0)
    ) {
      throw new RangeError("limit must be a positive integer");
    }
    if (
      options.skip !== undefined &&
      (!Number.isInteger(options.skip) || options.skip < 0)
    ) {
      throw new RangeError("skip must be a non-negative integer");
    }
  }
}
