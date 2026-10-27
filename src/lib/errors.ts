/** A backend RFC 9457 ProblemDetail, flattened. `code` is the stable machine-readable reason. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}
