import SignUp from "./SignUp";
import Login from "./Login";
import Auth from "./Auth";
import { AuthGuard } from "../../routes/auth-guard";


const AuthRoutes = {
  path: "/auth",
  element: <Auth />,
  children: [
    {
      index: true,
      element: <AuthGuard><Login /></AuthGuard>,
    },
    {
      path: "signup",
      element:<AuthGuard><SignUp /></AuthGuard>,
    },
  ],
};
export default AuthRoutes;
