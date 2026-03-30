/* global require, module, process */
import apiClient from "./apiClient";

// User API Calls
export const userService = {
  // Get all users with pagination (admin)
  getUsers: async (limit = 10, offset = 0) => {
    try {
      const response = await apiClient.get("/users", {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create user (admin)
  createUser: async (userData) => {
    try {
      const response = await apiClient.post("/users", {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        role: userData.role || "user",
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile (admin)
  updateUser: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/users/${userId}`, {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete user (admin)
  deleteUser: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default userService;
