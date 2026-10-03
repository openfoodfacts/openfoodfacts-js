import { Mock } from "vitest";
import { LogoAnnotation, type LogoDetails, Robotoff } from "../src";
import { TestUtils } from "./utils/test-utils";
describe("Robotoff", () => {
  let fetchMock: Mock;
  let robotoff: Robotoff;
  const testLogoId = 12345;
  const mockResponse = TestUtils.mockResponse;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    robotoff = new Robotoff(fetchMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it.each([12345, "12345"])(
    "loads typed logo details for id %s",
    async (id) => {
      const details = {
        id: testLogoId,
        barcode: "5410041040807",
        annotation_type: "brand",
        annotation_value: "test-brand",
      } satisfies LogoDetails;
      fetchMock.mockResolvedValue(mockResponse(details));

      const result: LogoDetails | undefined = await robotoff.loadLogo(id);

      expect(result).toEqual(details);
      const request = fetchMock.mock.calls[0][0] as Request;
      expect(request.url).toBe(
        `https://robotoff.openfoodfacts.org/api/v1/images/logos/${testLogoId}`,
      );
      expect(request.method).toBe("GET");
    },
  );

  it("returns undefined when a logo is not found", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ detail: "Not found" }, false, 404),
    );
    expect(await robotoff.loadLogo(testLogoId)).toBeUndefined();
  });

  it("loads logos through the configured API proxy path", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ id: testLogoId, barcode: "123" }),
    );
    const client = new Robotoff(fetchMock, {
      apiUrl: "https://api.example.test/proxy/api/v1",
    });
    await client.loadLogo(testLogoId);
    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.url).toBe(
      `https://api.example.test/proxy/api/v1/images/logos/${testLogoId}`,
    );
  });

  it("uses the default API endpoint for empty options", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ id: testLogoId, barcode: "123" }),
    );
    await new Robotoff(fetchMock, {}).loadLogo(testLogoId);
    expect((fetchMock.mock.calls[0][0] as Request).url).toBe(
      `https://robotoff.openfoodfacts.org/api/v1/images/logos/${testLogoId}`,
    );
  });

  it("resolves the API path from a configured service root", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ id: testLogoId, barcode: "123" }),
    );
    await new Robotoff(fetchMock, {
      baseUrl: "https://robot.example.test",
    }).loadLogo(testLogoId);
    expect((fetchMock.mock.calls[0][0] as Request).url).toBe(
      `https://robot.example.test/api/v1/images/logos/${testLogoId}`,
    );
  });

  it("propagates logo transport errors", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    await expect(robotoff.loadLogo(testLogoId)).rejects.toThrow("offline");
  });
  it("searches logo crops", async () => {
    const mockData = { logos: [{ id: testLogoId }], count: 1 };
    fetchMock.mockResolvedValue(mockResponse(mockData));

    const res = await robotoff.searchLogos({
      barcode: "5410041040807",
      count: 2,
    });
    expect(res.data).toBeDefined();
    expect(res.data?.logos).toBeDefined();
    expect(res.data!.logos.length).toBeGreaterThan(0);
    expect(res.data!.logos[0].id).toBe(testLogoId);
  });
  it("annotates a logo", async () => {
    const annotations: LogoAnnotation[] = [
      {
        logo_id: testLogoId,
        type: "brand",
        value: "test-brand",
      },
    ];

    const mockData = { annotated: 1 };
    fetchMock.mockResolvedValue(mockResponse(mockData));

    const res = await robotoff.annotateLogos(annotations);

    expect(res.data).toBeDefined();
    expect(res.data?.annotated).toBeGreaterThan(0);
  });

  it("gets logo annotations", async () => {
    const mockData = {
      results: [{ logo_id: testLogoId, type: "brand", value: "test-brand" }],
    };
    fetchMock.mockResolvedValue(mockResponse(mockData));

    const res = await robotoff.getLogoAnnotations(testLogoId);

    expect(res.data).toBeDefined();
    expect(Array.isArray(res.data?.results)).toBe(true);
    expect(res.data!.results.length).toBe(1);

    expect(res.data!.results[0]).toEqual({
      logo_id: testLogoId,
      type: "brand",
      value: "test-brand",
    });
  }, 15000);

  it("resets a logo", async () => {
    fetchMock.mockResolvedValue(mockResponse(null, true, 204));

    const res = await robotoff.resetLogo(testLogoId);

    expect(res.error).toBeUndefined();
    expect(res.data).toBeUndefined();
  });
});
