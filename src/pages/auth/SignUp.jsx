import {
  Button,
  Grid,
  Link,
  Typography,
  Snackbar,
  Alert,
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
    <AuthBodyWrapper title="Signup">
      <RHFForm {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Field.TextField
                name="firstName"
                label="First name"
                fullWidth
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field.TextField
                name="lastName"
                label="Last name"
                fullWidth
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} width="100%">
              <Field.TextField 
                name="email" 
                label="Email" 
                fullWidth 
                required 
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} width="100%">
              <Field.PasswordField
                name="password"
                label="Password"
                fullWidth
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} width="100%">
              <Button 
                fullWidth 
                variant="contained" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </Grid>
            <Grid item xs={12} width="100%">
              <Typography>
                Already have an account?{" "}
                <Link
                  onClick={() => !loading && router("/auth")}
                  sx={{ cursor: loading ? "default" : "pointer" }}
                >
                  Log in
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
