import { Mock } from "vitest";
import { NutriPatrol } from "../src";
import { TestUtils } from "./utils/test-utils";

describe("NutriPatrol Wrapper", () => {
  let fetchMock: Mock;
  let client: NutriPatrol;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    client = new NutriPatrol(fetchMock);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  const mockResponse = TestUtils.mockResponse;

  describe("Flags", () => {
    it("should fetch flags successfully", async () => {
      const mockData = { flags: [{ id: 1 }] };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data, error } = await client.getFlags();
      expect(data).toEqual(mockData);
      expect(error).toBeUndefined();
    });

    it("should handle error when fetching flags", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const result = await client.getFlags();
      expect(result.response.status).toBe(500);
      expect(result.error).toBeDefined();
      expect(result.data).toBeUndefined();
    });

    it("should fetch a flag by ID successfully", async () => {
      const mockData = { __data__: { id: 1, name: "Test Flag" } };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data, error } = await client.getFlagById(1);
      expect(data).toEqual(mockData);
      expect(error).toBeUndefined();
    });

    it("should handle error when fetching a flag by ID", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 404));

      const result = await client.getFlagById(1);
      expect(result.data).toBeUndefined();

      expect(result.error).toBeDefined();
      expect(result.response?.status).toBe(404);
    });

    it("should handle error when fetching a flag by a wrong ID", async () => {
      const data = {
        detail: [
          {
            type: "int_parsing",
            loc: ["path", "ticket_id"],
            msg: "Input should be a valid integer, unable to parse string as an integer",
            input: "a",
            url: "https://errors.pydantic.dev/2.9/v/int_parsing",
          },
        ],
      };
      fetchMock.mockResolvedValue(mockResponse(data, false, 422));

      const result = await client.getFlagById("wrong-id" as unknown as number);
      expect(result.response?.status).toBe(422);
      expect(result.error?.detail?.[0].msg).toBe(
        "Input should be a valid integer, unable to parse string as an integer",
      );
    });

    it("should create a flag successfully", async () => {
      const flagData = {
        barcode: "barcode-test",
        type: "product",
        url: "url-test",
        image_id: "1",
        flavor: "off",
        created_at: "2024-10-12T15:49:28.485Z",
        user_id: "1",
        source: "web",
      } as const;

      fetchMock.mockResolvedValue(mockResponse(flagData));

      const { data, error } = await client.createFlag(flagData);
      expect(data).toEqual(flagData);
      expect(error).toBeUndefined();
    });

    it("should handle error when creating a flag", async () => {
      const mockData = {
        detail: [
          {
            type: "enum",
            loc: ["body", "type"],
            msg: "Input should be 'product', 'image' or 'search'",
            input: "producst",
            ctx: {
              expected: "'product', 'image' or 'search'",
            },
            url: "https://errors.pydantic.dev/2.9/v/enum",
          },
        ],
      };
      fetchMock.mockResolvedValue(mockResponse(mockData, false, 422));

      const flagData = {
        barcode: "barcode-test",
        type: "product",
        url: "url-test",
        image_id: "1",
        flavor: "off",
        created_at: "2024-10-12T15:49:28.485Z",
        user_id: "1",
        source: "web",
      } as const;

      const result = await client.createFlag(flagData);
      expect(result.response.status).toBe(422);
      expect(result.error?.detail?.[0].msg).toBe(
        "Input should be 'product', 'image' or 'search'",
      );
    });

    it("should fetch flags by ticket batch successfully", async () => {
      const mockData = {
        ticket_id_to_flags: { "1": [{ id: 1, name: "Test Flag" }] },
      };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data, error } = await client.getFlagsByTicketBatch([1]);
      expect(data).toEqual(mockData);
      expect(error).toBeUndefined();
    });

    it("should handle error when fetching flags by ticket batch", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const result = await client.getFlagsByTicketBatch([1]);
      expect(result.data).toBeUndefined();
      expect(result.response?.status).toBe(500);
    });
  });

  describe("Tickets", () => {
    it("should fetch tickets successfully", async () => {
      const mockData = { tickets: [{ id: 1, status: "open" }] };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data, error } = await client.getTickets({ status: "open" });

      expect(error).toBeUndefined();
      expect(data).toEqual(mockData);
    });

    it("should fetch tickets filtered by barcode", async () => {
      const mockData = {
        tickets: [{ id: 1, status: "open", barcode: "3017620422003" }],
        max_page: 1,
      };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data, error } = await client.getTickets({
        barcode: "3017620422003",
        status: "open",
      });

      expect(error).toBeUndefined();
      expect(data).toEqual(mockData);
      // Verify the barcode was passed in the URL
      const fetchArg = fetchMock.mock.calls[0][0];
      const url = typeof fetchArg === "string" ? fetchArg : fetchArg.url;
      expect(url).toContain("barcode=3017620422003");
    });

    it("should handle error when fetching tickets", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 404));

      const result = await client.getTickets({ status: "open" });
      expect(result.response.status).toBe(404);
    });

    it("should fetch a ticket by ID successfully", async () => {
      const ticketData = {
        id: 1,
        barcode: "barcode-test",
        type: "image",
        url: "url-test",
        status: "open",
        image_id: "2",
        flavor: "off",
        created_at: "2024-03-25T14:33:41.785848",
      } as const;

      fetchMock.mockResolvedValue(mockResponse(ticketData));

      const result = await client.getTicketById(1);
      expect(result.error).toBeUndefined();
      expect(result.data).toEqual(ticketData);
    });

    it("should handle error when fetching a ticket by ID", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const { error, response } = await client.getTicketById(1);
      expect(error).toBeDefined();
      expect(response?.status).toBe(500);
    });

    it("should update a ticket status successfully", async () => {
      const updatedTicketData = {
        id: 1,
        barcode: "barcode-test",
        type: "product",
        url: "url-test",
        status: "open",
        image_id: "1",
        flavor: "off",
      };
      fetchMock.mockResolvedValue(mockResponse(updatedTicketData));

      const { data } = await client.updateTicketStatus(1, "closed");
      expect(data).toEqual(updatedTicketData);
    });

    it("should handle error when updating a ticket status", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 404));

      const { data } = await client.updateTicketStatus(1, "closed");
      expect(data).toBeUndefined();
    });
  });

  describe("Stats", () => {
    it("should fetch stats successfully", async () => {
      const mockData = {
        total_tickets: 100,
        tickets_by_status: { open: 60, closed: 40 },
        tickets_by_flavor: { off: 80, obf: 20 },
        tickets_by_type: { product: 50, image: 50 },
        n_days: 31,
        start_date: "2026-01-23T00:00:00",
        end_date: "2026-02-23T00:00:00",
      };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data, error } = await client.getStats();
      expect(data).toEqual(mockData);
      expect(error).toBeUndefined();
    });

    it("should fetch stats with custom nDays", async () => {
      const mockData = {
        total_tickets: 10,
        tickets_by_status: { open: 7, closed: 3 },
        tickets_by_flavor: { off: 10 },
        tickets_by_type: { image: 10 },
        n_days: 7,
        start_date: "2026-02-16T00:00:00",
        end_date: "2026-02-23T00:00:00",
      };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data, error } = await client.getStats(7);
      expect(data).toEqual(mockData);
      expect(error).toBeUndefined();
    });

    it("should handle error when fetching stats", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const { data, error } = await client.getStats();
      expect(data).toBeUndefined();
      expect(error).toBeDefined();
    });
  });

  describe("API Status", () => {
    it("should return data when API is up", async () => {
      const mockData = { status: "ok" };
      fetchMock.mockResolvedValue(mockResponse(mockData));

      const { data } = await client.getApiStatus();
      expect(data).toEqual(mockData);
    });

    it("should return data == null when API is down", async () => {
      fetchMock.mockResolvedValue(mockResponse(null, false, 500));

      const { data } = await client.getApiStatus();
      expect(data).toBeUndefined();
    });
  });
});
