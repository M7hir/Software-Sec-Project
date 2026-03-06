import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

export const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // If the user is logged in, redirect them away from auth pages
  // The 'replace' prop replaces the current entry in the history stack, 
  // preventing them from clicking "back" to reach the login page.
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If not logged in, render the child routes (Login/Signup)
  return children;
};