// src/redux/tasksSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Initial state for tasks
const initialState = [
  // Example tasks that would be stored in the Redux state
  { id: 1, title: "Clean Kitchen", assignedTo: "Child 1", completed: false },
  { id: 2, title: "Take out Trash", assignedTo: "Child 1", completed: false },
];

// Create tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Action to set the tasks (this can be useful for loading tasks initially)
    setTasks: (state, action) => {
      return action.payload;
    },
    // Action to assign a task to a child
    assignTask: (state, action) => {
      const { taskId, childName } = action.payload;
      const task = state.find((task) => task.id === taskId);
      if (task) {
        task.assignedTo = childName;
      }
    },
    // Action to mark a task as completed
    completeTask: (state, action) => {
      const task = state.find((task) => task.id === action.payload);
      if (task) {
        task.completed = true;
      }
    },
  },
});

// Export the actions
export const { setTasks, assignTask, completeTask } = tasksSlice.actions;

// Export the reducer
export default tasksSlice.reducer;
