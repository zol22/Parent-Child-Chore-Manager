import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: null, // Default state is null, no user logged in initially
  reducers: {
    setUser: (state, action) => action.payload,// Updates state with user data
    clearUser: () => null,// Clears user data (for logging out)
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
