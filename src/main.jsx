import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store/store.js";
import { Provider } from "react-redux";
import { CssBaseline } from "@mui/material";
import { initializeTokens } from "./api/apiClient.js";

// Initialize tokens on app start
initializeTokens();

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <StrictMode>
      <Provider store={store}>
        <CssBaseline />
        <App />
      </Provider>
    </StrictMode>
  </BrowserRouter>,
);
