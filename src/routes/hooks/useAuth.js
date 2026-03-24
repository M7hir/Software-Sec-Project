import { useSelector } from "react-redux";

export const useAuth = () => {
  const user = useSelector((state) => state.auth);
  const isAuthenticated = localStorage.getItem("AuthToken")
    ? localStorage.getItem("AuthToken") === "Authenticated"
    : false;

  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const role = user?.role ?? "user";
  const isAdmin = role === "admin";

  return { isAuthenticated, firstName, lastName, fullName, role, isAdmin };
};