import OpenFoodFacts from "../src/index";

function mockJWT(token: { exp: number }) {
  const payload = JSON.stringify(token);
  const header = JSON.stringify({ alg: "none", typ: "JWT" });
  const base64UrlEncode = (str: string) =>
    Buffer.from(str).toString("base64url");

  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.`;
}

describe("JWT tokens", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it("should error on numeric jwt", () => {
    expect(() => {
      // @ts-expect-error intentionally pass a numeric token to test runtime validation.
      new OpenFoodFacts(fetch, { accessToken: 1234 });
    }).toThrow("Access token must be a string.");
  });

  it("should error on empty string jwt", () => {
    expect(() => {
      new OpenFoodFacts(fetch, { accessToken: "" });
    }).toThrow("Access token cannot be an empty string.");
  });

  it("should error on invalid characters in jwt", () => {
    expect(() => {
      new OpenFoodFacts(fetch, { accessToken: "invalid token!@#" });
    }).toThrow(
      "Access token can only contain alphanumeric characters, dashes, underscores, and periods.",
    );
  });

  it("should error on expired jwt", () => {
    const expiredToken = mockJWT({ exp: Math.floor(Date.now() / 1000) - 60 });
    expect(() => {
      new OpenFoodFacts(fetch, { accessToken: expiredToken });
    }).toThrow("Access token is expired.");
  });

  it("should not error on valid jwt", () => {
    const validToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });
    expect(() => {
      new OpenFoodFacts(fetch, { accessToken: validToken });
    }).not.toThrow();
  });

  it("should call onAccessTokenExpired", async () => {
    const willExpireToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 2 });
    const newToken = mockJWT({ exp: Math.floor(Date.now() / 1000) + 60 });

    let capturedHeaders: Headers | undefined = undefined;
    const fetch = vi
      .fn()
      .mockImplementation((url: string, options?: { headers?: Headers }) => {
        capturedHeaders = options?.headers;
        return Promise.resolve(new Response("{}"));
      });

    const onAccessTokenExpired = vi.fn().mockResolvedValue(newToken);
    const client = new OpenFoodFacts(fetch, {
      accessToken: willExpireToken,
      onAccessTokenExpired,
    });

    // wait for the token to expire
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await client.getProduct("1234567890123");
    expect(onAccessTokenExpired).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(expect.any(Request), expect.any(Object));
    expect(capturedHeaders).toBeInstanceOf(Headers);
    expect(capturedHeaders!.get("Authorization")).toBe(`Bearer ${newToken}`);
  });
});
