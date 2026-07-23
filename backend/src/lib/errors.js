export class ApiError extends Error {
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function validationError(code, message, details) {
  return new ApiError(422, code, message, details);
}

export function errorEnvelope(error, requestId) {
  return {
    error: {
      code: error.code || "INTERNAL_ERROR",
      message:
        error.statusCode && error.statusCode < 500
          ? error.message
          : "The service could not complete the request.",
      requestId,
      ...(error.details ? { details: error.details } : {}),
    },
  };
}
