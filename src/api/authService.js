/* global require, module, process */
import apiClient, { setTokens, clearTokens } from "./apiClient";

// Auth API Calls
export const authService = {
  // Signup - Creates account and sends verification email
  signup: async (userData) => {
    try {
      const response = await apiClient.post("/auth/signup", {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Signup failed";
      const err = new Error(message);
      throw err;
    }
  },

  // Login - Returns access and refresh tokens
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;

      // Store tokens securely (access token in memory, refresh token in sessionStorage)
      setTokens(accessToken, refreshToken);

      return { user, accessToken, refreshToken };
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Login failed";
      const err = new Error(message);
      throw err;
    }
  },

  // Verify Email - Confirm email with verification token
  verifyEmail: async (token) => {
    try {
      const response = await apiClient.post("/auth/verify-email", {
        token,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Email verification failed";
      const err = new Error(message);
      throw err;
    }
  },

  // Forgot Password - Request password reset email
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post("/auth/forgot-password", {
        email,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to send reset email";
      const err = new Error(message);
      throw err;
    }
  },

  // Reset Password - Reset password with token
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to reset password";
      const err = new Error(message);
      throw err;
    }
  },

  // Logout - Invalidate refresh token on server
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Logout error:", error);
      }
    } finally {
      // Clear tokens locally regardless of API response
      clearTokens();
    }
  },

  // Refresh Token - Get new access token (called automatically by interceptor)
  refreshToken: async (refreshToken) => {
    try {
      const response = await apiClient.post("/auth/refresh", {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Token refresh failed";
      const err = new Error(message);
      throw err;
    }
  },
};

export default authService;
