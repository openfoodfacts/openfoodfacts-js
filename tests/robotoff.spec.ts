import { Mock } from "vitest";
import { LogoAnnotation, Robotoff } from "../src";
import { TestUtils } from "./utils/test-utils";
describe("Robotoff", () => {
  let fetchMock: Mock;
  let robotoff: Robotoff;
  let testLogoId = 12345;
  const mockResponse = TestUtils.mockResponse;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as any;
    robotoff = new Robotoff(fetchMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
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

  it("loads a logo", async () => {
    const mockData = { logo: { id: testLogoId, type: "brand" } };
    fetchMock.mockResolvedValue(mockResponse(mockData));

    const res = await robotoff.loadLogo(testLogoId);

    expect(res).toEqual(mockData);
    expect(fetchMock).toHaveBeenCalled();
    const call = fetchMock.mock.calls[0];
    const url = typeof call[0] === "string" ? call[0] : (call[0] as any).url;
    expect(url).toContain(`/images/logos/${testLogoId}`);
  });
});
