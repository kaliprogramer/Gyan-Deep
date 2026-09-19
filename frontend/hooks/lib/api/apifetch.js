const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

/**
 * Fetch an authenticated API endpoint.
 *
 * If access_token is expired:
 * 1. Refresh the access token
 * 2. Retry the original request once
 */
export async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
  });

  // Access token is expired/invalid
  if (response.status === 401) {
    const refreshResponse = await fetch(`${API_URL}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
    });

    // Refresh token is also expired/invalid
    if (!refreshResponse.ok) {
      throw new Error("Session expired. Please login again.");
    }

    // Access token cookie has now been replaced.
    // Retry the original request.
    const retryResponse = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
    });

    const retryData = await retryResponse.json();

    if (!retryResponse.ok) {
      throw new Error(
        retryData.detail ||
          retryData.message ||
          "Request failed"
      );
    }

    return retryData;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        data.message ||
        "Request failed"
    );
  }

  return data;
}