import openapiFetchCreateClient from "openapi-fetch";
import { unwrapCjsDefault } from "./interop-workaround.js";
import { USER_AGENT } from "./consts.js";
import type { KnowledgePanel } from "./knowledgepanels.js";
import type { paths } from "./schemas/facets-kp.js";
import type { FetchFn } from "./types.js";

// https://github.com/rolldown/tsdown/issues/1054
const createClient = unwrapCjsDefault(openapiFetchCreateClient);

export type FacetKnowledgePanelResponse = {
  knowledge_panels: Record<string, KnowledgePanel>;
};

/**
 * Facets Knowledge Panel API
 *
 * @param fetch - The fetch function to use for making requests.
 * @param baseUrl - The base URL for the API. If not provided, it defaults to "https://facets-kp.openfoodfacts.org".
 */
export class FacetsKp {
  readonly fetch: FetchFn;
  readonly baseUrl: string;
  readonly client: ReturnType<typeof createClient<paths>>;

  constructor(fetch: FetchFn, options: { baseUrl?: string } = {}) {
    this.fetch = fetch;
    this.baseUrl = options.baseUrl || "https://facets-kp.openfoodfacts.org";
    this.client = createClient<paths>({
      fetch: this.fetch,
      baseUrl: this.baseUrl,
      headers: {
        "User-Agent": USER_AGENT,
      },
    });
  }

  async getFacetKnowledgePanels(facet: string, value?: string) {
    return this.client.GET("/knowledge_panel", {
      params: { query: { facet_tag: facet, value_tag: value } },
    });
  }
}
