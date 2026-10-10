import { authStore } from "./auth";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  /** Set to false for the login and register calls, which carry no token. */
  auth?: boolean;
};

export async function api<T>(path: string, { method = "GET", body, auth = true }: Options = {}): Promise<T> {
  const token = auth ? authStore.get()?.token : undefined;

  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check that the backend is running.");
  }

  if (response.status === 401 && auth) {
    // The token is missing, expired or invalid: sign out so the app returns to the login page.
    authStore.set(null);
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  if (!response.ok) {
    let detail = "";
    try {
      const problem = (await response.json()) as { detail?: string; title?: string };
      detail = problem.detail ?? problem.title ?? "";
    } catch {
      // Not a JSON error body.
    }
    if (!detail) {
      detail = response.status >= 500 ? "The server ran into a problem. Try again." : "Request failed.";
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong.";
}
