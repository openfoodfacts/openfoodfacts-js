import { describe, expect, it, vi } from "vitest";
import {
  OpenFoodFacts,
  type ImageSelectionData,
  type ProductUpdateParams,
} from "../src";
import { ProductOpenerApiV3 } from "../src/off-v3";
import type { FetchFn } from "../src/types";

const barcode = "1234567890123";
const endpoint = "https://api.example.test/proxy";

function setup(data: unknown = { status: "success" }, status = 200) {
  const fetch = vi.fn<FetchFn>().mockResolvedValue(
    new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  const client = new OpenFoodFacts(fetch, {
    endpoints: { products: endpoint },
    locale: { language: "it", country: "it" },
  });
  const request = () => {
    expect(fetch).toHaveBeenCalledTimes(1);
    const [input, init] = fetch.mock.calls[0];
    return new Request(input, init);
  };
  return { fetch, client, request };
}

describe("v3 product operations", () => {
  it("serializes typed product updates with configured locale and endpoint", async () => {
    const { client, request } = setup();
    const params = {
      fields: "updated",
      product: {
        quantity: "330 ml",
        lang: "it",
        product_type: "beauty",
        categories_tags: ["en:shampoos"],
        labels_tags_add: ["en:organic"],
      },
    } satisfies ProductUpdateParams;

    const result = await client.updateProduct(barcode, params);
    const sent = request();
    expect(sent.url).toBe(`${endpoint}/api/v3/product/${barcode}`);
    expect(sent.method).toBe("PATCH");
    expect(sent.headers.get("Content-Type")).toContain("application/json");
    expect(await sent.json()).toEqual({ lc: "it", cc: "it", ...params });
    expect(result.data).toEqual({ status: "success" });
    expect(result.error).toBeUndefined();
    expect(result.response.status).toBe(200);
  });

  it("allows explicit locale overrides without applying the read product type", async () => {
    const { client, request } = setup();
    await client.updateProduct(barcode, {
      lc: "fr",
      cc: "ca",
      product: { quantity: "1 l" },
    });
    expect(await request().json()).toEqual({
      lc: "fr",
      cc: "ca",
      product: { quantity: "1 l" },
    });
  });

  it("supports the server's test code for analysis without saving", async () => {
    const { client, request } = setup();
    await client.updateProduct("test", { product: { quantity: "1 l" } });
    expect(request().url).toBe(`${endpoint}/api/v3/product/test`);
  });

  const imageCases: [string, ImageSelectionData][] = [
    ["select", { selected: { front: { it: { imgid: 12 } } } }],
    [
      "crop and rotate",
      {
        selected: {
          ingredients: {
            it: {
              imgid: 12,
              generation: {
                angle: 90,
                coordinates_image_size: "full",
                x1: 10,
                x2: "200",
                y1: "20",
                y2: "300",
                normalize: true,
                white_magic: false,
              },
            },
          },
        },
      },
    ],
    ["unselect", { selected: { nutrition: { it: null } } }],
  ];
  it.each(imageCases)(
    "serializes image %s instructions",
    async (_name, images) => {
      const { client, request } = setup();
      await client.selectAndCropImages(barcode, images);
      const sent = request();
      expect(sent.method).toBe("PATCH");
      expect(sent.url).toBe(`${endpoint}/api/v3/product/${barcode}`);
      expect(await sent.json()).toEqual({
        lc: "it",
        cc: "it",
        fields: "updated",
        product: { images },
      });
    },
  );

  it("preserves HTTP errors rather than returning success data", async () => {
    const error = {
      status: "failure",
      errors: [{ message: { id: "invalid" } }],
    };
    const { client } = setup(error, 400);
    const result = await client.updateProduct(barcode, { product: {} });
    expect(result.error).toEqual(error);
    expect(result.data).toBeUndefined();
    expect(result.response.status).toBe(400);
  });

  it("preserves API failure status even for HTTP 200", async () => {
    const data = { status: "failure", errors: [] };
    const { client } = setup(data);
    expect((await client.updateProduct(barcode, {})).data).toEqual(data);
  });

  it("propagates transport failures", async () => {
    const { fetch, client } = setup();
    fetch.mockRejectedValue(new Error("offline"));
    await expect(client.updateProduct(barcode, {})).rejects.toThrow("offline");
  });

  it("keeps the low-level write body unchanged", async () => {
    const { fetch, request } = setup();
    const api = new ProductOpenerApiV3(fetch, { host: endpoint });
    await api.updateProduct(barcode, { product: { quantity: "1 l" } });
    expect(await request().json()).toEqual({ product: { quantity: "1 l" } });
  });

  it("keeps the low-level image helper working without facade locale defaults", async () => {
    const { fetch, request } = setup();
    const api = new ProductOpenerApiV3(fetch, { host: endpoint });
    const images = imageCases[0][1];
    await api.selectAndCropImagesV3(barcode, images);
    expect(await request().json()).toEqual({
      fields: "updated",
      product: { images },
    });
  });
});

describe("v3 taxonomy operations", () => {
  it("canonicalizes local tags with the configured language", async () => {
    const data = {
      status: "success",
      canonical_tags_list: "en:sugar,en:water",
    };
    const { client, request } = setup(data);
    const result = await client.canonicalizeTaxonomyTags({
      tagtype: "ingredients",
      local_tags_list: "zucchero,acqua",
    });
    const url = new URL(request().url);
    expect(url.pathname).toBe("/proxy/api/v3/taxonomy_canonicalize_tags");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      lc: "it",
      tagtype: "ingredients",
      local_tags_list: "zucchero,acqua",
    });
    expect(result.data).toEqual(data);
  });

  it("returns display tags with an explicit language override", async () => {
    const { client, request } = setup({
      status: "success",
      display_tags: ["sucre"],
    });
    const result = await client.getTaxonomyDisplayTags({
      tagtype: "ingredients",
      canonical_tags_list: "en:sugar",
      lc: "fr",
    });
    const url = new URL(request().url);
    expect(url.pathname).toBe("/proxy/api/v3/taxonomy_display_tags");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      lc: "fr",
      tagtype: "ingredients",
      canonical_tags_list: "en:sugar",
    });
    expect(result.data?.display_tags).toEqual(["sucre"]);
  });

  it("lets canonicalization queries override the configured language", async () => {
    const { client, request } = setup();
    await client.canonicalizeTaxonomyTags({
      tagtype: "ingredients",
      local_tags_list: "sucre",
      lc: "fr",
    });
    expect(new URL(request().url).searchParams.get("lc")).toBe("fr");
  });

  it("applies locale defaults to taxonomy suggestions", async () => {
    const { client, request } = setup();
    await client.getTaxonomySuggestions({
      tagtype: "categories",
      string: "pasta",
    });
    const url = new URL(request().url);
    expect(url.pathname).toBe("/proxy/api/v3/taxonomy_suggestions");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      lc: "it",
      cc: "it",
      tagtype: "categories",
      string: "pasta",
    });
  });

  it("allows taxonomy suggestion locale overrides", async () => {
    const { client, request } = setup();
    await client.getTaxonomySuggestions({
      tagtype: "categories",
      string: "pasta",
      lc: "de",
      cc: "at",
    });
    const url = new URL(request().url);
    expect(url.searchParams.get("lc")).toBe("de");
    expect(url.searchParams.get("cc")).toBe("at");
  });
});

describe("v3 metadata and moderation operations", () => {
  it.each([
    [
      "getExternalSources",
      "/api/v3/external_sources",
      { external_sources: [] },
    ],
    ["getPreferences", "/api/v3/preferences", { preferences: [] }],
    [
      "getAttributeGroups",
      "/api/v3.4/attribute_groups",
      { attribute_groups: [] },
    ],
  ] as const)("routes %s to its v3 endpoint", async (method, path, data) => {
    const { client, request } = setup(data);
    const result = await client[method]();
    expect(request().url).toBe(`${endpoint}${path}`);
    expect(request().method).toBe("GET");
    expect(result.data).toEqual(data);
  });

  it("posts product revision and requested fields for moderator revert", async () => {
    const { client, request } = setup();
    const params = { code: barcode, rev: 3, fields: "updated" };
    const result = await client.revertProduct(params);
    const sent = request();
    expect(sent.url).toBe(`${endpoint}/api/v3/product_revert`);
    expect(sent.method).toBe("POST");
    expect(await sent.json()).toEqual(params);
    expect(result.data).toEqual({ status: "success" });
  });

  it("retains moderator permission errors", async () => {
    const { client } = setup({ status: "failure" }, 403);
    const result = await client.revertProduct({ code: barcode, rev: 3 });
    expect(result.error).toEqual({ status: "failure" });
    expect(result.data).toBeUndefined();
  });
});
