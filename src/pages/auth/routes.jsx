import SignUp from "./SignUp";
import Login from "./Login";
import Auth from "./Auth";
import VerifyEmail from "./VerifyEmail";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
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
    {
      path: "verify-email",
      element: <AuthGuard><VerifyEmail /></AuthGuard>,
    },
    {
      path: "forgot-password",
      element: <AuthGuard><ForgotPassword /></AuthGuard>,
    },
    {
      path: "reset-password",
      element: <AuthGuard><ResetPassword /></AuthGuard>,},
  ],
};
export default AuthRoutes;
