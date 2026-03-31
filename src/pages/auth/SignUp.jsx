import {
  Button,
  Grid,
  Link,
  Typography,
  Snackbar,
  Alert,
  Box,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { FormProvider as RHFForm } from "react-hook-form";
import { Field } from "../../Components/Fields";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema } from "./authValidationSchemas";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthBodyWrapper from "./AuthBodyWrapper";
import authService from "../../api/authService";

const signUpDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

function SignUp() {
  const methods = useForm({
    defaultValues: signUpDefaultValues,
    resolver: zodResolver(SignUpSchema),
  });
  const router = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSuccess(false);
    setOpenError(false);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Call backend API to signup
      const response = await authService.signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      // Success - show message
      setSuccessMessage(response.message || "Account created! Please check your email to verify.");
      setOpenSuccess(true);

      // Clear form
      methods.reset();

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router("/auth");
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage(error.message || "Signup failed. Please try again.");
      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBodyWrapper title="Create Account">
      <RHFForm {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Field.TextField
                name="firstName"
                label="First Name"
                fullWidth
                required
                disabled={loading}
                placeholder="John"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field.TextField
                name="lastName"
                label="Last Name"
                fullWidth
                required
                disabled={loading}
                placeholder="Doe"
              />
            </Grid>
            <Grid item xs={12} width="100%">
              <Field.TextField 
                name="email" 
                label="Email Address" 
                fullWidth 
                required 
                disabled={loading}
                placeholder="john.doe@example.com"
              />
            </Grid>
            <Grid item xs={12} width="100%">
              <Field.PasswordField
                name="password"
                label="Password"
                fullWidth
                required
                disabled={loading}
                placeholder="Create a strong password"
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
                    Creating Account...
                  </Box>
                ) : (
                  "Create Account"
                )}
              </Button>
            </Grid>

            <Grid item xs={12} width="100%">
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Already have an account?
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} width="100%">
              <Typography sx={{ textAlign: "center" }}>
                <Link
                  onClick={() => !loading && router("/auth")}
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
                  Sign in to your account
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
          {openError ? errorMessage : successMessage}
        </Alert>
      </Snackbar>
    </AuthBodyWrapper>
  );
}

export default SignUp;
