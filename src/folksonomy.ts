import openapiFetchCreateClient from "openapi-fetch";
import { unwrapCjsDefault } from "./interop-workaround.js";

import type { paths, components, operations } from "./schemas/folksonomy.js";
import { DEFAULT_FOLKSONOMY_API_URL, USER_AGENT } from "./consts.js";
import type { FetchFn } from "./types.js";

// https://github.com/rolldown/tsdown/issues/1054
const createClient = unwrapCjsDefault(openapiFetchCreateClient);

export type FolksonomyTag = components["schemas"]["ProductTag"];
export type FolksonomyKey = {
  k: string;
  count: number;
  values: number;
};

export class Folksonomy {
  private readonly fetch: FetchFn;
  private readonly baseUrl: string;
  private authToken?: string;

  readonly client: ReturnType<typeof createClient<paths>>;

  constructor(
    fetch: FetchFn,
    options?: { baseUrl?: string; authToken?: string | null },
  ) {
    this.baseUrl = options?.baseUrl ?? DEFAULT_FOLKSONOMY_API_URL;
    this.authToken = options?.authToken;

    if (options?.authToken === null) {
      throw new Error("authToken cannot be null");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
    };
    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    this.fetch = fetch;
    this.client = createClient({
      baseUrl: this.baseUrl,
      fetch,
      headers,
    });
  }

  private validateAuthToken(message?: string): void {
    if (!this.authToken) {
      throw new Error(
        message || "Auth token is required to perform this action",
      );
    }
  }

  /**
   * Get the list of keys with statistics
   *
   * The keys list can be restricted to private tags from some owner.
   */
  async getKeys() {
    return this.client.GET("/keys");
  }

  /**
   * Get the list of products that have a `key` or `key=value` if `value` is provided
   */
  async getProducts(key: string, value?: string) {
    const queryParams = value ? { k: key, v: value } : { k: key };
    return this.client.GET("/products", {
      params: { query: queryParams },
    });
  }

  /**
   * Update a product tag, returns error if the tag does not exist
   *
   * @param tag Tag to update with the following fields:
   * - `k`: key
   * - `v`: value
   * - `product`: barcode
   * - `version`: version of the tag (must be equal to previous version + 1)
   * - `owner`: user_id of the owner of the tag (empty for public tags)
   *
   * @returns if the tag was added or updated
   * @example
   * const err = await folksonomy.putTag({ k: "vegan", v: "yes", product: "1234567890123", version: 2 });
   * if (err) console.error("Error updating tag:", err);
   */
  async putTag(tag: FolksonomyTag) {
    this.validateAuthToken();

    const { error } = await this.client.PUT("/product", { body: tag });
    return error;
  }

  /**
   * Get a list of existing tags for a product
   */
  async getProductTags(barcode: string) {
    return this.client.GET("/product/{product}", {
      params: { path: { product: barcode } },
    });
  }

  /**
   * Add a product tag, returns error if the tag already exists
   *
   * @param tag Tag to add or update with the following fields:
   * - `k`: key
   * - `v`: value
   * - `product`: barcode
   * - `version`: if passed it should be equal to 1
   * - `owner`: user_id of the owner of the tag (empty for public tags)
   *
   * @returns if the tag was added or updated
   * @example
   * const err = await folksonomy.addTag({ k: "vegan", v: "yes", product: "1234567890123", version: 1 });
   * if (err) console.error("Error adding tag:", err);
   */
  async addTag(tag: FolksonomyTag) {
    this.validateAuthToken();

    const { error } = await this.client.POST("/product", {
      body: tag,
    });

    return error;
  }

  /**
   * Delete a product tag
   *
   * @param tag Tag to delete with the following fields:
   * - `k`: key
   * - `v`: value
   * - `product`: barcode
   * - `version`: version of the tag [required]
   * - `owner`: user_id of the owner of the tag (empty for public tags)
   *
   * @returns if the tag was deleted
   */
  async removeTag(tag: FolksonomyTag & { version: number }) {
    this.validateAuthToken();

    const { error } = await this.client.DELETE("/product/{product}/{k}", {
      params: {
        path: { product: tag.product, k: tag.k },
        query: { version: tag.version },
      },
    });
    return error;
  }

  /**
   * Authentication: provide user/password and get a bearer token in return
   *
   * @param username Open Food Facts user_id (not email)
   * @param password user password
   * @returns the bearer token, to be used in later requests with usual "Authorization: bearer token" headers
   */
  async login(username: string, password: string) {
    return this.client.POST("/auth", {
      body: { username, password, scope: "email openid" },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }

  async getValues(
    key: string,
    opts?: operations["get_unique_values_values__k__get"]["parameters"]["query"],
  ) {
    return this.client.GET("/values/{k}", {
      params: { path: { k: key }, query: opts },
    });
  }
}
