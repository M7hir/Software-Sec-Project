import { Button, Grid, Typography, Link, Snackbar, Alert, Box, CircularProgress, Divider } from "@mui/material";
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
import authService from "../../api/authService";
import { setTokens } from "../../api/apiClient";

const loginDefaultValues = {
  email: "",
  password: "",
};

function Login() {
  const methods = useForm({
    defaultValues: loginDefaultValues,
    resolver: zodResolver(LoginSchema),
  });
  const dispatch = useDispatch();
  const router = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCloseSuccess = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSuccess(false);
  };

  const handleCloseError = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenError(false);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage("");
    setOpenSuccess(false);
    setOpenError(false);

    try {
      // Call backend API
      const response = await authService.login(data.email, data.password);

      // Prepare user data object
      const userData = {
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        email: response.user.email,
        id: response.user.id,
        role: response.user.role || "user",
        isEmailVerified: response.user.is_email_verified,
        isLoggedIn: true,
      };

      // Store tokens and user data in sessionStorage for persistence
      setTokens(response.accessToken, response.refreshToken, userData);

      // Dispatch user data to Redux
      dispatch(login(userData));

      setOpenError(false);
      setOpenSuccess(true);
      setTimeout(() => {
        router("/");
      }, 1500);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Login error:", error);
      }
      setErrorMessage(error.message || "Login failed. Please check your credentials.");
      setOpenSuccess(false);
      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBodyWrapper title="Login">
      <RHFForm {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} width="100%">
              <Field.TextField 
                name="email" 
                label="Email Address" 
                fullWidth 
                required 
                disabled={loading}
                placeholder="Enter your email"
              />
            </Grid>
            <Grid item xs={12} width="100%">
              <Field.PasswordField
                name="password"
                label="Password"
                fullWidth
                required
                disabled={loading}
                placeholder="Enter your password"
              />
            </Grid>
            <Grid item xs={12} width="100%">
              <Button 
                fullWidth 
                variant="contained" 
                type="submit" 
                disabled={loading}
                size="large"
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #1a73e8 0%, #1565c0 100%)",
                  boxShadow: "0 4px 12px rgba(26, 115, 232, 0.4)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(26, 115, 232, 0.6)",
                  },
                }}
              >
                {loading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Logging in...
                  </Box>
                ) : (
                  "Login"
                )}
              </Button>
            </Grid>

            <Grid item xs={12} width="100%">
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  New to TaskHub?
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} width="100%">
              <Typography sx={{ textAlign: "center", mb: 1.5 }}>
                <Link
                  onClick={() => !loading && router("signup")}
                  sx={{ 
                    cursor: loading ? "default" : "pointer",
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "#1a73e8",
                    "&:hover": {
                      textDecoration: "underline",
                    }
                  }}
                >
                  Create an account
                </Link>
              </Typography>
            </Grid>

            <Grid item xs={12} width="100%">
              <Typography sx={{ textAlign: "center" }}>
                <Link
                  onClick={() => !loading && router("/auth/forgot-password")}
                  sx={{ 
                    cursor: loading ? "default" : "pointer", 
                    fontSize: "0.9rem",
                    color: "#757575",
                    "&:hover": {
                      color: "#1a73e8",
                    }
                  }}
                >
                  Forgot your password?
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </RHFForm>
      <Snackbar open={openSuccess} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Logged in successfully! Redirecting...
        </Alert>
      </Snackbar>
      <Snackbar open={openError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert
          onClose={handleCloseError}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </AuthBodyWrapper>
  );
}

export default Login;
