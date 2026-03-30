import apiClient from "./apiClient";

// Task API Calls
export const taskService = {
  // Get all tasks with pagination
  getTasks: async (limit = 10, offset = 0) => {
    try {
      const response = await apiClient.get("/tasks", {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to fetch tasks";
      const err = new Error(message);
      throw err;
    }
  },

  // Get single task by ID
  getTask: async (taskId) => {
    try {
      const response = await apiClient.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to fetch task";
      const err = new Error(message);
      throw err;
    }
  },

  // Create new task
  createTask: async (taskData) => {
    // console.log("Creating task with data:", taskData);
    try {
      const response = await apiClient.post("/tasks", {
        task_name: taskData.taskName,
        description: taskData.description,
        priority: taskData.priority || "Medium",
        status: taskData.status || "To-Do",
        start_datetime: taskData.startDateTime,
        end_datetime: taskData.endDateTime,
        assignee_id: taskData.assigneeId,
        assigned_to_id: taskData.assignedToId,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to create task";
      const err = new Error(message);
      throw err;
    }
  },

  // Update task
  updateTask: async (taskId, taskData) => {
    try {
      const response = await apiClient.put(`/tasks/${taskId}`, {
        task_name: taskData.taskName,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        start_datetime: taskData.startDateTime,
        end_datetime: taskData.endDateTime,
        assignee_id: taskData.assigneeId,
        assigned_to_id: taskData.assignedToId,
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to update task";
      const err = new Error(message);
      throw err;
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to delete task";
      const err = new Error(message);
      throw err;
    }
  },

  // Bulk delete tasks (admin)
  bulkDeleteTasks: async (taskIds) => {
    try {
      const response = await apiClient.post("/tasks/bulk-delete", {
        taskIds,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload file for task
  uploadFile: async (taskId, file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", taskId);

      const response = await apiClient.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || "File upload failed";
      const err = new Error(message);
      throw err;
    }
  },

  // Download file by ID
  downloadFile: async (fileId, fileName) => {
    try {
      const response = await apiClient.get(`/files/${fileId}`, {
        responseType: "blob",
      });
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || "file");
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const message = error.response?.data?.message || error.message || "File download failed";
      const err = new Error(message);
      throw err;
    }
  },
};
