import { Box, Card, CardContent, CardHeader, Container } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const AuthBodyWrapper = ({ title, children }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        py: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardHeader
            sx={{
              textAlign: "center",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
              py: 3,
              px: 2,
            }}
            title={title}
            titleTypographyProps={{
              variant: "h4",
              sx: { fontWeight: 700, color: theme.palette.primary.dark }
            }}
          />
          <CardContent sx={{ p: 4 }}>{children}</CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AuthBodyWrapper;
