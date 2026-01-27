import { Typography } from "@mui/material";
import AuthRoutes from "../pages/auth/routes";

const routes =[
    {
        path: "/",
        element: <Typography>Home Page</Typography>,
    },
    AuthRoutes
]

export default routes;