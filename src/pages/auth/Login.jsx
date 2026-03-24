import { Button, Grid, Typography, Link, Snackbar, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { FormProvider as RHFForm } from "react-hook-form";
import { Field } from "../../Components/Fields";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "./authValidationSchemas";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthBodyWrapper from "./AuthBodyWrapper";
import { useDispatch } from "react-redux";
import { login } from "./authSlice";

const loginDefaultValues = {
  email: "",
  password: "",
};

const DEFAULT_ADMIN = {
  id: "admin-user-id",
  firstName: "System",
  lastName: "Admin",
  email: "admin@heremes.com",
  password: "Admin@123",
  role: "admin",
};

const ensureAdminUser = () => {
  const existingUsers = JSON.parse(localStorage.getItem("userData")) || [];
  const hasAdmin = existingUsers.some((user) => user.role === "admin");

  if (!hasAdmin) {
    localStorage.setItem(
      "userData",
      JSON.stringify([...existingUsers, DEFAULT_ADMIN]),
    );

    const ids = JSON.parse(localStorage.getItem("IDs")) || [];
    if (!ids.includes(DEFAULT_ADMIN.id)) {
      localStorage.setItem("IDs", JSON.stringify([...ids, DEFAULT_ADMIN.id]));
    }
  }
};

function Login() {
  const methods = useForm({
    defaultValues: loginDefaultValues,
    resolver: zodResolver(LoginSchema),
  });
  const dispatch = useDispatch();
  const router = useNavigate();

  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSuccess(false);
    setOpenError(false);
  };
  const onSubmit = (data) => {
    console.log("Submitted data:", data);
    ensureAdminUser();

    const storedUserData = JSON.parse(localStorage.getItem("userData")) || [];
    const validUser = storedUserData.find(
      (user) => user.email === data.email && user.password === data.password,
    );
    console.log("Valid user:", validUser);
    const validId = JSON.parse(localStorage.getItem("IDs"))?.find(
      (id) => id === validUser?.id,
    );
    if (validId) {
      localStorage.setItem("AuthToken", "Authenticated");
      dispatch(
        login({
          firstName: validUser.firstName,
          lastName: validUser.lastName,
          email: validUser.email,
          id: validUser.id,
          role: validUser.role ?? "user",
          isLoggedIn: true,
        }),
      );

      setOpenSuccess(true);
      setTimeout(() => {
        router("/");
      }, 2000);
      return;
    } else {
      setOpenError(true);
      return;
    }
    // localStorage.setItem("AuthToken","Authenticated")
    // router("/");
  };

  return (
    <AuthBodyWrapper title="Login">
      <RHFForm {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} width="100%">
              <Field.TextField name="email" label="Email" fullWidth required />
            </Grid>
            <Grid item xs={12} width="100%">
              <Field.PasswordField
                name="password"
                label="Password"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} width="100%">
              <Button fullWidth variant="contained" type="submit">
                Login
              </Button>
            </Grid>
            <Grid item xs={12} width="100%">
              <Typography>
                Don't have an account?{" "}
                <Link
                  onClick={() => router("signup")}
                  sx={{ cursor: "pointer" }}
                >
                  Sign up
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </RHFForm>
      <Snackbar
        open={openSuccess || openError}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={openError ? "error" : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {openError ? "Invalid credentials!" : "LoggedIn successfully!"}
        </Alert>
      </Snackbar>
    </AuthBodyWrapper>
  );
}

export default Login;
