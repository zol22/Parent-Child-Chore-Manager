import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      // Ensure the action payload is valid
      if (!action.payload) {
        throw new Error("Invalid user data.");
      }
      return action.payload; // Update the state with the new user data
    },
    logout: () => null, // Clear user on logout
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
