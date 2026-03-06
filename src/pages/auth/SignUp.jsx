import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { FormProvider as RHFForm } from "react-hook-form";
import { Field } from "../../Components/TextFields";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema } from "./authValidationSchemas";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import AuthBodyWrapper from "./AuthBodyWrapper";

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
  console.log("passwerd", methods.watch("password"));
  const onSubmit = (data) => {
    const id = uuidv4();
    const existingData = JSON.parse(localStorage.getItem("userData")) || [];
    const newData = {
      ...data,
      id,
    };
    console.log("Submitted data:", newData);
    localStorage.setItem(
      "userData",
      JSON.stringify([...existingData, newData]),
    );
    localStorage.getItem("IDs")
      ? localStorage.setItem(
          "IDs",
          JSON.stringify([...JSON.parse(localStorage.getItem("IDs")), id]),
        )
      : localStorage.setItem("IDs", JSON.stringify([id]));

    router("/");
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Field.TextField
                name="lastName"
                label="Last name"
                fullWidth
                required
              />
            </Grid>
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
                Sign Up
              </Button>
            </Grid>
            <Grid item xs={12} width="100%">
              <Typography>
                Already have an account?{" "}
                <Link
                  onClick={() => router("/auth")}
                  sx={{ cursor: "pointer" }}
                >
                  Log in
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </form>
      </RHFForm>
    </AuthBodyWrapper>
  );
}

export default SignUp;
