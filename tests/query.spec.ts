import { Mock } from "vitest";
import { QueryApi } from "../src/query";
import { TestUtils } from "./utils/test-utils";

describe("Query API", () => {
  let fetchMock: Mock;
  let client: QueryApi;

  beforeEach(() => {
    fetchMock = vi.fn();
    client = new QueryApi(fetchMock, { baseUrl: "https://query.example/" });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns facet values from the mocked API response", async () => {
    const data = [{ _id: "en:brand", count: 42 }];
    fetchMock.mockResolvedValue(TestUtils.mockResponse(data));

    const result = await client.getFacetValues("brands_tags", {
      filter: {
        countries_tags: "en:france",
        nutriscore_score: { $gte: 3 },
      },
      limit: 10,
      skip: 20,
      obsolete: true,
      productType: "food",
    });

    expect(result).toEqual(data);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://query.example/aggregate?obsolete=true&product_type=food",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify([
          {
            $match: {
              countries_tags: "en:france",
              nutriscore_score: { $gte: 3 },
            },
          },
          { $group: { _id: "$brands_tags" } },
          { $skip: 20 },
          { $limit: 10 },
        ]),
      }),
    );
  });

  it("sends find queries with projection, sort and pagination", async () => {
    const products = [{ code: "123", product_name: "Example" }];
    fetchMock.mockResolvedValue(TestUtils.mockResponse(products));
    const query = {
      filter: { countries_tags: "en:france" },
      projection: { code: true, product_name: true },
      sort: [["last_modified_t", -1]] as ["last_modified_t", -1][],
      skip: 20,
      limit: 10,
    };
    expect(
      await client.find(query, { obsolete: false, productType: "food" }),
    ).toEqual(products);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://query.example/find?obsolete=false&product_type=food",
      expect.objectContaining({ method: "POST", body: JSON.stringify(query) }),
    );
  });

  it("sends aggregate pipelines and returns count results", async () => {
    const stages = [
      { $match: {} },
      { $group: { _id: "$brands_tags" as const } },
      { $count: 1 },
    ];
    fetchMock.mockResolvedValue(TestUtils.mockResponse({ brands_tags: 17 }));
    expect(await client.aggregate(stages)).toEqual({ brands_tags: 17 });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://query.example/aggregate",
      expect.objectContaining({ method: "POST", body: JSON.stringify(stages) }),
    );
  });

  it("counts products matching a filter", async () => {
    const filter = { countries_tags: "en:france" };
    fetchMock.mockResolvedValue(TestUtils.mockResponse(42));
    expect(await client.count(filter, { productType: "beauty" })).toBe(42);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://query.example/count?product_type=beauty",
      expect.objectContaining({ method: "POST", body: JSON.stringify(filter) }),
    );
  });

  it("returns the distinct facet count from the mocked API response", async () => {
    fetchMock.mockResolvedValue(TestUtils.mockResponse({ brands_tags: 17 }));

    const result = await client.countFacetValues("brands_tags", {
      filter: { countries_tags: "en:france" },
      productType: "beauty",
    });

    expect(result).toBe(17);
  });

  it.each([
    { limit: 0 },
    { limit: -1 },
    { limit: 1.5 },
    { skip: -1 },
    { skip: 1.5 },
  ])("rejects invalid pagination options: %o", async (options) => {
    await expect(client.getFacetValues("brands_tags", options)).rejects.toThrow(
      RangeError,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws an error for a failed query response", async () => {
    fetchMock.mockResolvedValue(TestUtils.mockResponse({}, false, 422));

    await expect(client.getFacetValues("brands_tags")).rejects.toThrow(
      "Query API error: HTTP 422",
    );
  });
});
