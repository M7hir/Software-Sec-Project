import { useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import routes from "./routes/routes";
import { initializeTokens, restoreAuthState } from "./api/apiClient";
import { login } from "./pages/auth/authSlice";
import { setTasks } from "./pages/home/taskSlice";
import { taskService } from "./api/taskService";

function App() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    // Initialize tokens from sessionStorage on app startup
    initializeTokens();

    // Restore auth state from sessionStorage if available
    const savedAuthState = restoreAuthState();
    if (savedAuthState && savedAuthState.isLoggedIn) {
      dispatch(login(savedAuthState));
    }
  }, [dispatch]);

  // Fetch tasks when user is logged in and Redux auth is restored
  useEffect(() => {
    if (authState?.id && authState?.isLoggedIn) {
      const fetchTasks = async () => {
        try {
          const response = await taskService.getTasks(1000, 0); // Fetch all tasks for user
          const tasks = response?.tasks || [];
          
          // Load all tasks into Redux under current user ID
          dispatch(setTasks({ userId: authState.id, tasks }));
        } catch (error) {
          console.error("Failed to fetch tasks:", error);
          // Continue anyway - tasks just won't show until next manual fetch
        }
      };
      
      fetchTasks();
    }
  }, [authState?.id, authState?.isLoggedIn, dispatch]);

  const element = useRoutes(routes);

  return element;
}

export default App;
