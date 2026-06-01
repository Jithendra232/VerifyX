import { API_BASE_URL } from "../config/api";

export class AuthNotReadyError extends Error {
  constructor() {
    super("Authentication not ready");
    this.name = "AuthNotReadyError";
    this.isAuthNotReady = true;
  }
}

const fetchWithToken = async (path, token, options = {}) => {
  if (!token || typeof token !== "string") {
    throw new AuthNotReadyError();
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
};

export const apiFetchWithToken = async (path, token, options = {}) => {
  const response = await fetchWithToken(path, token, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || "Request failed";

    if (response.status === 401 || response.status === 403) {
      const authError = new Error(message);
      authError.isAuthError = true;
      authError.status = response.status;
      throw authError;
    }

    throw new Error(message);
  }

  return data;
};

export const apiFetch = async (path, getToken, options = {}) => {
  if (!getToken) {
    throw new AuthNotReadyError();
  }

  let token = await getToken();

  if (!token) {
    token = await getToken({ skipCache: true });
  }

  if (!token) {
    throw new AuthNotReadyError();
  }

  try {
    return await apiFetchWithToken(path, token, options);
  } catch (error) {
    if (error.isAuthError && error.status === 401) {
      const refreshedToken = await getToken({ skipCache: true });

      if (refreshedToken) {
        return apiFetchWithToken(path, refreshedToken, options);
      }
    }

    throw error;
  }
};
