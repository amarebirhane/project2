/**
 * Utility to extract a human-readable error message from backend responses.
 * Specifically handles FastAPI's validation error objects (422) which are
 * often returned as arrays of objects.
 */
export const getErrorMessage = (error: any, fallback: string = "An unexpected error occurred."): string => {
  if (!error) return fallback;

  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    // FastAPI validation errors are often an array of { loc, msg, type }
    return detail
      .map((err: any) => {
        if (typeof err === "string") return err;
        if (err.msg) {
          // If there's a location, try to make it more readable
          if (err.loc && err.loc.length > 1) {
            const field = err.loc[err.loc.length - 1];
            return `${field}: ${err.msg}`;
          }
          return err.msg;
        }
        return JSON.stringify(err);
      })
      .join(". ");
  }

  if (detail && typeof detail === "object") {
    // If it's a single object that isn't null
    return detail.message || detail.msg || JSON.stringify(detail);
  }

  // Handle other Axios error properties
  if (error.message) {
    return error.message;
  }

  return fallback;
};
