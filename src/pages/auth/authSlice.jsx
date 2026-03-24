import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    firstName: "",
    lastName: "",
    email: "",
    id: "",
    role: "user",
    isLoggedIn: false,
  },
  reducers: {
    login: (state, action) => {
      state.email = action.payload.email;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.id = action.payload.id;
      state.role = action.payload.role ?? "user";
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.email = "";
      state.firstName = "";
      state.lastName = "";
      state.id = "";
      state.role = "user";
      state.isLoggedIn = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export const authReducer = authSlice.reducer;
