import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store/store.js";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { initializeTokens } from "./api/apiClient.js";
import theme from "./theme/theme.js";

// Initialize tokens on app start
initializeTokens();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </Provider>
    </StrictMode>
  </BrowserRouter>,
);
