// src/redux/tasksSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Initial state for tasks
const initialState = {
  tasks: [], // Initialize as an empty array
};

// Create tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Action to set the tasks (this can be useful for loading tasks initially)
    setTasks: (state, action) => {
      console.log('Current state before setTasks:', JSON.stringify(state.tasks));
      
      // Safely replace the tasks array
      if (Array.isArray(action.payload)) {
        state.tasks = action.payload;
      } else {
        console.error('Payload for setTasks is not an array:', action.payload);
      }

    },
    // Action to assign a task to a child
    assignTask: (state, action) => {
      const { taskId, childName } = action.payload;
      const task = state.tasks.find((task) => task.id === taskId);
      if (task) {
        task.assignedTo = childName;
      }
    },
    // Action to mark a task as completed
    completeTask: (state, action) => {
      const task = state.tasks.find((task) => task.id === action.payload);
      if (task) {
        task.completed = true;
        task.status = 'Completed';
        task.points = 10; // For simplicity, we award 10 points
      }
    },
    moveTask: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find((task) => task.id === taskId);
      if (task) {
        task.status = status;
      }
    },
    addTask: (state, action) => {
        state.tasks.push(action.payload); // Add the task to the tasks array
        console.log('Tasks after adding:', JSON.stringify(state.tasks));

    },
  },
});



// Export the actions
export const { setTasks, assignTask, completeTask, moveTask, addTask } = tasksSlice.actions;

// Export the reducer
export default tasksSlice.reducer;
