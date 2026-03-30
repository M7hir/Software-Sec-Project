import { useSelector } from "react-redux";

export const useAuth = () => {
  const user = useSelector((state) => state.auth);
  // Use Redux isLoggedIn flag as the authentication source
  const isAuthenticated = user?.isLoggedIn || false;

  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const role = user?.role ?? "user";
  const isAdmin = role === "admin";

  return { isAuthenticated, firstName, lastName, fullName, role, isAdmin };
};