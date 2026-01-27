import { Card, CardContent, CardHeader, Grid, TextField } from "@mui/material";

function SignUp() {
  return (
    <Card>
      <CardHeader title="Sign Up" />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField name="firstName" label="First name" fullWidth required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField name="lastName" label="Last name" fullWidth required />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default SignUp;
