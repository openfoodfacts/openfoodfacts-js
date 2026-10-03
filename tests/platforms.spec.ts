import { describe, it, expect, vi } from "vitest";
import { OpenFoodFacts } from "../src";

describe("Product type and endpoint configuration", () => {
  it.each(["food", "beauty", "petfood", "product"] as const)(
    "uses %s as the default product type when configured",
    async (productType) => {
      const fetch = vi.fn().mockResolvedValue(new Response("{}"));
      const client = new OpenFoodFacts(fetch, {
        defaults: { productType },
        locale: { language: "fr", country: "ca" },
        endpoints: { products: "https://api.example.test" },
      });

      await client.getProduct("1234567890123");

      const requestUrl = (fetch.mock.calls[0][0] as Request).url;
      expect(requestUrl).toContain("https://api.example.test");
      expect(requestUrl).toContain(`product_type=${productType}`);
      expect(requestUrl).toContain("lc=fr");
      expect(requestUrl).toContain("cc=ca");
    },
  );

  it("lets a product query override configured defaults", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("{}"));
    const client = new OpenFoodFacts(fetch, {
      defaults: { productType: "beauty" },
      locale: { language: "fr", country: "ca" },
    });

    await client.getProduct("1234567890123", {
      product_type: "petfood",
      lc: "de",
      cc: "at",
    });

    const requestUrl = (fetch.mock.calls[0][0] as Request).url;
    expect(requestUrl).toContain("product_type=petfood");
    expect(requestUrl).toContain("lc=de");
    expect(requestUrl).toContain("cc=at");
  });

  it("uses configured image endpoint for client image URLs", () => {
    const client = new OpenFoodFacts(fetch, {
      endpoints: { images: "https://cdn.example.test/products" },
    });
    expect(
      client.getProductImageUrl("1234567890123", "front", {
        front: {
          angle: 0,
          coordinates_image_size: "400x400",
          geometry: "0x0+0+0",
          imgid: "1",
          normalize: null,
          rev: "1",
          sizes: {
            100: { h: 100, w: 100 },
            200: { h: 200, w: 200 },
            400: { h: 400, w: 400 },
            full: { h: 800, w: 800 },
          },
          white_magic: null,
          x1: "0",
          x2: "400",
          y1: "0",
          y2: "400",
        },
      }),
    ).toBe(
      "https://cdn.example.test/products/123/456/789/0123/front.1.400.jpg",
    );
  });
});
