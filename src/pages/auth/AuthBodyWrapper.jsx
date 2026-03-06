import { Box, Card, CardContent, CardHeader } from "@mui/material";

const AuthBodyWrapper = ({title, children }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "90vh",
      }}
    >
      <Card sx={{ maxWidth: 500 }}>
        <CardHeader sx={{ textAlign: "center" }} title={title} />
        <CardContent>{children}</CardContent>
      </Card>
    </Box>
  );
};

export default AuthBodyWrapper;
