import AuthRoutes from "../pages/auth/routes";
import ProtectedRoute from "./ProtectedRoute";
import { HomePage } from "../pages/home";

const routes = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  AuthRoutes,
  { path: "*", element: <div>404 - Page Not Found</div> },
];

export default routes;
