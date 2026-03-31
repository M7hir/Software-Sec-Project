import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#1a73e8",
      light: "#5791f9",
      dark: "#1565c0",
      contrastText: "#fff",
    },
    secondary: {
      main: "#f57c00",
      light: "#ffb74d",
      dark: "#e65100",
      contrastText: "#fff",
    },
    success: {
      main: "#2e7d32",
      light: "#66bb6a",
      dark: "#1b5e20",
    },
    warning: {
      main: "#f57c00",
      light: "#ffb74d",
      dark: "#e65100",
    },
    error: {
      main: "#d32f2f",
      light: "#ef5350",
      dark: "#c62828",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
      disabled: "#bdbdbd",
    },
    divider: "#e0e0e0",
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      letterSpacing: "-1.5px",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      letterSpacing: "0px",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      letterSpacing: "0.25px",
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      letterSpacing: "0px",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      letterSpacing: "0.125px",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontSize: "0.95rem",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 16px",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        },
        contained: {
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1a73e8",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f5f5",
          "& .MuiTableCell-head": {
            fontWeight: 700,
            color: "#212121",
            fontSize: "0.9rem",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.2s",
          "&:hover": {
            backgroundColor: "#fafafa",
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontSize: "0.95rem",
        },
      },
    },
  },
});

export default theme;
