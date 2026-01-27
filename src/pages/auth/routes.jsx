import SignUp from "./SignUp";
import Login from "./Login";
import Auth from "./Auth";


const AuthRoutes = {
  path: "/auth",
  element: <Auth />,
  children: [
    {
      index: true,
      element: <Login />,
    },
    {
      path: "signup",
      element: <SignUp />,
    },
  ],
};
export default AuthRoutes;
