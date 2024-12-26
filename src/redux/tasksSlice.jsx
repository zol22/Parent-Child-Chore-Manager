// src/redux/tasksSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Initial state for tasks
const initialState = {
  tasks: [], // Initialize as an empty array
  children: [], // List of children fetched by familyId
};

// Create tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Action to set the tasks (this can be useful for loading tasks initially)
    setTasks: (state, action) => {
     // console.log('Current state before setTasks:', JSON.stringify(state.tasks));
      
      // Safely replace the tasks array
      if (Array.isArray(action.payload)) {
        state.tasks = action.payload;
      } else {
        console.error('Payload for setTasks is not an array:', action.payload);
      }

    },
    setChildren: (state, action) => {
      state.children = action.payload;
      console.log(JSON.stringify(state.children))
    },
    addChild: (state,action) => {
      const newChild = action.payload; // Expecting a child object like { name: 'John', points: 0 }
      state.children.push(newChild); // Append the new child to the existing children array
      console.log('Children after adding:', JSON.stringify(state.children));
    },
    removeChild: (state,action) => {
      state.children = state.children.filter((child) => child.id !== action.payload)
    },
    // Action to assign a task to a child
    assignTask: (state, action) => {
      const { taskId, assignedTo } = action.payload;
      const task = state.tasks.find((task) => task.id === taskId);
      if (task) {
        task.assignedTo = assignedTo || "Unassigned"; // Safely mutating via Immer
      }
      console.log("State from assignTask reducer:" + JSON.stringify(state))
     // console.log("Reducer Input:", action.payload);
      //console.log("Updated Tasks:", JSON.stringify(state.tasks));
    },
    // Action to mark a task as completed
    completeTask: (state, action) => {
      const task = state.tasks.find((task) => task.id === action.payload);
      if (task) {
        task.status = 'Completed';
       // task.points = 10; // For simplicity, we award 10 points
        const child = state.children.find(child => child.name === task.assignedTo);
        if (child) {
          child.points = (child.points || 0) + task.points;
        }
        console.log("State from completeTask reducer:" + JSON.stringify(state))
        //console.log("Showing all tasks from Completedtask: ", JSON.stringify(state.tasks))
        //console.log("Child points", child.points)
      }
    },
    removePointsFromChild: (state, action) => {
      const { taskId, assignedTo, destinationStatus} = action.payload;
      const task = state.tasks.find((task) => task.id === taskId);
      const child = state.children.find((child) => child.name === assignedTo);

      if (task && child) {
        task.status = destinationStatus; // Update the task status to the new destination
        child.points = Math.max((child.points || 0) - task.points, 0); // Deduct points from child when task is moved back, Avoid negative points
       // task.points = 0; // Reset the points for the task, as it's no longer completed

      }
      console.log("Removing the points from the task...", JSON.stringify(task))
      console.log("Child Points: ",child.points)
    },
    updateTaskStatus: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find((task) => task.id === taskId);
      if (task) {
        task.status = status; // Update task status
      }
      console.log("State from updateTaskStatus reducer:" + JSON.stringify(state))

    },
    moveTask: (state, action) => {
      const { taskId, status} = action.payload;
      const task = state.tasks.find((task) => task.id === taskId);
      if (task) {
        task.status = status;
      
      }
      console.log("State from moveTask reducer:" + JSON.stringify(state))

    },
    addTask: (state, action) => {
        state.tasks.push(action.payload); // Add the task to the tasks array
        console.log('Tasks after adding:', JSON.stringify(state.tasks));

    },
  },
});



// Export the actions
export const { setTasks, setChildren, addChild,removeChild, assignTask, completeTask,removePointsFromChild, updateTaskStatus, moveTask, addTask } = tasksSlice.actions;

// Export the reducer
export default tasksSlice.reducer;
