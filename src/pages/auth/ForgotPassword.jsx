import { Button, Grid, Typography, Link, Snackbar, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { FormProvider as RHFForm } from "react-hook-form";
import { Field } from "../../Components/Fields";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthBodyWrapper from "./AuthBodyWrapper";
import authService from "../../api/authService";

// Validation schema for forgot password
const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const forgotPasswordDefaultValues = {
  email: "",
};

function ForgotPassword() {
  const methods = useForm({
    defaultValues: forgotPasswordDefaultValues,
    resolver: zodResolver(ForgotPasswordSchema),
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
      // Call backend API to get reset token
      const response = await authService.forgotPassword(data.email);

      // Store reset token in sessionStorage temporarily
      sessionStorage.setItem("resetToken", response.token);
      
      setSuccessMessage("Reset token generated! Redirecting to password reset...");
      setOpenSuccess(true);

      // Clear form
      methods.reset();

      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        router("/auth/reset-password");
      }, 2000);
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMsg = error?.message || error || "Failed to generate reset token. Please try again.";
      setErrorMessage(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBodyWrapper title="Forgot Password">
      <RHFForm {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} width="100%">
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Enter your email address to reset your password.
              </Typography>
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
              <Button 
                fullWidth 
                variant="contained" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Generating..." : "Get Reset Token"}
              </Button>
            </Grid>
            <Grid item xs={12} width="100%">
              <Typography>
                Remember your password?{" "}
                <Link
                  onClick={() => !loading && router("/auth")}
                  sx={{ cursor: loading ? "default" : "pointer" }}
                >
                  Back to login
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

export default ForgotPassword;
