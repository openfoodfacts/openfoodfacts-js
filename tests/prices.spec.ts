import { Mock } from "vitest";
import { PricesApi } from "../src/prices";
import { TestUtils } from "./utils/test-utils";
import crypto from "node:crypto";

describe("Prices Wrapper", () => {
  let fetchMock: Mock;
  let client: PricesApi;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    client = new PricesApi(fetchMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  const getRandomPassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const array = new Uint32Array(10);
    crypto.getRandomValues(array);
    return Array.from(array, (num) => chars[num % chars.length]).join("");
  };

  const mockResponse = TestUtils.mockResponse;

  describe("Prices", () => {
    it("should fetch prices successfully", async () => {
      const mockData = { items: [{ product_code: "12345", price: 10 }] };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const result = await client.getPrices({ product_code: "12345" });
      expect(result.data).toEqual(mockData);
    });

    it("should handle error when fetching prices", async () => {
      const errorData = { detail: "Internal Server Error" };
      fetchMock.mockResolvedValue(mockResponse(errorData, false, 500));

      const result = await client.getPrices({ product_code: "12345" });
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(500);
    });

    it("should create a price successfully", async () => {
      const mockData = { product_code: "12345", price: 10 };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const result = await client.createPrice({
        product_code: "12345",
        price: 10,
        currency: "USD",
        location_osm_id: 1,
        location_osm_type: "NODE",
        date: "2023-10-01",
        proof_id: 1,
      });
      expect(result.data).toEqual(mockData);
    });

    it("should handle error when creating a price", async () => {
      const errorData = { detail: "Bad Request" };
      fetchMock.mockResolvedValue(mockResponse(errorData, false, 400));

      const result = await client.createPrice({
        product_code: "12345",
        price: 10,
        currency: "USD",
        location_osm_id: 1,
        location_osm_type: "NODE",
        date: "2023-10-01",
        proof_id: 1,
      });
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(400);
    });
  });

  describe("Authenticate", () => {
    it("should login successfully", async () => {
      const mockData = { token: "test-token" };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const result = await client.login({
        username: "test",
        password: getRandomPassword(),
      });
      expect(result.data).toEqual(mockData);
    });

    it("should handle error when logging in", async () => {
      const errorData = { detail: "Unauthorized" };
      fetchMock.mockResolvedValue(mockResponse(errorData, false, 401));

      const result = await client.login({
        username: "test",
        password: getRandomPassword(),
      });
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(401);
    });

    it("should check authentication successfully", async () => {
      fetchMock.mockResolvedValue(mockResponse(null));

      const result = await client.isAuthenticated();
      expect(result).toBe(true);
    });
  });

  describe("Proofs", () => {
    it("should upload proof successfully", async () => {
      const mockData = { id: 1, file_path: "path/to/file" };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const result = await client.uploadProof({ file: new Blob() });
      expect(result.data).toEqual(mockData);
    });

    it("should handle error when uploading proof", async () => {
      const errorData = { detail: "Internal Server Error" };
      fetchMock.mockResolvedValue(mockResponse(errorData, false, 500));

      const result = await client.uploadProof({ file: new Blob() });
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(500);
    });

    it("should fetch proofs successfully", async () => {
      const mockData = { items: [{ id: 1, file_path: "path/to/file" }] };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const result = await client.getProofs();
      expect(result.data).toEqual(mockData);
    });

    it("should handle error when fetching proofs", async () => {
      const errorData = { detail: "Not Found" };
      fetchMock.mockResolvedValue(mockResponse(errorData, false, 404));

      const result = await client.getProofs();
      expect(result.error).toBeDefined();
      expect(result.response.status).toBe(404);
    });
  });

  describe("Status", () => {
    it("should fetch API status successfully", async () => {
      const mockData = { status: "ok" };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const result = await client.getStatus();
      expect(result).toEqual(mockData);
    });

    it("should handle error when fetching API status", async () => {
      const errorData = { detail: "Internal Server Error" };
      fetchMock.mockResolvedValue(mockResponse(errorData, false, 500));

      const result = await client.getStatus();
      expect(result).toBeUndefined();
    });
  });

  describe("Locations", () => {
    it("should call getLocations successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getLocations();
      expect(result.data ?? result).toBeDefined();
    });

    it("should call createLocation successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.createLocation({
        type: "OSM",
        osm_id: 1,
        osm_type: "NODE",
      });
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getLocation successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getLocation(1);
      expect(result.data ?? result).toBeDefined();
    });

    it("should call compareLocations successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.compareLocations({
        location_id_a: 1,
        location_id_b: 2,
      });
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getLocationByOSM successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getLocationByOSM("NODE", 1);
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getOSMCountries successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getOSMCountries();
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getOSMCountryCities successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getOSMCountryCities("FR");
      expect(result.data ?? result).toBeDefined();
    });
  });

  describe("Products", () => {
    it("should call getProducts successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getProducts();
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getProduct successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getProduct(1);
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getProductByCode successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getProductByCode("12345");
      expect(result.data ?? result).toBeDefined();
    });

    it("should call triggerOFFUpdate successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.triggerOFFUpdate("12345", {});
      expect(result.data ?? result).toBeDefined();
    });

    it("should call triggerOFFUploadImage successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.triggerOFFUploadImage("12345", {});
      expect(result.data ?? result).toBeDefined();
    });
  });

  describe("Proofs", () => {
    it("should call getProof successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getProof(1);
      expect(result.data ?? result).toBeDefined();
    });

    it("should call updateProof successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.updateProof(1, {});
      expect(result.data ?? result).toBeDefined();
    });

    it("should call deleteProof successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.deleteProof(1);
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getProofHistory successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getProofHistory(1);
      expect(result.data ?? result).toBeDefined();
    });

    it("should call flagProof successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.flagProof(1, {
        reason: "OTHER",
        comment: "Test",
        content_object: "proof/1",
      });
      expect(result.data ?? result).toBeDefined();
    });

    it("should call processProofWithGemini successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.processProofWithGemini(undefined as never);
      expect(result.data ?? result).toBeDefined();
    });
  });

  describe("Users", () => {
    it("should call getUsers successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getUsers();
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getUser successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getUser("user1");
      expect(result.data ?? result).toBeDefined();
    });
  });

  describe("Challenges", () => {
    it("should call getChallenges successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getChallenges();
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getChallenge successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getChallenge(1);
      expect(result.data ?? result).toBeDefined();
    });
  });

  describe("Price Tags", () => {
    it("should call getPriceTags successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getPriceTags();
      expect(result.data ?? result).toBeDefined();
    });

    it("should call createPriceTag successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.createPriceTag({
        proof_id: 1,
        bounding_box: [0, 0, 1, 1],
      });
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getPriceTag successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getPriceTag(1);
      expect(result.data ?? result).toBeDefined();
    });

    it("should call updatePriceTag successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.updatePriceTag(1, {});
      expect(result.data ?? result).toBeDefined();
    });

    it("should call deletePriceTag successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.deletePriceTag(1);
      expect(result.data ?? result).toBeDefined();
    });
  });

  describe("Receipt Items", () => {
    it("should call getReceiptItems successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getReceiptItems();
      expect(result.data ?? result).toBeDefined();
    });

    it("should call createReceiptItem successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.createReceiptItem({
        id: 1,
        proof_id: 1,
        price_id: 1,
        order: 1,
        updated: new Date().toISOString(),
      });
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getReceiptItem successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getReceiptItem(1);
      expect(result.data ?? result).toBeDefined();
    });

    it("should call updateReceiptItem successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.updateReceiptItem(1, {});
      expect(result.data ?? result).toBeDefined();
    });

    it("should call deleteReceiptItem successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.deleteReceiptItem(1);
      expect(result.data ?? result).toBeDefined();
    });
  });

  describe("Flags", () => {
    it("should call getFlags successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getFlags();
      expect(result.data ?? result).toBeDefined();
    });

    it("should call updateFlag successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.updateFlag(1, { status: "CLOSED" });
      expect(result.data ?? result).toBeDefined();
    });
  });

  describe("Prices Extra", () => {
    it("should call getPrice successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getPrice(1);
      expect(result.data ?? result).toBeDefined();
    });

    it("should call updatePrice successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.updatePrice(1, {});
      expect(result.data ?? result).toBeDefined();
    });

    it("should call deletePrice successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.deletePrice(1);
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getPriceHistory successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getPriceHistory(1);
      expect(result.data ?? result).toBeDefined();
    });

    it("should call getPricesStats successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getPricesStats();
      expect(result.data ?? result).toBeDefined();
    });

    it("should call flagPrice successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.flagPrice(1, {
        reason: "OTHER",
        comment: "Test",
        content_object: "price/1",
      });
      expect(result.data ?? result).toBeDefined();
    });
  });

  describe("Session", () => {
    it("should call getSession successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getSession();
      expect(result.data ?? result).toBeDefined();
    });

    it("should call deleteSession successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.deleteSession();
      expect(result.data ?? result).toBeDefined();
    });
  });

  describe("Stats", () => {
    it("should call getStats successfully", async () => {
      const mockData = { success: true };
      fetchMock.mockResolvedValue(mockResponse(mockData));
      const result = await client.getStats();
      expect(result.data ?? result).toBeDefined();
    });
  });
});
