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
