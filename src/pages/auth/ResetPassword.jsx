import { Button, Grid, Typography, Snackbar, Alert } from "@mui/material";
import { useForm } from "react-hook-form";
import { FormProvider as RHFForm } from "react-hook-form";
import { Field } from "../../Components/Fields";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthBodyWrapper from "./AuthBodyWrapper";
import authService from "../../api/authService";

// Validation schema for reset password
const ResetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const resetPasswordDefaultValues = {
  newPassword: "",
  confirmPassword: "",
};

function ResetPassword() {
  const methods = useForm({
    defaultValues: resetPasswordDefaultValues,
    resolver: zodResolver(ResetPasswordSchema),
  });
  const router = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check for reset token on component mount
  useEffect(() => {
    const token = sessionStorage.getItem("resetToken");
    if (!token) {
      setErrorMessage("No reset token found. Please use forgot password first.");
      setOpenError(true);
      setTimeout(() => {
        router("/auth/forgot-password");
      }, 2000);
    }
  }, [router]);

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
      const token = sessionStorage.getItem("resetToken");
      if (!token) {
        throw new Error("No reset token provided");
      }

      // Call backend API to reset password
      const response = await authService.resetPassword(token, data.newPassword);

      setSuccessMessage(response.message || "Password reset successfully!");
      setOpenSuccess(true);

      // Clear reset token from sessionStorage
      sessionStorage.removeItem("resetToken");

      // Clear form
      methods.reset();

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router("/auth");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMsg = error?.message || error || "Failed to reset password. Token may be expired.";
      setErrorMessage(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBodyWrapper title="Reset Password">
      <RHFForm {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} width="100%">
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Enter your new password below.
              </Typography>
            </Grid>
            <Grid item xs={12} width="100%">
              <Field.PasswordField
                name="newPassword"
                label="New Password"
                fullWidth
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} width="100%">
              <Field.PasswordField
                name="confirmPassword"
                label="Confirm Password"
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
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
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

export default ResetPassword;
