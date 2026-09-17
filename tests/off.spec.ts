import { Mock } from "vitest";
import OpenFoodFacts, {
  getProductImageUrl,
  getProductIngredientsInLang,
  getProductNameInLang,
} from "../src";

import { TestUtils } from "./utils/test-utils";
import productMockData from "./mockdata/product-7622210288257.json";
import productV3MockData from "./mockdata/product-v3-3154230805984.json";
import { ProductDataType } from "../src/off-v3";
import { formData } from "../src/openapi";

describe("OpenFoodFacts", () => {
  let mockFetch: Mock<typeof global.fetch>;
  let productsApi: OpenFoodFacts;

  // Common test data
  const testBarcode = "7622210288257";
  const testBarcodeV3 = "3154230805984";
  const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });

  // Helper functions
  const mockV2Success = (data: any) =>
    vi.spyOn(productsApi.apiv2.client, "GET").mockResolvedValue({ data });
  const mockV3Success = (data: any) =>
    vi.spyOn(productsApi.apiv3.client, "GET").mockResolvedValue({ data });

  const mockV2Error = (error: Error) =>
    vi.spyOn(productsApi.apiv2.client, "GET").mockRejectedValue(error);

  // Uncomment if needed
  //const mockV3Error = (error: Error) =>
  //  vi.spyOn(productsApi.apiv3.client, "GET").mockRejectedValue(error);

  const mockFetchSuccess = (data: any) =>
    mockFetch.mockResolvedValue(TestUtils.mockResponse(data, true, 200));

  // Uncomment if needed
  //const mockFetchError = (error: Error) => mockFetch.mockRejectedValue(error);

  beforeEach(() => {
    mockFetch = vi.fn();
    productsApi = new OpenFoodFacts(mockFetch as any, {
      host: "https://world.openfoodfacts.org",
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with default options", () => {
      expect(productsApi).toBeInstanceOf(OpenFoodFacts);
      expect(productsApi.apiv2).toBeDefined();
      expect(productsApi.apiv3).toBeDefined();
    });

    it("should initialize with custom options", () => {
      const customApi = new OpenFoodFacts(mockFetch, {
        country: "france",
      });

      expect(customApi).toBeInstanceOf(OpenFoodFacts);
    });
  });

  describe("individual taxonomy getters", () => {
    const mockTaxoEntry = {
      name: { en: "Test Entry" },
      parents: [],
      children: [],
    };

    beforeEach(() => {
      mockFetch.mockResolvedValue(
        TestUtils.mockResponse(mockTaxoEntry, true, 200),
      );
    });

    it("should fetch a single category by name", async () => {
      const result = await productsApi.getCategory("en:beverages");
      expect(result).toEqual(mockTaxoEntry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("tagtype=categories&tags=en:beverages"),
        expect.objectContaining({}),
      );
    });

    it("should fetch a single label by name", async () => {
      const result = await productsApi.getLabel("en:organic");
      expect(result).toEqual(mockTaxoEntry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("tagtype=labels&tags=en:organic"),
        expect.objectContaining({}),
      );
    });

    it("should fetch a single additive by name", async () => {
      const result = await productsApi.getAdditive("en:e322");
      expect(result).toEqual(mockTaxoEntry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("tagtype=additives&tags=en:e322"),
        expect.objectContaining({}),
      );
    });

    it("should fetch a single allergen by name", async () => {
      const result = await productsApi.getAllergen("en:gluten");
      expect(result).toEqual(mockTaxoEntry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("tagtype=allergens&tags=en:gluten"),
        expect.objectContaining({}),
      );
    });

    it("should fetch a single country by name", async () => {
      const result = await productsApi.getCountry("en:france");
      expect(result).toEqual(mockTaxoEntry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("tagtype=countries&tags=en:france"),
        expect.objectContaining({}),
      );
    });

    it("should fetch a single ingredient by name", async () => {
      const result = await productsApi.getIngredient("en:sugar");
      expect(result).toEqual(mockTaxoEntry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("tagtype=ingredients&tags=en:sugar"),
        expect.objectContaining({}),
      );
    });

    it("should fetch a single packaging entry by name", async () => {
      const result = await productsApi.getPackaging("en:plastic");
      expect(result).toEqual(mockTaxoEntry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("tagtype=packaging&tags=en:plastic"),
        expect.objectContaining({}),
      );
    });

    it("should fetch a single state by name", async () => {
      const result = await productsApi.getState("en:complete");
      expect(result).toEqual(mockTaxoEntry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("tagtype=states&tags=en:complete"),
        expect.objectContaining({}),
      );
    });

    it("should fetch a single store by name", async () => {
      const result = await productsApi.getStore("en:carrefour");
      expect(result).toEqual(mockTaxoEntry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("tagtype=stores&tags=en:carrefour"),
        expect.objectContaining({}),
      );
    });

    it("should fetch a single nutrient by name", async () => {
      const result = await productsApi.getNutrient("en:energy");
      expect(result).toEqual(mockTaxoEntry);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("tagtype=nutrients&tags=en:energy"),
        expect.objectContaining({}),
      );
    });
  });

  describe("getProductAttributes", () => {
    it("should return product attributes for a valid barcode", async () => {
      const mockData = {
        product: {
          attribute_groups_en: [
            {
              id: "nutritional_quality",
              name: "Nutritional quality",
              attributes: [
                {
                  id: "nutriscore",
                  name: "Nutri-Score",
                  grade: "c",
                  title: "Average nutritional quality",
                },
              ],
            },
          ],
        },
      };

      mockV2Success(mockData);

      const result = await productsApi.getProductAttributes(testBarcode);

      expect(result).toBeDefined();
      expect(result).toEqual(mockData.product.attribute_groups_en);
      expect(productsApi.apiv2.client.GET).toHaveBeenCalledWith(
        "/api/v2/product/{code}",
        {
          params: {
            path: { code: testBarcode },
            query: { fields: "product_name,code,attribute_groups_en" },
          },
        },
      );
    });

    it("should return empty array when no attributes found", async () => {
      mockV2Success({ product: null });

      const result = await productsApi.getProductAttributes("invalid");

      expect(result).toEqual([]);
    });
  });

  describe("getProductV3", () => {
    it("should return product details for a valid barcode and fields", async () => {
      const mockData = {
        status: "success",
        product: {
          product_name: "Test Product",
          brands: "Test Brand",
        },
      };

      mockV3Success(mockData);

      const { data, error } = await productsApi.getProductV3(testBarcode, {
        fields: ["product_name", "brands"],
      });

      expect(error).toBeUndefined();
      expect(data).toBeDefined();
      expect(data).toEqual(mockData);
      expect(productsApi.apiv3.client.GET).toHaveBeenCalledWith(
        "/api/v3/product/{code}",
        {
          params: {
            path: { code: testBarcode },
            query: { fields: "product_name,brands" },
          },
        },
      );
    });

    it("should return product details without specific fields", async () => {
      mockV3Success(productV3MockData);

      const { data, error } = await productsApi.getProductV3(testBarcodeV3);

      expect(error).toBeUndefined();

      expect(data).toBeDefined();
      if (!data) return; // type narrowing

      expect(data).toEqual(productV3MockData);
      expect(productsApi.apiv3.client.GET).toHaveBeenCalledWith(
        "/api/v3/product/{code}",
        {
          params: {
            path: { code: testBarcodeV3 },
            query: { fields: undefined },
          },
        },
      );

      expect(data.status).toBe("success");
      if (data.status !== "success") return; // for type narrowing

      expect(data.product).toEqual(productV3MockData.product);
    });
  });

  describe("getProductV2", () => {
    it("should return product details for a valid barcode", async () => {
      const mockData = {
        product: productMockData.product,
      };

      mockV2Success(mockData);

      const { data, error } = await productsApi.getProductV2(testBarcode);

      expect(error).toBeUndefined();
      expect(data).toBeDefined();
      expect(data).toEqual(mockData);

      expect(productsApi.apiv2.client.GET).toHaveBeenCalledWith(
        "/api/v2/product/{code}",
        {
          params: { path: { code: testBarcode } },
        },
      );
    });

    it("should return null when product not found", async () => {
      mockV2Success({ product: null });

      const { data, error } = await productsApi.getProductV2("invalid");

      expect(error).toBeUndefined();
      expect(data).toBeDefined();
      expect(data?.product).toBeNull();
    });
  });

  describe("getProductImages", () => {
    it("should fetch product images successfully", async () => {
      const mockResponse = {
        product: {
          images: {
            front: { rev: "1" },
            ingredients: { rev: "2" },
            nutrition: { rev: "3" },
          },
        },
      };

      mockV2Success(mockResponse);

      const result = await productsApi.getProductImages(testBarcode);

      expect(result).toEqual(["front", "ingredients", "nutrition"]);
      expect(productsApi.apiv2.client.GET).toHaveBeenCalledWith(
        "/api/v2/product/{code}",
        {
          params: {
            query: { fields: "images" },
            path: { code: testBarcode },
          },
        },
      );
    });

    it("should return null when no product found", async () => {
      mockV2Success({ product: null });

      const result = await productsApi.getProductImages("invalid");

      expect(result).toBeNull();
    });

    it("should return null when product has no images", async () => {
      const mockResponse = {
        product: {
          code: testBarcode,
        },
      };

      mockV2Success(mockResponse);

      const result = await productsApi.getProductImages(testBarcode);

      expect(result).toBeNull();
    });
  });

  describe("uploadImage", () => {
    it("should upload image successfully for a valid barcode", async () => {
      const mockResponseData = {
        status: "success",
        image_id: "123",
      };

      mockFetchSuccess(mockResponseData);

      const { data, error } = await productsApi.uploadImage(
        testBarcode,
        mockFile,
        "front",
      );

      expect(mockFetch).toHaveBeenCalled();
      expect(data).toBeDefined();
      expect(error).toBeUndefined();
      expect(data).toEqual(mockResponseData);
    });

    it("should throw error when upload fails", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, false, 500));

      const { data, error } = await productsApi.uploadImage(
        testBarcode,
        mockFile,
        "front",
      );
      expect(error).toBeDefined();
      expect(data).toBeUndefined();
    });
  });

  describe("addOrEditProductV2", () => {
    const baseProductData = {
      code: testBarcode,
      product_name: "Test Product",
      brands: "Test Brand",
      categories: "Test Category",
      quantity: "100g",
      languages_codes: { en: 1 },
      // Required ProductDataSection fields
      created_t: Date.now(),
      creator: "test",
      last_modified_t: Date.now(),
      last_editor: "test",
      editors_tags: [],
      last_checked_t: Date.now(),
      checkers_tags: [],
      states_hierarchy: [],
      // Required Product fields
      knowledge_panels: {},
      _id: testBarcode,
      _keywords: [],
      additives_n: 0,
      ingredients: [],
      additives_tags: [],
      ingredients_text: "",
      image_front_url: "",
      image_front_small_url: "",
      image_ingredients_url: "",
      image_ingredients_small_url: "",
      image_ingredients_thumb_url: "",
      images: {},
      image_nutrition_url: "",
      image_nutrition_small_url: "",
      image_nutrition_thumb_url: "",
      serving_size: "",
      nutriscore_grade: "",
      ecoscore_grade: "",
      nova_group: 1,
      packaging: "",
      manufacturing_places: "",
      brands_tags: [],
      categories_tags: [],
      categories_hierarchy: [],
      stores: "",
      stores_tags: [],
      labels: "",
      labels_tags: [],
      product_type: "",
      origins: "",
      origins_tags: [],
      countries: "",
      countries_tags: [],
      emb_codes: "",
      emb_codes_tags: [],
      nutriments: {},
      source: {
        fields: [],
        id: "",
        images: [],
        import_t: Date.now(),
        manufacturer: "",
        name: "",
        source_licence: "",
        source_licence_url: "",
      },
      link: "",
      lang: "en",
    };

    const testCredentials = { username: "testuser", password: "testpass" };

    it("should add/edit product successfully", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const result = await productsApi.addOrEditProductV2(
        baseProductData,
        testCredentials,
      );

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://world.openfoodfacts.org/cgi/product_jqm2.pl",
        expect.objectContaining({
          method: "POST",
          body: expect.any(FormData),
        }),
      );
    });

    it("should include link and language-specific generic name parameters", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const productWithUrlAndGeneric = {
        ...baseProductData,
        link: "https://example.com/producer-pasta",
        languages_codes: { en: 1, fr: 1 },
        generic_name_en: "Organic Pasta",
        generic_name_fr: "Pâtes Biologiques",
      };

      await productsApi.addOrEditProductV2(
        productWithUrlAndGeneric,
        testCredentials,
      );

      const body = mockFetch.mock.calls[0]?.[1]?.body as FormData;
      expect(body.get("link")).toBe("https://example.com/producer-pasta");
      expect(body.get("generic_name_en")).toBe("Organic Pasta");
      expect(body.get("generic_name_fr")).toBe("Pâtes Biologiques");
    });

    it("should include language-specific parameters even when they are empty and not in languages_codes", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const productWithDeletedLang = {
        ...baseProductData,
        languages_codes: { en: 1 },
        product_name_fr: "",
        ingredients_text_fr: "",
        generic_name_fr: "",
      };

      await productsApi.addOrEditProductV2(
        productWithDeletedLang,
        testCredentials,
      );

      const body = mockFetch.mock.calls[0]?.[1]?.body as FormData;
      expect(body.get("product_name_en")).toBe("Test Product");
      expect(body.get("product_name_fr")).toBe("");
      expect(body.get("ingredients_text_fr")).toBe("");
      expect(body.get("generic_name_fr")).toBe("");
    });

    it("should return false when request fails", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, false, 400));

      const minimalProductData = {
        code: testBarcode,
        product_name: "Test Product",
        languages_codes: {},
      } as any;

      const result = await productsApi.addOrEditProductV2(
        minimalProductData,
        testCredentials,
      );

      expect(result).toBe(false);
    });

    it("should include nutriment parameters when nutrition data is present", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const productWithNutrients = {
        ...baseProductData,
        nutriments: {
          fat_100g: 20,
          sugars_100g: 5,
          salt_100g: 1.2,
          fat_unit: "g",
        },
      };

      await productsApi.addOrEditProductV2(
        productWithNutrients,
        testCredentials,
      );

      const body = mockFetch.mock.calls[0]?.[1]?.body as FormData;
      expect(body.get("nutriment_fat")).toBe("20");
      expect(body.get("nutriment_sugars")).toBe("5");
      expect(body.get("nutriment_salt")).toBe("1.2");
      expect(body.get("nutriment_fat_unit")).toBe("g");
      expect(body.get("nutrition_data_per")).toBe("100g");
      expect(body.get("no_nutrition_data")).toBe("");
    });

    it("should set nutrition_data_per to serving for per-serving values", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const productWithServing = {
        ...baseProductData,
        serving_size: "30g",
        nutriments: {
          fat_serving: 6,
          sugars_serving: 1.5,
        },
      };

      await productsApi.addOrEditProductV2(productWithServing, testCredentials);

      const body = mockFetch.mock.calls[0]?.[1]?.body as FormData;
      expect(body.get("nutriment_fat")).toBe("6");
      expect(body.get("nutriment_sugars")).toBe("1.5");
      expect(body.get("nutrition_data_per")).toBe("serving");
    });

    it("should preserve empty strings for nutriment deletion", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const productWithDeletion = {
        ...baseProductData,
        nutriments: {
          fat_100g: 20,
          sugars_100g: "",
        },
      };

      await productsApi.addOrEditProductV2(
        productWithDeletion,
        testCredentials,
      );

      const body = mockFetch.mock.calls[0]?.[1]?.body as FormData;
      expect(body.get("nutriment_fat")).toBe("20");
      expect(body.get("nutriment_sugars")).toBe("");
    });

    it("should skip nutriment parameters when no_nutrition_data is true", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const productNoNutrition = {
        ...baseProductData,
        no_nutrition_data: true,
        nutriments: {
          fat_100g: 20,
          sugars_100g: 5,
        },
      };

      await productsApi.addOrEditProductV2(productNoNutrition, testCredentials);

      const body = mockFetch.mock.calls[0]?.[1]?.body as FormData;
      expect(body.get("no_nutrition_data")).toBe("on");
      expect(body.get("nutriment_fat")).toBeNull();
      expect(body.get("nutriment_sugars")).toBeNull();
      expect(body.get("nutrition_data_per")).toBeNull();
    });

    it("should include modifier parameters", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const productWithModifier = {
        ...baseProductData,
        nutriments: {
          fat_100g: 20,
          fat_modifier: "<",
        },
      };

      await productsApi.addOrEditProductV2(
        productWithModifier,
        testCredentials,
      );

      const body = mockFetch.mock.calls[0]?.[1]?.body as FormData;
      expect(body.get("nutriment_fat")).toBe("20");
      expect(body.get("nutriment_fat_modifier")).toBe("<");
    });

    it("should skip non-primitive nutriment values", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const productWithInvalidVal = {
        ...baseProductData,
        nutriments: {
          fat_100g: 20,
          sugars_100g: { nested: "object" },
          salt_100g: [1, 2],
        },
      };

      await productsApi.addOrEditProductV2(
        productWithInvalidVal,
        testCredentials,
      );

      const body = mockFetch.mock.calls[0]?.[1]?.body as FormData;
      expect(body.get("nutriment_fat")).toBe("20");
      expect(body.get("nutriment_sugars")).toBeNull();
      expect(body.get("nutriment_salt")).toBeNull();
    });

    it("should handle mixed _100g and _serving inputs deterministically preferring 100g", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const productWithMixed = {
        ...baseProductData,
        nutriments: {
          fat_100g: 20,
          sugars_serving: 5,
        },
      };

      await productsApi.addOrEditProductV2(productWithMixed, testCredentials);

      const body = mockFetch.mock.calls[0]?.[1]?.body as FormData;
      expect(body.get("nutrition_data_per")).toBe("100g");
      expect(body.get("nutriment_fat")).toBe("20");
      // Sugars per serving should be ignored because nutrition_data_per is 100g
      expect(body.get("nutriment_sugars")).toBeNull();
    });

    it("should handle mixed inputs deterministically preferring serving when no 100g keys exist", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const productWithMixedServing = {
        ...baseProductData,
        nutriments: {
          sugars_serving: 5,
        },
      };

      await productsApi.addOrEditProductV2(
        productWithMixedServing,
        testCredentials,
      );

      const body = mockFetch.mock.calls[0]?.[1]?.body as FormData;
      expect(body.get("nutrition_data_per")).toBe("serving");
      expect(body.get("nutriment_sugars")).toBe("5");
    });

    it("should fallback to serving when 100g keys contain only non-serializable data", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const productWithInvalid100g = {
        ...baseProductData,
        nutriments: {
          fat_100g: { invalid: "object" },
          sugars_serving: 5,
        },
      };

      await productsApi.addOrEditProductV2(
        productWithInvalid100g,
        testCredentials,
      );

      const body = mockFetch.mock.calls[0]?.[1]?.body as FormData;
      expect(body.get("nutrition_data_per")).toBe("serving");
      expect(body.get("nutriment_fat")).toBeNull();
      expect(body.get("nutriment_sugars")).toBe("5");
    });
  });

  describe("deleteProduct", () => {
    it("should successfully delete a product", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const result = await productsApi.deleteProduct("123456", "test deletion");

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalled();
      const [url, options] = mockFetch.mock.calls[0] as [string, any];
      expect(url).toBe("https://world.openfoodfacts.org/cgi/product.pl");
      expect(options.method).toBe("POST");
      const formDataBody = options.body as FormData;
      expect(formDataBody.get("type")).toBe("delete");
      expect(formDataBody.get("action")).toBe("process");
      expect(formDataBody.get("code")).toBe("123456");
      expect(formDataBody.get("comment")).toBe("test deletion");
    });

    it("should return false when deletion request fails", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, false, 400));

      const result = await productsApi.deleteProduct("123456", "test deletion");

      expect(result).toBe(false);
    });

    it("should throw an error if the deletion comment is empty or whitespace", async () => {
      await expect(productsApi.deleteProduct("123456", "")).rejects.toThrow(
        "A non-empty deletion comment is required.",
      );
      await expect(productsApi.deleteProduct("123456", "   ")).rejects.toThrow(
        "A non-empty deletion comment is required.",
      );
    });
  });

  const verifyImageMoveRequest = (
    expectedMoveTo: string,
    expectedCopyData: string,
  ) => {
    expect(mockFetch).toHaveBeenCalled();
    const [url, options] = mockFetch.mock.calls[0] as [string, any];
    expect(url).toBe(
      "https://world.openfoodfacts.org/cgi/product_image_move.pl",
    );
    expect(options.method).toBe("POST");
    const formDataBody = options.body as FormData;
    expect(formDataBody.get("code")).toBe("123456");
    expect(formDataBody.get("imgids")).toBe("1,2");
    expect(formDataBody.get("move_to_override")).toBe(expectedMoveTo);
    expect(formDataBody.get("copy_data_override")).toBe(expectedCopyData);
  };

  describe("moveImages", () => {
    it("should successfully move images", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const result = await productsApi.moveImages(
        "123456",
        "1,2",
        "654321",
        true,
      );

      expect("data" in result).toBe(true);
      expect("error" in result).toBe(false);
    });

    it("should successfully move images with default copyData=false", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const result = await productsApi.moveImages("123456", "1,2", "654321");

      expect("data" in result).toBe(true);
      expect("error" in result).toBe(false);
      verifyImageMoveRequest("654321", "false");
    });

    it("should return error when moving images request fails", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, false, 400));

      const result = await productsApi.moveImages("123456", "1,2", "654321");

      expect("error" in result).toBe(true);
      expect("data" in result).toBe(false);
    });
    it("should return error when fetch rejects", async () => {
      mockFetch.mockRejectedValue(new Error("Network failure"));

      const result = await productsApi.moveImages("123456", "1,2", "654321");

      expect("error" in result).toBe(true);
      expect("data" in result).toBe(false);
      expect(result.response).toBeUndefined();
    });

    it("should throw an error if any required parameter is empty or whitespace", async () => {
      await expect(productsApi.moveImages("", "1,2", "654321")).rejects.toThrow(
        "A non-empty source product barcode is required.",
      );
      await expect(
        productsApi.moveImages("123456", "   ", "654321"),
      ).rejects.toThrow("A non-empty list of image IDs is required.");
      await expect(productsApi.moveImages("123456", "1,2", "")).rejects.toThrow(
        "A non-empty destination product barcode is required.",
      );
    });
  });

  describe("deleteImages", () => {
    it("should successfully delete images (move to trash)", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, true, 200));

      const result = await productsApi.deleteImages("123456", "1,2");

      expect("data" in result).toBe(true);
      expect("error" in result).toBe(false);
      verifyImageMoveRequest("trash", "false");
    });

    it("should return error when deleting images request fails", async () => {
      mockFetch.mockResolvedValue(TestUtils.mockResponse({}, false, 400));

      const result = await productsApi.deleteImages("123456", "1,2");

      expect("error" in result).toBe(true);
      expect("data" in result).toBe(false);
    });
    it("should return error when fetch rejects", async () => {
      mockFetch.mockRejectedValue(new Error("Network failure"));

      const result = await productsApi.deleteImages("123456", "1,2");

      expect("error" in result).toBe(true);
      expect("data" in result).toBe(false);
      expect(result.response).toBeUndefined();
    });

    it("should throw an error if any required parameter is empty or whitespace", async () => {
      await expect(productsApi.deleteImages("", "1,2")).rejects.toThrow(
        "A non-empty product barcode is required.",
      );
      await expect(productsApi.deleteImages("123456", "  ")).rejects.toThrow(
        "A non-empty list of image IDs is required.",
      );
    });
  });

  describe("getProductImageUrl", () => {
    const mockSelectedImage = {
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
    };

    const mockRawImage = {
      front: {
        url: "https://example.com/image.jpg",
        sizes: {
          100: { h: 100, w: 100 },
          400: { h: 400, w: 400 },
          full: { h: 800, w: 800 },
        },
        uploaded_t: "1234567890",
        uploader: "test",
      },
    };

    it("should generate correct image URL with selected image", () => {
      const result = getProductImageUrl(
        testBarcode,
        "front",
        mockSelectedImage,
        "400",
      );

      expect(result).toContain("front.1.400.jpg");
      expect(result).toContain("762/221/028/8257");
    });

    it("should generate correct image URL with raw image", () => {
      const result = getProductImageUrl(
        testBarcode,
        "front",
        mockRawImage,
        "400",
      );

      expect(result).toContain("front.400.jpg");
      expect(result).toContain("762/221/028/8257");
    });

    it("should return null when image not found", () => {
      const result = getProductImageUrl(testBarcode, "front", {}, "400");

      expect(result).toBeNull();
    });

    it("should return null when image not found in images object", () => {
      const result = getProductImageUrl(
        testBarcode,
        "nonexistent",
        mockSelectedImage,
        "400",
      );
      expect(result).toBeNull();
    });

    it("should handle different image sizes correctly", () => {
      const result100 = getProductImageUrl(
        testBarcode,
        "front",
        mockSelectedImage,
        "100",
      );
      const result200 = getProductImageUrl(
        testBarcode,
        "front",
        mockSelectedImage,
        "200",
      );
      const resultFull = getProductImageUrl(
        testBarcode,
        "front",
        mockSelectedImage,
        "full",
      );

      expect(result100).toContain("front.1.100.jpg");
      expect(result200).toContain("front.1.200.jpg");
      expect(resultFull).toContain("front.1.full.jpg");
    });

    it("should handle barcode padding correctly", () => {
      const shortBarcode = "123";
      const result = getProductImageUrl(
        shortBarcode,
        "front",
        mockSelectedImage,
        "400",
      );

      // Should pad the barcode to 13 digits: 0000000000123
      expect(result).toContain("000/000/000/0123");
    });
  });

  describe("private helper methods", () => {
    it("should format form data correctly", () => {
      const data = {
        field1: "value1",
        field2: "value2",
      };

      // Access the private method through instance
      const form = formData(data);

      expect(form).toBeInstanceOf(FormData);
    });

    it("should handle getProductNameInLang correctly", () => {
      const product = {
        product_name: "Default Product",
        product_name_fr: "Produit Français",
        product_name_es: "Producto Español",
      } as unknown as ProductDataType;

      expect(getProductNameInLang(product, "fr")).toBe("Produit Français");
      expect(getProductNameInLang(product, "es")).toBe("Producto Español");
      expect(getProductNameInLang(product, "de")).toBe("Default Product"); // fallback
    });

    it("should handle getProductIngredientsInLang correctly", () => {
      const product = {
        ingredients_text: "Default ingredients",
        ingredients_text_fr: "Ingrédients français",
        ingredients_text_es: "Ingredientes españoles",
      } as any;

      // Access private method through instance

      expect(getProductIngredientsInLang(product, "fr")).toBe(
        "Ingrédients français",
      );
      expect(getProductIngredientsInLang(product, "es")).toBe(
        "Ingredientes españoles",
      );
      expect(getProductIngredientsInLang(product, "de")).toBe(
        "Default ingredients",
      ); // fallback
    });
  });

  describe("isTokenExpired edge cases", () => {
    const createDummyToken = (payloadObj: any) => {
      const payloadBase64 = Buffer.from(JSON.stringify(payloadObj)).toString(
        "base64",
      );
      return `dummyHeader.${payloadBase64}.dummySignature`;
    };

    it("should treat a token with exp = 0 as expired", () => {
      const token = createDummyToken({ exp: 0 });
      const isExpired = (productsApi as any).isTokenExpired(token);
      expect(isExpired).toBe(true);
    });

    it("should treat a token with no exp as expired", () => {
      const token = createDummyToken({ userId: 123 });
      const isExpired = (productsApi as any).isTokenExpired(token);
      expect(isExpired).toBe(true);
    });
  });

  describe("error handling and edge cases", () => {
    const testCases = [
      { description: "empty barcode", barcode: "", expected: null },
      {
        description: "very long barcode",
        barcode: "1234567890123456789012345678901234567890",
        expected: { code: "1234567890123456789012345678901234567890" },
      },
      {
        description: "special characters in barcode",
        barcode: "123-456-789",
        expected: { code: "123-456-789" },
      },
    ];

    testCases.forEach(({ description, barcode, expected }) => {
      it(`should handle ${description} gracefully`, async () => {
        const mockResponse = {
          product: expected,
        };

        mockV2Success(mockResponse);

        const { data, error } = await productsApi.getProductV2(barcode);
        expect(error).toBeUndefined();
        expect(data).toEqual(mockResponse);
      });
    });

    it("should handle API timeout", async () => {
      mockV2Error(new Error("Request timeout"));

      await expect(productsApi.getProductV2(testBarcode)).rejects.toThrow(
        "Request timeout",
      );
    });
  });

  describe("getCurrentUserPermissions", () => {
    it("should return user permissions when authenticated", async () => {
      const mockData = {
        status: "success",
        result: { id: "user_found" },
        user: {
          userid: "stephane",
          name: "Stephane Gigandet",
          moderator: 1,
          admin: 1,
        },
      };

      mockFetchSuccess(mockData);

      const result = await productsApi.getCurrentUserPermissions();

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        new URL(
          "/api/v3/current-user/permissions",
          "https://world.openfoodfacts.org",
        ),
        expect.anything(),
      );
    });

    it("should return error when not authenticated (401)", async () => {
      mockFetch.mockResolvedValue(
        TestUtils.mockResponse(
          {
            status: "failure",
            errors: [
              {
                message: { id: "authentication_required" },
                impact: { id: "failure" },
              },
            ],
          },
          false,
          401,
        ),
      );

      const result = await productsApi.getCurrentUserPermissions();

      expect(result.data).toBeUndefined();
      expect(result.error).toBe("HTTP error! status: 401");
    });

    it("should throw on network error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      await expect(productsApi.getCurrentUserPermissions()).rejects.toThrow(
        "Network error",
      );
    });
  });
});
