import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  familyId: null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      // Ensure the action payload is valid
   
      const { user, familyId } = action.payload;
      state.user = user;
      state.familyId = familyId;    
    },
    logout: (state) => {
      state.user = null;
      state.familyId = null;
    }, // Clear user on logout
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
