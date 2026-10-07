import openapiFetchCreateClient from "openapi-fetch";
import { unwrapCjsDefault } from "./interop-workaround.js";

import type { operations, paths } from "./schemas/robotoff.js";
import { DEFAULT_ROBOTOFF_API_URL, USER_AGENT } from "./consts.js";
import { formBody } from "./formbody.js";
import type { FetchFn } from "./types.js";

// https://github.com/rolldown/tsdown/issues/1054
const createClient = unwrapCjsDefault(openapiFetchCreateClient);

export type RobotoffInsightQuery =
  paths["/insights"]["get"]["parameters"]["query"];
export type RobotoffInsightResponse =
  paths["/insights"]["get"]["responses"]["200"]["content"]["application/json"];
export type RobotoffAnnotateBody =
  paths["/insights/annotate"]["post"]["requestBody"]["content"]["application/x-www-form-urlencoded"];

export type Question = {
  insight_id: string;
  question: string;
  image_url?: string;
  value?: string;
};

export type QuestionsResponse = {
  status?: "found" | "no_questions";
  questions?: Question[];
};
export type LogoSearchParams =
  paths["/images/logos/search"]["get"]["parameters"]["query"];

export type LogoAnnotation =
  paths["/images/logos/annotate"]["post"]["requestBody"]["content"]["application/json"]["annotations"][number];

export type RobotoffQuestionsQuery =
  operations["getQuestions"]["parameters"]["query"];

export type RobotoffUnansweredQuestionsQuery =
  operations["getUnansweredQuestions"]["parameters"]["query"];

export class Robotoff {
  /** The fetch function used for every request */
  private readonly fetch: FetchFn;

  /** The raw openapi-fetch client is used for every request exposed by the openapi schema */
  private readonly raw: ReturnType<typeof createClient<paths>>;

  /** The base URL for the API */
  private readonly baseUrl: string;

  constructor(
    fetch: FetchFn,
    options: { baseUrl: string } = { baseUrl: DEFAULT_ROBOTOFF_API_URL },
  ) {
    this.fetch = fetch;
    this.baseUrl = new URL("/api/v1", options.baseUrl).toString();
    this.raw = createClient<paths>({
      fetch: this.fetch,
      baseUrl: this.baseUrl,
      headers: {
        "User-Agent": USER_AGENT,
      },
    });
  }

  async annotate(body: RobotoffAnnotateBody) {
    return this.raw.POST("/insights/annotate", {
      body: body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      bodySerializer: formBody,
    });
  }

  questionsByProductCode(
    code: number,
    query?: operations["getQuestionsByBarcode"]["parameters"]["query"],
  ) {
    return this.raw.GET("/questions/{barcode}", {
      params: { path: { barcode: code }, query: query },
    });
  }

  insightDetail(id: string) {
    return this.raw.GET("/insights/detail/{insight_id}", {
      params: { path: { insight_id: id } },
    });
  }

  /**
   * Fetches insights based on the provided query.
   *
   * @param {RobotoffInsightQuery} query - The query object containing parameters for fetching insights.
   * @returns A promise that resolves to the data from the insights endpoint
   *
   */
  insights(query: RobotoffInsightQuery) {
    return this.raw.GET("/insights", { params: { query } });
  }

  /**
   * Fetches the details of a logo by its ID.
   *
   * @param {number} logoId - The ID of the logo to load.
   * @returns A promise that resolves to the data from the logo details endpoint.
   */
  async loadLogo(logoId: number) {
    const result = await this.raw.GET("/images/logos/{logo_id}", {
      params: { path: { logo_id: logoId } },
    });
    return result.data;
  }

  searchLogos(params: LogoSearchParams) {
    return this.raw.GET("/images/logos/search", {
      params: { query: params },
    });
  }

  annotateLogos(annotations: LogoAnnotation[]) {
    return this.raw.POST("/images/logos/annotate", {
      body: { annotations },
    });
  }

  resetLogo(logoId: number) {
    return this.raw.POST("/images/logos/{logo_id}/reset", {
      params: { path: { logo_id: logoId } },
    });
  }

  getLogoAnnotations(logoId?: number, index = 0, count = 25) {
    const paginationParams = { query: { index, count } };

    if (logoId == null) {
      return this.raw.GET("/ann/search", { params: paginationParams });
    }

    return this.raw.GET("/ann/search/{logo_id}", {
      params: {
        ...paginationParams,
        path: { logo_id: logoId },
      },
    });
  }

  questions(
    query?: Omit<RobotoffQuestionsQuery, "page" | "count">,
    /**
     * The page number
     * @default 0
     */
    page = 0,
    /**
     * The page size
     * @default 25
     */
    count = 25,
  ) {
    return this.raw.GET("/questions", {
      params: { query: { ...query, page, count } },
    });
  }

  /**
   * Returns the number of unanswered questions per values.
   * Especially useful for campaigns like the eco-score one
   */
  getQuestionsUnanswered(
    query?: Omit<RobotoffUnansweredQuestionsQuery, "page" | "count">,
    /**
     * The page number
     * @default 0
     */
    page = 0,
    /**
     * The page size
     * @default 25
     */
    count = 25,
  ) {
    return this.raw.GET("/questions/unanswered", {
      params: { query: { ...query, page, count } },
    });
  }

  updateLogo(logoId: number, body: { type: string; value?: string | null }) {
    return this.raw.PUT("/images/logos/{logo_id}", {
      params: { path: { logo_id: logoId } },
      body,
    });
  }

  getUserStatistics(username: string) {
    return this.raw.GET("/users/statistics/{username}", {
      params: { path: { username } },
    });
  }

  getCroppedImageUrl(
    imageUrl: string,
    /**
     * The bounding box of the crop, in the format [y_min, x_min, y_max, x_max]
     */
    boundingBox: [number, number, number, number],
  ) {
    const [y_min, x_min, y_max, x_max] = boundingBox;
    const params = new URLSearchParams({
      image_url: imageUrl,
      y_min: y_min.toString(),
      x_min: x_min.toString(),
      y_max: y_max.toString(),
      x_max: x_max.toString(),
    });
    return `${this.baseUrl}/images/crop?${params.toString()}`;
  }

  /**
   * Get a batch of logo from their ids.
   * @param logoIds The array of logos to fetch.
   */
  fetchLogos(logoIds: string[]) {
    return this.raw.GET("/images/logos", {
      params: { query: { logo_ids: logoIds.join(",") } },
    });
  }
}
