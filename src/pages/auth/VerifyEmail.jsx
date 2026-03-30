import { Button, Grid, Typography, Snackbar, Alert, CircularProgress, Box } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthBodyWrapper from "./AuthBodyWrapper";
import authService from "../../api/authService";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const router = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          setError("No verification token provided");
          setLoading(false);
          return;
        }

        // Call backend API to verify email
        await authService.verifyEmail(token);
        setVerified(true);
        setOpenSnackbar(true);

        // Redirect to login after 2 seconds
        setTimeout(() => {
          router("/auth");
        }, 2000);
      } catch (err) {
        console.error("Verification error:", err);
        setError(err.message || "Email verification failed. Token may be expired.");
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    verifyEmailToken();
  }, [searchParams, router]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <AuthBodyWrapper title="Verify Email">
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        {loading ? (
          <>
            <CircularProgress />
            <Typography>Verifying your email...</Typography>
          </>
        ) : verified ? (
          <>
            <Typography variant="h6" color="success.main">
              ✓ Email verified successfully!
            </Typography>
            <Typography>
              Redirecting you to login...
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h6" color="error">
              ✗ Verification Failed
            </Typography>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="contained" 
              onClick={() => router("/auth")}
              sx={{ mt: 2 }}
            >
              Back to Login
            </Button>
          </>
        )}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert
          onClose={handleClose}
          severity={verified ? "success" : "error"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {verified ? "Email verified! Redirecting to login..." : error}
        </Alert>
      </Snackbar>
    </AuthBodyWrapper>
  );
}

export default VerifyEmail;
