import axios from "axios";
import { store } from "../store/store";
import { logout } from "../pages/auth/authSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Memory storage for tokens (access token remains in memory)
let tokenStore = {
  accessToken: null,
  refreshToken: null,
  csrfToken: null,
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor - Add access token and CSRF token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStore.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for state-changing requests
    if (["post", "put", "delete", "patch"].includes(config.method?.toLowerCase())) {
      if (tokenStore.csrfToken) {
        config.headers["x-csrf-token"] = tokenStore.csrfToken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 token refresh and 403 CSRF errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      const networkError = new Error(
        "Network error: Unable to reach the server. Make sure the backend is running and the frontend proxy is configured."
      );
      return Promise.reject(networkError);
    }

    // If 403 (CSRF token invalid) and not already retried
    if (error.response?.status === 403 && !originalRequest._csrfRetry) {
      originalRequest._csrfRetry = true;
      if (import.meta.env.DEV) {
        console.warn("CSRF token invalid, fetching new token...");
      }

      try {
        await fetchCsrfToken();
        // Retry original request with new CSRF token
        if (tokenStore.csrfToken) {
          originalRequest.headers["x-csrf-token"] = tokenStore.csrfToken;
        }
        return apiClient(originalRequest);
      } catch (csrfError) {
        if (import.meta.env.DEV) {
          console.error("Failed to refresh CSRF token:", csrfError);
        }
        return Promise.reject(csrfError);
      }
    }

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenStore.refreshToken;
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        // Update tokens
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        tokenStore.accessToken = accessToken;
        
        // Only update refresh token if backend provided a new one
        if (newRefreshToken) {
          tokenStore.refreshToken = newRefreshToken;
          sessionStorage.setItem("refreshToken", newRefreshToken);
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        store.dispatch(logout());
        tokenStore.accessToken = null;
        tokenStore.refreshToken = null;
        sessionStorage.removeItem("refreshToken");

        // Redirect to auth entry route
        window.location.href = "/auth";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export helper functions
export const setTokens = (accessToken, refreshToken, userData = null) => {
  tokenStore.accessToken = accessToken;
  tokenStore.refreshToken = refreshToken;
  // Backup refresh token (only this, never access token)
  if (refreshToken) {
    sessionStorage.setItem("refreshToken", refreshToken);
  }
  // Store user data in sessionStorage for persistence across page refreshes
  if (userData) {
    sessionStorage.setItem("authState", JSON.stringify(userData));
  }
};

export const getAccessToken = () => tokenStore.accessToken;
export const getRefreshToken = () => tokenStore.refreshToken;

export const clearTokens = () => {
  tokenStore.accessToken = null;
  tokenStore.refreshToken = null;
  tokenStore.csrfToken = null;
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("authState");
  sessionStorage.removeItem("tasksState");
  sessionStorage.removeItem("csrfToken");
};

// On app start, restore refresh token and user data from sessionStorage
export const initializeTokens = () => {
  const refreshToken = sessionStorage.getItem("refreshToken");
  if (refreshToken) {
    tokenStore.refreshToken = refreshToken;
  }
};

// Restore auth state from sessionStorage and dispatch login action
export const restoreAuthState = () => {
  const authStateStr = sessionStorage.getItem("authState");
  if (authStateStr) {
    try {
      const authState = JSON.parse(authStateStr);
      return authState;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to parse auth state from sessionStorage:", error);
      }
      return null;
    }
  }
  return null;
};

// Fetch CSRF token from backend
export const fetchCsrfToken = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
      withCredentials: true,
    });
    const { csrfToken } = response.data;
    if (csrfToken) {
      tokenStore.csrfToken = csrfToken;
      sessionStorage.setItem("csrfToken", csrfToken);
      return csrfToken;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }
  return null;
};

// Initialize CSRF token from sessionStorage or fetch new one
export const initializeCsrfToken = async () => {
  const storedCsrfToken = sessionStorage.getItem("csrfToken");
  if (storedCsrfToken) {
    tokenStore.csrfToken = storedCsrfToken;
  } else {
    await fetchCsrfToken();
  }
};

export const getCsrfToken = () => tokenStore.csrfToken;

export default apiClient;
