import { Mock } from "vitest";
import { FacetsKp } from "../src/facets-kp";
import { USER_AGENT } from "../src/consts";
import { TestUtils } from "./utils/test-utils";

describe("FacetsKp Wrapper", () => {
  let fetchMock: Mock;
  let client: FacetsKp;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    client = new FacetsKp(fetchMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  const mockResponse = TestUtils.mockResponse;

  describe("Constructor", () => {
    it("should initialize with default baseUrl when options are omitted", () => {
      const defaultClient = new FacetsKp(fetchMock);
      expect(defaultClient.baseUrl).toBe("https://facets-kp.openfoodfacts.org");
    });

    it("should initialize with custom baseUrl when provided", () => {
      const customClient = new FacetsKp(fetchMock, {
        baseUrl: "https://custom-facets.example.com",
      });
      expect(customClient.baseUrl).toBe("https://custom-facets.example.com");
    });

    it("should include User-Agent header in requests", async () => {
      fetchMock.mockResolvedValue(mockResponse({ knowledge_panels: {} }));

      await client.getFacetKnowledgePanels("category");

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [req, init] = fetchMock.mock.calls[0];
      const headers =
        req instanceof Request ? req.headers : new Headers(init?.headers);
      expect(headers.get("user-agent")).toBe(USER_AGENT);
    });
  });

  describe("getFacetKnowledgePanels", () => {
    it("should fetch facet knowledge panels with facet only", async () => {
      const mockData = {
        knowledge_panels: {
          panel_1: {
            title_element: {
              title: "Category Panel",
              icon_url: "https://example.com/icon.png",
              icon_color_from_evaluation: false,
              icon_size: "medium",
            },
          },
        },
      };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data, error } =
        await client.getFacetKnowledgePanels("categories");

      expect(error).toBeUndefined();
      expect(data).toEqual(mockData);

      const [req] = fetchMock.mock.calls[0];
      const requestUrl = typeof req === "string" ? req : req.url;
      expect(requestUrl).toContain("facet_tag=categories");
      expect(requestUrl).not.toContain("value_tag=");
    });

    it("should fetch facet knowledge panels with facet and value", async () => {
      const mockData = { knowledge_panels: {} };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data, error } = await client.getFacetKnowledgePanels(
        "categories",
        "en:beverages",
      );

      expect(error).toBeUndefined();
      expect(data).toEqual(mockData);

      const [req] = fetchMock.mock.calls[0];
      const requestUrl = typeof req === "string" ? req : req.url;
      expect(requestUrl).toContain("facet_tag=categories");
      expect(requestUrl).toContain("value_tag=en%3Abeverages");
    });

    it("should handle error response", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const { data, error } =
        await client.getFacetKnowledgePanels("categories");

      expect(data).toBeUndefined();
      expect(error).toBeDefined();
    });
  });
});
