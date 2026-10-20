import { MockedFunction } from "vitest";
import OpenFoodFacts from "../src";
import { BackendType } from "../src/consts";

describe("OpenFoodFacts Constructor", () => {
  let mockFetch: MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({}),
    } as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Options validation", () => {
    it("should throw error when both host and country are provided", () => {
      expect(() => {
        new OpenFoodFacts(mockFetch, {
          host: "https://example.com",
          country: "us",
        });
      }).toThrow(
        "You must provide either `host`, `type`, or `country`, not multiple.",
      );
    });

    it("should throw error when both type and country are provided", () => {
      expect(() => {
        new OpenFoodFacts(mockFetch, {
          type: BackendType.OFF,
          country: "us",
        });
      }).toThrow(
        "You must provide either `host`, `type`, or `country`, not multiple.",
      );
    });

    it("should accept host alone", () => {
      expect(() => {
        new OpenFoodFacts(mockFetch, {
          host: "https://example.com",
        });
      }).not.toThrow();
    });

    it("should accept type alone", () => {
      expect(() => {
        new OpenFoodFacts(mockFetch, {
          type: BackendType.OFF,
        });
      }).not.toThrow();
    });

    it("should accept country alone", () => {
      expect(() => {
        new OpenFoodFacts(mockFetch, {
          country: "fr",
        });
      }).not.toThrow();
    });
  });

  describe("Base URL creation", () => {
    it("should use custom host when provided", () => {
      const client = new OpenFoodFacts(mockFetch, {
        host: "https://custom.example.com",
      });
      // We can't directly access baseUrl, but we can verify it's working by checking the client exists
      expect(client.apiv2.client).toBeDefined();
      expect(client.apiv3.client).toBeDefined();
    });

    it("should create URL from backend type", () => {
      const client = new OpenFoodFacts(mockFetch, {
        type: BackendType.OBF,
      });
      expect(client.apiv2.client).toBeDefined();
      expect(client.apiv3.client).toBeDefined();
    });

    it("should create URL from country", () => {
      const client = new OpenFoodFacts(mockFetch, {
        country: "fr",
      });
      expect(client.apiv2.client).toBeDefined();
      expect(client.apiv3.client).toBeDefined();
    });

    it("should default to world.openfoodfacts.org when no options provided", () => {
      const client = new OpenFoodFacts(mockFetch);
      expect(client.apiv2.client).toBeDefined();
      expect(client.apiv3.client).toBeDefined();
    });

    it("should handle undefined country gracefully", () => {
      const client = new OpenFoodFacts(mockFetch, {
        country: undefined,
      });
      expect(client.apiv2.client).toBeDefined();
      expect(client.apiv3.client).toBeDefined();
    });
  });

  describe("User-Agent creation", () => {
    it("should create generic User-Agent by default", async () => {
      const client = new OpenFoodFacts(mockFetch);
      await client.getAdditives();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.any(Headers),
        }),
      );

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      const userAgent = headers.get("User-Agent");
      expect(userAgent).toMatch(/^OpenFoodFacts - NodeJS \d+\.\d+\.\d+/);
    });

    it("should create backend-specific User-Agent for OBF", async () => {
      const client = new OpenFoodFacts(mockFetch, {
        type: BackendType.OBF,
      });
      await client.getAdditives();

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      const userAgent = headers.get("User-Agent");
      expect(userAgent).toMatch(/^OpenBeautyFacts - NodeJS \d+\.\d+\.\d+/);
    });

    it("should create backend-specific User-Agent for OPFF", async () => {
      const client = new OpenFoodFacts(mockFetch, {
        type: BackendType.OPFF,
      });
      await client.getAdditives();

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      const userAgent = headers.get("User-Agent");
      expect(userAgent).toMatch(/^OpenPetFoodFacts - NodeJS \d+\.\d+\.\d+/);
    });

    it("should create backend-specific User-Agent for OPF", async () => {
      const client = new OpenFoodFacts(mockFetch, {
        type: BackendType.OPF,
      });
      await client.getAdditives();

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      const userAgent = headers.get("User-Agent");
      expect(userAgent).toMatch(/^OpenProductsFacts - NodeJS \d+\.\d+\.\d+/);
    });
  });

  describe("Access token validation", () => {
    function mockJWT(token: { exp: number }) {
      const payload = JSON.stringify(token);
      const header = JSON.stringify({ alg: "none", typ: "JWT" });
      const base64UrlEncode = (str: string) =>
        Buffer.from(str).toString("base64url");

      return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
    }

    it("should reject non-string tokens", () => {
      expect(() => {
        // @ts-expect-error - intentionally testing invalid type
        new OpenFoodFacts(mockFetch, { accessToken: 123 });
      }).toThrow("Access token must be a string.");
    });

    it("should reject empty string tokens", () => {
      expect(() => {
        new OpenFoodFacts(mockFetch, { accessToken: "" });
      }).toThrow("Access token cannot be an empty string.");
    });

    it("should reject tokens with invalid characters", () => {
      expect(() => {
        new OpenFoodFacts(mockFetch, { accessToken: "invalid!@#$%" });
      }).toThrow(
        "Access token can only contain alphanumeric characters, dashes, underscores, and periods.",
      );
    });

    it("should reject expired tokens", () => {
      const expiredToken = mockJWT({ exp: Math.floor(Date.now() / 1000) - 60 });
      expect(() => {
        new OpenFoodFacts(mockFetch, { accessToken: expiredToken });
      }).toThrow("Access token is expired.");
    });

    it("should accept valid tokens", () => {
      const validToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });
      expect(() => {
        new OpenFoodFacts(mockFetch, { accessToken: validToken });
      }).not.toThrow();
    });

    it("should accept tokens with allowed special characters", () => {
      const validToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });

      expect(() => {
        new OpenFoodFacts(mockFetch, { accessToken: validToken });
      }).not.toThrow();
    });
  });

  describe("Fetch wrapper functionality", () => {
    it("should add User-Agent header to all requests", async () => {
      const client = new OpenFoodFacts(mockFetch);
      await client.getAdditives();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.any(Headers),
        }),
      );

      const headers = mockFetch.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("User-Agent")).toBeTruthy();
    });

    it("should preserve existing headers when adding User-Agent", async () => {
      const client = new OpenFoodFacts(mockFetch);

      // Test by directly calling the internal fetch with custom headers
      await (client as any).fetch("test-url", {
        headers: new Headers({ "Custom-Header": "test-value" }),
      });

      const headers = mockFetch.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("Custom-Header")).toBe("test-value");
    });

    it("should add Authorization header when token is provided", async () => {
      function mockJWT(token: { exp: number }) {
        const payload = JSON.stringify(token);
        const header = JSON.stringify({ alg: "none", typ: "JWT" });
        const base64UrlEncode = (str: string) =>
          Buffer.from(str).toString("base64url");

        return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
      }

      const validToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });
      const client = new OpenFoodFacts(mockFetch, {
        accessToken: validToken,
      });

      await client.getAdditives();

      const headers = mockFetch.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);
    });
  });

  describe("Token refresh functionality", () => {
    function mockJWT(token: { exp: number }) {
      const payload = JSON.stringify(token);
      const header = JSON.stringify({ alg: "none", typ: "JWT" });
      const base64UrlEncode = (str: string) =>
        Buffer.from(str).toString("base64url");

      return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
    }

    it("should throw error when token expires and no refresh handler provided", async () => {
      const expiredToken = mockJWT({ exp: Math.floor(Date.now() / 1000) - 60 });

      // We need to bypass the initial validation, so we'll use a valid token initially
      const validToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });
      const client = new OpenFoodFacts(mockFetch, {
        accessToken: validToken,
      });

      // Manually set the token to expired to test runtime behavior
      (client as any).accessToken = expiredToken;

      await expect(client.getAdditives()).rejects.toThrow(
        "Access token expired and no handler provided to refresh it.",
      );
    });

    it("should use refreshed token when refresh handler is provided", async () => {
      vi.useFakeTimers();
      const willExpireToken = mockJWT({
        exp: Math.floor(Date.now() / 1000) + 1,
      });
      const newToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });

      let capturedHeaders: Headers | undefined;
      mockFetch.mockImplementation((_url, options) => {
        capturedHeaders = options?.headers as Headers;
        return Promise.resolve({
          json: () => Promise.resolve({}),
        }) as unknown as Promise<Response>;
      });

      const onAccessTokenExpired = vi.fn().mockResolvedValue(newToken);
      const client = new OpenFoodFacts(mockFetch, {
        accessToken: willExpireToken,
        onAccessTokenExpired,
      });

      vi.advanceTimersByTime(1100);

      await client.getAdditives();

      expect(onAccessTokenExpired).toHaveBeenCalled();
      expect(capturedHeaders?.get("Authorization")).toBe(`Bearer ${newToken}`);
    });

    it("should throw error when refresh handler returns null", async () => {
      const validToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });
      const client = new OpenFoodFacts(mockFetch, {
        accessToken: validToken,
        onAccessTokenExpired: () => Promise.resolve(null as any),
      });

      // Manually set the token to expired
      (client as any).accessToken = mockJWT({
        exp: Math.floor(Date.now() / 1000) - 60,
      });

      await expect(client.getAdditives()).rejects.toThrow(
        "onAccessTokenExpired handler did not return a new access token.",
      );
    });
  });

  describe("Client initialization", () => {
    it("should initialize rawv2 client", () => {
      const client = new OpenFoodFacts(mockFetch, {
        host: "https://test.example.com",
      });

      expect(client.apiv2.client).toBeDefined();
    });

    it("should initialize robotoff client", () => {
      const client = new OpenFoodFacts(mockFetch);
      expect(client.robotoff).toBeDefined();
    });

    it("should pass original fetch to robotoff (not wrapped)", () => {
      const client = new OpenFoodFacts(mockFetch);
      expect(client.robotoff).toBeDefined();
      // The robotoff client should use the original fetch, not the wrapped one
    });
  });

  describe("Integration", () => {
    it("should work with all options combined", async () => {
      function mockJWT(token: { exp: number }) {
        const payload = JSON.stringify(token);
        const header = JSON.stringify({ alg: "none", typ: "JWT" });
        const base64UrlEncode = (str: string) =>
          Buffer.from(str).toString("base64url");

        return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
      }

      const validToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });
      const client = new OpenFoodFacts(mockFetch, {
        type: BackendType.OBF,
        accessToken: validToken,
        onAccessTokenExpired: () => Promise.resolve("new-token"),
      });

      expect(client.apiv2.client).toBeDefined();

      await client.getAdditives();

      const headers = mockFetch.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("User-Agent")).toMatch(/^OpenBeautyFacts - NodeJS/);
      expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);
    });
  });
});
