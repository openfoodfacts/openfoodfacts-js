import { MockedFunction } from "vitest";
import OpenFoodFacts from "../src";
import { resolveConfig } from "../src";
import {
  Robotoff,
  NutriPatrol,
  SearchApi,
  PricesApi,
  Folksonomy,
  FacetsKp,
} from "../src";

describe("OpenFoodFacts Constructor", () => {
  let mockFetch: MockedFunction<typeof fetch>;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue(new Response("{}"));
  });

  describe("Configuration", () => {
    it("resolves production defaults", () => {
      expect(resolveConfig()).toMatchObject({
        locale: { language: "en", country: "world" },
        defaults: { productType: "all" },
        endpoints: {
          products: "https://world.openfoodfacts.org",
          images: "https://images.openfoodfacts.org/images/products",
        },
      });
    });

    it("applies locale, product type, and endpoint overrides", () => {
      const config = resolveConfig({
        locale: { language: "fr", country: "ca" },
        defaults: { productType: "beauty" },
        endpoints: { products: "https://api.example.test/" },
      });
      expect(config.locale).toEqual({ language: "fr", country: "ca" });
      expect(config.defaults.productType).toBe("beauty");
      expect(config.endpoints.products).toBe("https://api.example.test");
      expect(Object.isFrozen(config)).toBe(true);
      expect(Object.isFrozen(config.endpoints)).toBe(true);
    });

    it("rejects invalid endpoints and empty app names", () => {
      expect(() =>
        resolveConfig({ endpoints: { products: "not a URL" } }),
      ).toThrow(/Invalid URL/);
      expect(() => resolveConfig({ app: { name: " " } })).toThrow(/app.name/);
    });

    it.each(["robotoff", "typo", "toString", "__proto__"])(
      "rejects the unknown endpoint key %s at runtime",
      (name) => {
        const options = {
          endpoints: {
            products: undefined,
            [name]: "https://api.example.test",
          },
        };
        expect(() => resolveConfig(options)).toThrow(/Unknown SDK endpoint/);
      },
    );

    it("continues to skip undefined endpoint overrides", () => {
      const options = { endpoints: { products: undefined, typo: undefined } };
      expect(resolveConfig(options).endpoints).toEqual(
        resolveConfig().endpoints,
      );
    });

    it("continues to reject empty endpoint values", () => {
      expect(() => resolveConfig({ endpoints: { products: "" } })).toThrow(
        /cannot be empty/,
      );
    });

    it.each([
      "https://api.example.test/proxy?token=example",
      "https://api.example.test/proxy#section",
      "https://api.example.test/proxy?token=example#section",
      "https://api.example.test/proxy?",
      "https://api.example.test/proxy#",
      "https://api.example.test/proxy?#",
      "ftp://api.example.test/proxy",
    ])("rejects the invalid endpoint URL %s", (products) => {
      expect(() => resolveConfig({ endpoints: { products } })).toThrow(
        /Invalid URL/,
      );
    });

    it("allows encoded delimiters in endpoint paths", () => {
      const products = "https://api.example.test/proxy%3Ftenant%23section";
      expect(
        resolveConfig({ endpoints: { products } }).endpoints.products,
      ).toBe(products);
    });

    it("rejects unsupported product types at runtime", () => {
      const options = {
        defaults: { productType: "unsupported" },
      } as unknown as Parameters<typeof resolveConfig>[0];
      expect(() => resolveConfig(options)).toThrow(
        /Unsupported default product type/,
      );
    });

    it.each(["http", "https"])(
      "allows %s endpoint path prefixes and trims a trailing slash",
      (protocol) => {
        const products = `${protocol}://api.example.test/proxy/api/`;
        expect(
          resolveConfig({ endpoints: { products } }).endpoints.products,
        ).toBe(`${protocol}://api.example.test/proxy/api`);
      },
    );

    it("uses configured endpoints for product requests", async () => {
      const client = new OpenFoodFacts(mockFetch, {
        endpoints: { products: "https://products.example.test" },
      });
      await client.getProduct("1234567890123");
      expect((mockFetch.mock.calls[0][0] as Request).url).toContain(
        "https://products.example.test",
      );
    });

    it("uses the taxonomy endpoint without the product token", async () => {
      const payload = Buffer.from(
        JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 }),
      ).toString("base64url");
      const header = Buffer.from(JSON.stringify({ alg: "none" })).toString(
        "base64url",
      );
      const token = `${header}.${payload}.`;
      mockFetch.mockImplementation(() => Promise.resolve(new Response("{}")));
      const client = new OpenFoodFacts(mockFetch, {
        accessToken: token,
        endpoints: {
          taxonomies: "https://static.example.test",
        },
      });

      await client.getTaxo("ingredients");
      const taxonomyCall = mockFetch.mock.calls[0];
      const taxonomyUrl =
        taxonomyCall[0] instanceof Request
          ? taxonomyCall[0].url
          : String(taxonomyCall[0]);
      expect(taxonomyUrl).toContain(
        "https://static.example.test/data/taxonomies/ingredients.json",
      );
      expect((taxonomyCall[1]?.headers as Headers).has("Authorization")).toBe(
        false,
      );
    });
  });

  describe("User-Agent creation", () => {
    it("should create generic User-Agent by default", async () => {
      const client = new OpenFoodFacts(mockFetch);
      await client.getProduct("1234567890123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(Request),
        expect.objectContaining({
          headers: expect.any(Headers),
        }),
      );

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      const userAgent = headers.get("User-Agent");
      expect(userAgent).toMatch(/^OpenFoodFacts - NodeJS \d+\.\d+\.\d+/);
    });

    it("should use the configured application identity", async () => {
      const client = new OpenFoodFacts(mockFetch, {
        app: { name: "My App", version: "1.2", contact: "dev@example.test" },
      });
      await client.getProduct("1234567890123");

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1]?.headers as Headers;
      const userAgent = headers.get("User-Agent");
      expect(userAgent).toMatch(/^My App\/1\.2 \(dev@example\.test\) - NodeJS/);
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

      await client.apiv3.client.GET("/api/v3/product/{code}", {
        params: { path: { code: "1234567890123" } },
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer caller-token",
        },
      });

      const headers = mockFetch.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("Content-Type")).toBe("application/json");
      expect(headers.get("Authorization")).toBe("Bearer caller-token");
      expect(headers.get("User-Agent")).toMatch(/^OpenFoodFacts - NodeJS/);
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

      await client.getProduct("1234567890123");

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

    it("authenticates product requests made with a URL input", async () => {
      const token = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });
      const client = new OpenFoodFacts(mockFetch, { accessToken: token });
      await client.getLoginStatus();
      const headers = mockFetch.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe(`Bearer ${token}`);
      expect(mockFetch.mock.calls[0][0]).toBeInstanceOf(URL);
    });

    it("merges Request and init headers when applying product authentication", async () => {
      const token = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });
      const client = new OpenFoodFacts(mockFetch, { accessToken: token });
      const authenticatedFetch = Reflect.get(client, "fetch") as typeof fetch;
      const request = new Request(
        "https://world.openfoodfacts.org/api/v3/product/test",
        {
          headers: { "X-Request": "preserved", "X-Override": "request" },
        },
      );
      await authenticatedFetch(request, {
        headers: { "X-Override": "init", "X-Init": "preserved" },
      });
      const headers = mockFetch.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("X-Request")).toBe("preserved");
      expect(headers.get("X-Init")).toBe("preserved");
      expect(headers.get("X-Override")).toBe("init");
      expect(headers.get("Authorization")).toBe(`Bearer ${token}`);
    });

    it("rejects a request if the configured token is subsequently missing", async () => {
      const token = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });
      const client = new OpenFoodFacts(mockFetch, { accessToken: token });
      Object.defineProperty(client, "accessToken", { value: undefined });
      await expect(client.getProduct("1234567890123")).rejects.toThrow(
        "Access token was first specified and now is null.",
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should throw error when token expires and no refresh handler provided", async () => {
      const expiredToken = mockJWT({ exp: Math.floor(Date.now() / 1000) - 60 });

      // We need to bypass the initial validation, so we'll use a valid token initially
      const validToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });
      const client = new OpenFoodFacts(mockFetch, {
        accessToken: validToken,
      });

      // Manually set the token to expired to test runtime behavior
      Reflect.set(client, "accessToken", expiredToken);

      await expect(client.getProduct("1234567890123")).rejects.toThrow(
        "Access token expired and no handler provided to refresh it.",
      );
    });

    it("should use refreshed token when refresh handler is provided", async () => {
      const willExpireToken = mockJWT({
        exp: Math.floor(Date.now() / 1000) + 1,
      });
      const newToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });

      let capturedHeaders: Headers | undefined;
      mockFetch.mockImplementation((_url, options) => {
        capturedHeaders = options?.headers as Headers;
        return Promise.resolve(new Response("{}"));
      });

      const onAccessTokenExpired = vi.fn().mockResolvedValue(newToken);
      const client = new OpenFoodFacts(mockFetch, {
        accessToken: willExpireToken,
        onAccessTokenExpired,
      });

      // Wait for token to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      await client.getProduct("1234567890123");

      expect(onAccessTokenExpired).toHaveBeenCalled();
      expect(capturedHeaders?.get("Authorization")).toBe(`Bearer ${newToken}`);
    });

    it("should throw error when refresh handler returns null", async () => {
      const validToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });
      const client = new OpenFoodFacts(mockFetch, {
        accessToken: validToken,
        onAccessTokenExpired: () => Promise.resolve(null as unknown as string),
      });

      // Manually set the token to expired
      Reflect.set(
        client,
        "accessToken",
        mockJWT({
          exp: Math.floor(Date.now() / 1000) - 60,
        }),
      );

      await expect(client.getProduct("1234567890123")).rejects.toThrow(
        "onAccessTokenExpired handler did not return a new access token.",
      );
    });
  });

  describe("Client initialization", () => {
    it("exports auxiliary services as independently constructible clients", () => {
      const clients = [
        new Robotoff(mockFetch),
        new NutriPatrol(mockFetch),
        new SearchApi(mockFetch),
        new PricesApi(mockFetch),
        new Folksonomy(mockFetch),
        new FacetsKp(mockFetch, {}),
      ];
      expect(clients.map((client) => client.constructor.name)).toEqual([
        "Robotoff",
        "NutriPatrol",
        "SearchApi",
        "PricesApi",
        "Folksonomy",
        "FacetsKp",
      ]);
      expect(mockFetch).not.toHaveBeenCalled();
    });
    it("should initialize rawv2 client", () => {
      const client = new OpenFoodFacts(mockFetch, {
        endpoints: { products: "https://test.example.com" },
      });

      expect(client.apiv2.client).toBeDefined();
    });

    it("exposes only product service clients", () => {
      const client = new OpenFoodFacts(mockFetch);
      expect(client.apiv3.client).toBeDefined();
      for (const service of [
        "robotoff",
        "nutriPatrol",
        "searchApi",
        "pricesApi",
        "folksonomyApi",
        "facetsKp",
      ]) {
        expect(client).not.toHaveProperty(service);
      }
      expect(Object.keys(resolveConfig().endpoints).sort()).toEqual([
        "images",
        "products",
        "taxonomies",
      ]);
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
        app: { name: "Beauty Client" },
        accessToken: validToken,
        onAccessTokenExpired: () => Promise.resolve("new-token"),
      });

      expect(client.apiv2.client).toBeDefined();

      await client.getProduct("1234567890123");

      const headers = mockFetch.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("User-Agent")).toMatch(/^Beauty Client - NodeJS/);
      expect(headers.get("Authorization")).toBe(`Bearer ${validToken}`);
    });
  });
});
