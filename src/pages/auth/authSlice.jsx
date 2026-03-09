import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    firstName: "",
    lastName: "",
    email: "",
    id: "",
    isLoggedIn: false,
  },
  reducers: {
    login: (state, action) => {
      state.email = action.payload.email;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
      state.id = action.payload.id;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.email = "";
      state.firstName = "";
      state.lastName = "";
      state.id = "";
      state.isLoggedIn = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export const authReducer = authSlice.reducer;
