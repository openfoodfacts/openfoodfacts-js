const notImpl = () => {
  throw new Error("Function not implemented.");
};

export class TestUtils {
  static mockResponse(data: unknown, ok = true, status = 200): Response {
    const mockHeaders = {
      get: (header: string) => {
        const headers: { [key: string]: string } = {
          "Content-Type": "application/json",
        };
        return headers[header];
      },
      append: () => {},
      has: () => true,
      set: () => {},
      delete: () => {},
      forEach: () => {},
      getSetCookie: () => [],
      entries: notImpl,
      keys: notImpl,
      values: notImpl,
      [Symbol.iterator]: notImpl,
    };

    return {
      ok,
      status,
      headers: mockHeaders,
      json: async () => data,
      text: async () => JSON.stringify(data),
      redirected: false,
      statusText: "",
      type: "default",
      url: "",
      body: null,
      bodyUsed: false,
      clone: notImpl,
      arrayBuffer: () => {
        throw new Error("Function not implemented.");
      },
      blob: () => {
        throw new Error("Function not implemented.");
      },
      bytes: () => {
        throw new Error("Function not implemented.");
      },
      formData: () => {
        throw new Error("Function not implemented.");
      },
    };
  }
}
