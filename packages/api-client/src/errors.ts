import type { ApiProblem } from "@workforce-erp/contracts";

type LaravelValidationPayload = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function normalizeApiProblem(response: Response, payload: unknown): ApiProblem {
  if (payload && typeof payload === "object") {
    const value = payload as Partial<ApiProblem> & LaravelValidationPayload;
    const problem: ApiProblem = {
      title: value.title ?? value.message ?? (response.statusText || "Request failed"),
      status: value.status ?? response.status,
    };
    if (value.type !== undefined) problem.type = value.type;
    if (value.detail !== undefined) problem.detail = value.detail;
    if (value.instance !== undefined) problem.instance = value.instance;
    if (value.code !== undefined) problem.code = value.code;
    if (value.correlationId !== undefined) problem.correlationId = value.correlationId;
    if (value.errors !== undefined) problem.errors = value.errors;
    return problem;
  }

  const problem: ApiProblem = {
    title: response.statusText || "Request failed",
    status: response.status,
  };
  if (typeof payload === "string" && payload) problem.detail = payload;
  return problem;
}

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ApiProblem;

  constructor(response: Response, problem: ApiProblem) {
    super(problem.detail ?? problem.title);
    this.name = "ApiError";
    this.status = response.status;
    this.problem = problem;
  }

  get validationErrors(): Record<string, string[]> | undefined {
    return this.problem.errors;
  }
}
