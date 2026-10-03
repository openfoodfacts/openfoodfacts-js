import { Mock } from "vitest";
import { Folksonomy, FolksonomyTag } from "../src/folksonomy";
import { TestUtils } from "./utils/test-utils";

describe("Folksonomy Wrapper", () => {
  let fetchMock: Mock;
  let client: Folksonomy;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    client = new Folksonomy(fetchMock, { authToken: "test-token" });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  const mockResponse = TestUtils.mockResponse;

  describe("Keys", () => {
    it("should fetch keys successfully", async () => {
      const mockData = [{ k: "test-key", count: 1, values: 1 }];
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data, error } = await client.getKeys();
      expect(error).toBeUndefined();
      expect(data).toEqual(mockData);
    });

    it("should handle error when fetching keys", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const { data, error } = await client.getKeys();
      expect(data).toBeUndefined();
      expect(error).toBeDefined();
    });
  });

  describe("Products", () => {
    it("should fetch products successfully", async () => {
      const mockData = [{ product: 1, k: "Test Product", v: "Test Value" }];
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data, error } = await client.getProducts(
        "test-key",
        "test-value",
      );
      expect(error).toBeUndefined();
      expect(data).toEqual(mockData);
    });

    it("should handle error when fetching products", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const result = await client.getProducts("test-key");
      expect(result.response.status).toBe(500);
      expect(result.response.ok).toBe(false);
    });
  });

  describe("Tags", () => {
    it("should put tag successfully", async () => {
      const tagData: FolksonomyTag = {
        k: "test-key",
        v: "test-value",
        product: "12345",
        comment: "Test comment",
        owner: "test-owner",
        version: 1,
      };
      fetchMock.mockResolvedValue(mockResponse("ok", true, 200));

      const error = await client.putTag(tagData);
      expect(error).toBeUndefined();
    });

    it("should handle error when putting tag", async () => {
      const tagData: FolksonomyTag = {
        k: "test-key",
        v: "test-value",
        product: "12345",
        comment: "Test comment",
        owner: "test-owner",
        version: 1,
      };
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const error = await client.putTag(tagData);
      expect(error).toBeDefined();
    });

    it("should get product tags successfully", async () => {
      const data = [{ k: "test-key", v: "test-value", product: "12345" }];
      fetchMock.mockResolvedValue(mockResponse(data));

      const result = await client.getProductTags("12345");
      expect(result).toBeDefined();
    });

    it("should handle error when getting product tags", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const result = await client.getProductTags("12345");
      expect(result.response.status).toBe(500);
      expect(result.response.ok).toBe(false);
    });

    it("should add tag successfully", async () => {
      const tagData: FolksonomyTag = {
        k: "test-key",
        v: "test-value",
        product: "12345",
        comment: "Test comment",
        owner: "test-owner",
        version: 1,
      };
      fetchMock.mockResolvedValue(mockResponse("ok", true, 200));

      const error = await client.addTag(tagData);
      expect(error).toBeUndefined();
    });

    it("should handle error when adding tag", async () => {
      const tagData: FolksonomyTag = {
        k: "test-key",
        v: "test-value",
        product: "12345",
        comment: "Test comment",
        owner: "test-owner",
        version: 1,
      };
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const error = await client.addTag(tagData);
      expect(error).toBeDefined();
    });

    it("should remove tag successfully", async () => {
      const tagData: FolksonomyTag & { version: number } = {
        k: "test-key",
        v: "test-value",
        product: "12345",
        version: 1,
        comment: "Test comment",
        owner: "test-owner",
      };
      fetchMock.mockResolvedValue(mockResponse("ok", true, 200));

      const error = await client.removeTag(tagData);
      expect(error).toBeUndefined();
    });

    it("should handle error when removing tag", async () => {
      const tagData: FolksonomyTag & { version: number } = {
        k: "test-key",
        v: "test-value",
        product: "12345",
        version: 1,
        comment: "Test comment",
        owner: "test-owner",
      };
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const error = await client.removeTag(tagData);
      expect(error).toBeDefined();
    });
  });

  describe("Authentication", () => {
    it("should login successfully", async () => {
      const responseData = { access_token: "test-token", token_type: "Bearer" };
      fetchMock.mockResolvedValue(mockResponse(responseData));

      const { data, error } = await client.login("test-user", "test-password");

      expect(error).toBeUndefined();
      expect(data).toEqual(responseData);
    });

    it("should handle error when logging in", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 401));

      const { data, error } = await client.login("test-user", "test-password");
      expect(data).toBeUndefined();
      expect(error).toBeDefined();
    });
  });

  describe("Auth Token Validation", () => {
    it("should throw an error if auth token is missing and calling putTag", async () => {
      const clientWithoutToken = new Folksonomy(fetchMock);
      await expect(() =>
        clientWithoutToken.putTag({
          k: "key",
          v: "value",
          product: "12345",
          owner: "",
          comment: "Test comment",
          version: 1,
        }),
      ).rejects.toThrow("Auth token is required to perform this action");
    });

    it("should throw an error if auth token is missing and calling removeTag", async () => {
      const clientWithoutToken = new Folksonomy(fetchMock);
      const tagData: FolksonomyTag = {
        k: "test-key",
        v: "test-value",
        product: "12345",
        version: 1,
        comment: "Test comment",
        owner: "",
      };
      await expect(() => clientWithoutToken.removeTag(tagData)).rejects.toThrow(
        "Auth token is required to perform this action",
      );
    });
  });
});
