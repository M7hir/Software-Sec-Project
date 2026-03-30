import AuthRoutes from "../pages/auth/routes";
import ProtectedRoute from "./ProtectedRoute";
import { HomePage } from "../pages/home";
import { Navigate } from "react-router-dom";

const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: <Navigate to="/auth" replace />,
  },
  AuthRoutes,
  { path: "*", element: <div>404 - Page Not Found</div> },
];

export default routes;
